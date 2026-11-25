package com.lagiism.auth.security;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ConditionalOnProperty(name = "app.redis.blacklist-enabled", havingValue = "false")
public class InMemoryTokenBlacklistService implements TokenBlacklistService {

    private final Map<String, Instant> blacklist = new ConcurrentHashMap<>();

    @Override
    public void blacklist(String jti, Duration ttl) {
        if (jti == null || jti.isBlank() || ttl == null || ttl.isZero() || ttl.isNegative()) {
            return;
        }
        blacklist.put(jti, Instant.now().plus(ttl));
    }

    @Override
    public boolean isBlacklisted(String jti) {
        if (jti == null || jti.isBlank()) {
            return false;
        }
        Instant expiresAt = blacklist.get(jti);
        if (expiresAt == null) {
            return false;
        }
        if (expiresAt.isBefore(Instant.now())) {
            blacklist.remove(jti);
            return false;
        }
        return true;
    }
}
