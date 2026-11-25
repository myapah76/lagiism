package com.lagiism.auth.security;

import com.lagiism.account.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    public static final String CLAIM_UID = "uid";
    public static final String CLAIM_ROLE = "role";
    public static final String CLAIM_ROLES = "roles";
    public static final String CLAIM_TYPE = "type";
    public static final String TYPE_ACCESS = "ACCESS";
    public static final String TYPE_REFRESH = "REFRESH";

    private final SecretKey signingKey;
    private final long accessExpirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-expiration-ms:900000}") long accessExpirationMs,
            @Value("${app.jwt.refresh-expiration-ms:604800000}") long refreshExpirationMs
    ) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(secret.getBytes(StandardCharsets.UTF_8));
            this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize JWT signing key", e);
        }
        this.accessExpirationMs = accessExpirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(User user) {
        return buildToken(user, TYPE_ACCESS, accessExpirationMs);
    }

    public String generateRefreshToken(User user) {
        return buildToken(user, TYPE_REFRESH, refreshExpirationMs);
    }

    public long getAccessExpirationMs() {
        return accessExpirationMs;
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Duration getRemainingTtl(Claims claims) {
        Date exp = claims.getExpiration();
        if (exp == null) {
            return Duration.ZERO;
        }
        long remainingMs = exp.toInstant().toEpochMilli() - Instant.now().toEpochMilli();
        return remainingMs > 0 ? Duration.ofMillis(remainingMs) : Duration.ZERO;
    }

    private String buildToken(User user, String tokenType, long ttlMs) {
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(ttlMs);
        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getEmail())
                .claim(CLAIM_UID, user.getId())
                .claim(CLAIM_ROLE, user.getPrimaryRole())
                .claim(CLAIM_ROLES, user.getRoleNames())
                .claim(CLAIM_TYPE, tokenType)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }
}
