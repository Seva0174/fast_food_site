package com.fast_food.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration // class qui cree des bean au demarrage de App
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Désactiver le CSRF pour une API REST Stateless
            .csrf(csrf -> csrf.disable())

            // 2. Définir la gestion de session en Stateless (pas de session HTTP)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 3. Règles d'autorisation
            .authorizeHttpRequests(auth -> auth
                // Auth endpoints
                .requestMatchers("/api/auth/**").permitAll()
                
                // Consultation de la carte / catégories (Public)
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/produits/**").permitAll()

                // Modification du menu (Réservé ADMIN)
                .requestMatchers(HttpMethod.POST, "/api/categories/**", "/api/produits/**").hasRole("admin")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/produits/**").hasRole("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/categories/**", "/api/produits/**").hasRole("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/produits/**").hasRole("admin")

                .anyRequest().authenticated()
            )
            // Filtre JWT
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    //Encoder pour mdp
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}