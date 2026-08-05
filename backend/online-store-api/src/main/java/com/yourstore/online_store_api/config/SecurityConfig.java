package com.yourstore.online_store_api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.yourstore.online_store_api.auth.JwtAuthenticationFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:4200}")
    private String allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(parseOrigins(allowedOrigins));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    private static List<String> parseOrigins(String origins) {
        return Arrays.stream(origins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    /**
     * Central Spring Security rules for the API (guide 05 step 5).
     *
     * Request path:
     *   JwtAuthenticationFilter (may set SecurityContext from Bearer JWT)
     *   → these authorizeHttpRequests rules
     *   → controller
     *
     * Rules are evaluated top → bottom; first match wins.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
                // Use the CorsConfigurationSource bean above (Angular on :4200)
                .cors(Customizer.withDefaults())

                // CSRF protects cookie/session form posts. We use Bearer JWT (no session cookie),
                // so CSRF is not needed and would break SPA API calls if left on.
                .csrf(csrf -> csrf.disable())

                // No HttpSession — each request authenticates via JWT (or stays anonymous).
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Infra / docs — always public
                        .requestMatchers(
                                "/error",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/**"
                        ).permitAll()

                        // Auth entry points — must be public or nobody could register/login
                        .requestMatchers(HttpMethod.POST,
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-email"
                        ).permitAll()

                        // Catalog + checkout plumbing — guests can browse and pay
                        .requestMatchers(
                                "/api/products/**",
                                "/api/categories/**",
                                "/api/shipping/**",
                                "/api/checkout/**",
                                "/api/payments/stripe/**", // Stripe webhook (no JWT; verified by signature)
                                "/api/instagram/**"
                        ).permitAll()

                        // Guest create order + success-page lookup by order number
                        .requestMatchers("/api/orders/**").permitAll()

                        // Logged-in account area — SecurityContext must have an Authentication
                        // (JwtAuthenticationFilter puts CustomerPrincipal there when Bearer is valid)
                        .requestMatchers("/api/me/**").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()

                        // hasRole("ADMIN") requires authority ROLE_ADMIN (see JWT filter)
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Anything else under the app requires login (safe default)
                        .anyRequest().authenticated()
                )

                // We don't use browser HTTP Basic popups
                .httpBasic(AbstractHttpConfigurer::disable)

                // Run our JWT filter before Spring's username/password filter so
                // SecurityContext is populated early for .authenticated() / hasRole checks
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
