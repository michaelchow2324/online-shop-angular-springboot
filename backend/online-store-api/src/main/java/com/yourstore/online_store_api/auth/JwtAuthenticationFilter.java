package com.yourstore.online_store_api.auth;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Runs once per HTTP request (before controllers).
 *
 * Job: if the request has {@code Authorization: Bearer <jwt>}, validate it and put
 * a {@link CustomerPrincipal} into Spring Security's {@link SecurityContextHolder}.
 *
 * After this filter:
 * - Controllers can use {@code @AuthenticationPrincipal CustomerPrincipal}
 * - {@code SecurityConfig} rules like {@code .authenticated()} / {@code hasRole("ADMIN")} work
 *
 * Registered in SecurityConfig with {@code addFilterBefore(..., UsernamePasswordAuthenticationFilter)}.
 * We use OncePerRequestFilter so forwarding / async dispatch does not run this twice.
 */

/*
With the filter
Every request hits the filter before the controller:

Browser/App
   │  Authorization: Bearer eyJhbGciOi...
   ▼
JwtAuthenticationFilter     ← reads header, checks JWT
   │  if valid → put CustomerPrincipal in SecurityContext
   ▼
SecurityConfig              ← “is this path allowed for this user?”
   ▼
MeController                ← @AuthenticationPrincipal → principal.id()

What it actually does (3 steps)
1. Look for header: Authorization: Bearer <token>
2. If present and signature/expiry OK → build CustomerPrincipal (id, email, role) and store it in SecurityContextHolder
3. Always call filterChain.doFilter(...) so the request continues
*/

/*
Layer	                                                               Job
JWT (JwtService)                                                       Prove identity in a portable token (login issues it; filter reads it)
Spring Security (SecurityConfig + SecurityContext)                     Authenticate + authorize the request
*/
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        // Expected shape: "Bearer eyJhbGciOi..." — first 7 chars are "Bearer "
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            if (!token.isEmpty() && jwtService.isValid(token)
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                CustomerPrincipal principal = jwtService.parsePrincipal(token);

                // Spring expects authorities named ROLE_* for hasRole("ADMIN") checks
                /*
                This line tells Spring Security what permissions this user has.
                principal.role() is the role of the user, which is "USER" or "ADMIN".
                Why ROLE_?
                In SecurityConfig you have:  .requestMatchers("/api/admin/**").hasRole("ADMIN")
                hasRole("ADMIN") looks for authority ROLE_ADMIN (Spring adds the ROLE_ prefix for you).
                */
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + principal.role()));

                // principal = who am i?; credentials = null (already authenticated via JWT);
                // authorities = what they are allowed to do
                var authentication = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        // Always continue the chain — missing/invalid token just means "anonymous"
        // (protected endpoints will then get 401 from SecurityConfig)
        filterChain.doFilter(request, response);
    }
}
