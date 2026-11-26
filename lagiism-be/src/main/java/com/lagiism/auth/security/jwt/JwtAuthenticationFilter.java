package com.lagiism.auth.security.jwt;

import com.lagiism.auth.security.blacklist.TokenBlacklistService;
import com.lagiism.shared.ApiResponse;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtService.parseClaims(token);
            String tokenType = claims.get(JwtService.CLAIM_TYPE, String.class);
            if (!JwtService.TYPE_ACCESS.equals(tokenType)) {
                writeUnauthorized(response, "Invalid token type");
                return;
            }

            String jti = claims.getId();
            if (tokenBlacklistService.isBlacklisted(jti)) {
                writeUnauthorized(response, "Token has been revoked");
                return;
            }

            String email = claims.getSubject();
            List<SimpleGrantedAuthority> authorities = extractAuthorities(claims);
            if (email != null && !authorities.isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(email, null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (JwtException | IllegalArgumentException ex) {
            writeUnauthorized(response, "Invalid or expired JWT token");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private List<SimpleGrantedAuthority> extractAuthorities(Claims claims) {
        Object rolesObj = claims.get(JwtService.CLAIM_ROLES);
        if (rolesObj instanceof Collection<?> col && !col.isEmpty()) {
            return col.stream()
                    .map(String::valueOf)
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .toList();
        }
        String singleRole = claims.get(JwtService.CLAIM_ROLE, String.class);
        if (singleRole != null && !singleRole.isBlank()) {
            return List.of(new SimpleGrantedAuthority("ROLE_" + singleRole));
        }
        return List.of();
    }

    private void writeUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), ApiResponse.error(message));
    }
}
