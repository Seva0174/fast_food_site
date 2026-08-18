package com.fast_food.config;

import com.fast_food.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    //service qui s'occupe de decoder / vérifier le JWT
    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // header de la requete
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;
        
        //si pas de token ou format invalide
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }
        //recup le token et email
        jwt = authHeader.substring(7);
        userEmail = jwtService.extractUsername(jwt);
        try{
            //si email est valide et l'user n'est pas deja authentifier
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                
                //recup le role
                String role = jwtService.extractClaim(jwt, claims -> claims.get("role", String.class));
                
                //Conversion du rôle sous forme de GrantedAuthority
                var authorities = role != null 
                        ? Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                        : Collections.<SimpleGrantedAuthority>emptyList();
                
                //création de l'objet d'authentification pour Spring Security avec l'email et les rôles
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userEmail,
                        null,
                        authorities
                );
                //ajout des détails de la requête HTTP (ex: adresse IP, session) à l'objet d'authentification
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                //enregistrement de l'utilisateur authentifié dans le contexte global de Spring Security
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }catch(Exception e) {
            SecurityContextHolder.clearContext();
        }
        //Passage au filtre suivant dans la chaîne de sécurité ou au Controller
        filterChain.doFilter(request, response);
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/");
    }
}