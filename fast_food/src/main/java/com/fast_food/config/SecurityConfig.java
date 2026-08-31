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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints publics (Auth, Menu)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/produits/**").permitAll()

                // Panier & Commandes Client
                .requestMatchers("/api/panier/**").authenticated()
                .requestMatchers("/api/commandes/admin/**").hasAnyRole("admin", "employe")
                
                .requestMatchers("/api/commandes", "/api/commandes/**").authenticated()
                
                // Endpoints Admin & Approvisionnement
                .requestMatchers("/api/admin/**").hasRole("admin")
                .requestMatchers(HttpMethod.POST, "/api/categories/**", "/api/produits/**").hasRole("admin")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**", "/api/produits/**").hasRole("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/categories/**", "/api/produits/**").hasRole("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**", "/api/produits/**").hasRole("admin")
                

                // Tout le reste requiert une authentification
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}