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
                // Endpoints publics (Auth, Menu)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/produits/**").permitAll()

                // Panier & Commandes Client (Utilisateurs connectés)
                .requestMatchers("/api/panier/**").authenticated()
                .requestMatchers("/api/commandes/mes-commandes", "/api/commandes/{commandeId}").authenticated()

                //Endpoints Admin / Employé 
                .requestMatchers(HttpMethod.POST, "/api/categories/**", "/api/produits/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/produits/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/categories/**", "/api/produits/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/produits/**").hasAuthority("admin")
                
                .requestMatchers("/api/commandes/admin/**").hasAnyAuthority("admin", "employe")

                // Tout le reste requiert une authentification
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