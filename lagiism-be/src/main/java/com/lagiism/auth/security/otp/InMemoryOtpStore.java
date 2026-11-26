package com.lagiism.auth.security.otp;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@ConditionalOnProperty(name = "app.redis.blacklist-enabled", havingValue = "false")
public class InMemoryOtpStore implements OtpStore {

    private static final int MAX_ATTEMPTS = 5;

    private record OtpEntry(String hash, Instant expiresAt, int attempts) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();

    @Override
    public void saveOtp(String email, String otpHash, Duration ttl) {
        String key = email.trim().toLowerCase(Locale.ROOT);
        store.put(key, new OtpEntry(otpHash, Instant.now().plus(ttl), 0));
    }

    @Override
    public VerifyResult verifyAndConsume(String email, String otpHash) {
        String key = email.trim().toLowerCase(Locale.ROOT);
        OtpEntry entry = store.get(key);
        if (entry == null || entry.expiresAt().isBefore(Instant.now())) {
            store.remove(key);
            return VerifyResult.INVALID_OR_EXPIRED;
        }
        if (entry.attempts() >= MAX_ATTEMPTS) {
            store.remove(key);
            return VerifyResult.TOO_MANY_ATTEMPTS;
        }
        if (entry.hash().equals(otpHash)) {
            store.remove(key);
            return VerifyResult.VALID;
        }
        int nextAttempts = entry.attempts() + 1;
        if (nextAttempts >= MAX_ATTEMPTS) {
            store.remove(key);
            return VerifyResult.TOO_MANY_ATTEMPTS;
        }
        store.put(key, new OtpEntry(entry.hash(), entry.expiresAt(), nextAttempts));
        return VerifyResult.INVALID_OR_EXPIRED;
    }
}
