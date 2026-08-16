package com.fast_food.service;

import com.fast_food.dto.AuthResponse;
import com.fast_food.dto.LoginRequest;
import com.fast_food.dto.RegisterRequest;
import com.fast_food.entite.User;
import com.fast_food.mapper.UserMapper;
import com.fast_food.repositorie.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    /**
     * Inscription d'un nouvel utilisateur (sans vérification par e-mail)
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est déjà utilisé.");
        }

        // 2. Mapper le DTO en Entité User
        User user = userMapper.toEntity(request);

        // 3. Encoder le mot de passe
        user.setMdp(passwordEncoder.encode(request.getMdp()));

        // 4. Définir les valeurs par défaut
        user.setEstVerif(true); // Compte vérifié automatiquement
        user.setDateCreation(LocalDateTime.now());
        user.setRole(User.Role.CLIENT); // Rôle CLIENT par défaut

        // 5. Sauvegarder l'utilisateur en BDD
        User savedUser = userRepository.save(user);

        // 6. Générer le JWT
        String jwtToken = jwtService.generateToken(savedUser);

        // 7. Retourner la réponse
        return userMapper.toAuthResponse(savedUser, jwtToken);
    }

    /**
     * Connexion d'un utilisateur existant
     */
    public AuthResponse login(LoginRequest request) {
        // 1. Chercher l'utilisateur par email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Email ou mot de passe incorrect."));

        // 2. Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getMdp(), user.getMdp())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect.");
        }

        // 3. Générer le JWT
        String jwtToken = jwtService.generateToken(user);

        // 4. Retourner la réponse
        return userMapper.toAuthResponse(user, jwtToken);
    }
}