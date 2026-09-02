package com.fast_food.service;

import com.fast_food.dto.AuthResponse;
import com.fast_food.dto.LoginRequest;
import com.fast_food.dto.RegisterRequest;
import com.fast_food.entite.EmailVerificationToken;
import com.fast_food.entite.User;
import com.fast_food.mapper.UserMapper;
import com.fast_food.repositorie.EmailVerificationTokenRepository;
import com.fast_food.repositorie.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailVerificationTokenRepository tokenRepository;
    private final EmailService emailService;

    //Inscription d'un nouvel utilisateur
    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }

        User user = userMapper.toEntity(request);
        user.setMdp(passwordEncoder.encode(request.getMdp()));
        user.setEstVerif(false); 
        user.setDateCreation(LocalDateTime.now());
        user.setRole(User.Role.client);

        User savedUser = userRepository.save(user);

        // Génération du token de vérification (ex. valide 24h)
        String tokenValue = UUID.randomUUID().toString();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setUser(savedUser);
        token.setToken(tokenValue);
        token.setExpireLe(LocalDateTime.now().plusDays(1));
        tokenRepository.save(token);

        // Envoi de l'e-mail de confirmation
        emailService.envoyerMailVerification(savedUser.getEmail(), tokenValue);

        return "Inscription réussie. Veuillez vérifier votre boîte mail pour activer votre compte.";
    }

    //Connexion d'un utilisateur existant
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect."));

        if (!passwordEncoder.matches(request.getMdp(), user.getMdp())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect.");
        }

        // Blocage si le mail n'a pas été confirmé
        if (!user.isEstVerif()) {
            throw new IllegalStateException("Veuillez vérifier votre compte par e-mail avant de vous connecter.");
        }

        String jwtToken = jwtService.generateToken(user);
        return userMapper.toAuthResponse(user, jwtToken);
    }

    @Transactional
    public void verifyEmail(String tokenValue) {
        EmailVerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new IllegalArgumentException("Token de vérification invalide."));

        if (token.getExpireLe().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Le token de vérification a expiré.");
        }

        User user = token.getUser();
        user.setEstVerif(true);
        userRepository.save(user);

        // Supprime le token après validation pour éviter toute réutilisation
        tokenRepository.delete(token);
    }
}