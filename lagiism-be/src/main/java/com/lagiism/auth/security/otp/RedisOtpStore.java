package com.lagiism.auth.security.otp;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

@Service
@ConditionalOnProperty(name = "app.redis.blacklist-enabled", havingValue = "true", matchIfMissing = true)
public class RedisOtpStore implements OtpStore {

    private static final String OTP_PREFIX = "auth:otp:";
    private static final String ATTEMPTS_PREFIX = "auth:otp:attempts:";
    private static final int MAX_ATTEMPTS = 5;

    private static final DefaultRedisScript<Long> SAVE_OTP_SCRIPT = new DefaultRedisScript<>(
            """
            redis.call('SET', KEYS[1], ARGV[1], 'EX', tonumber(ARGV[2]))
            redis.call('DEL', KEYS[2])
            return 1
            """,
            Long.class
    );

    private static final DefaultRedisScript<Long> VERIFY_AND_CONSUME_SCRIPT = new DefaultRedisScript<>(
            """
            local stored = redis.call('GET', KEYS[1])
            if not stored then
                return 0
            end
            local attempts = tonumber(redis.call('GET', KEYS[2]) or '0')
            local maxAttempts = tonumber(ARGV[2])
            if attempts >= maxAttempts then
                redis.call('DEL', KEYS[1])
                redis.call('DEL', KEYS[2])
                return -1
            end
            if stored == ARGV[1] then
                redis.call('DEL', KEYS[1])
                redis.call('DEL', KEYS[2])
                return 1
            end
            local newAttempts = redis.call('INCR', KEYS[2])
            local ttl = redis.call('TTL', KEYS[1])
            if ttl > 0 then
                redis.call('EXPIRE', KEYS[2], ttl)
            end
            if newAttempts >= maxAttempts then
                redis.call('DEL', KEYS[1])
                return -1
            end
            return 0
            """,
            Long.class
    );

    private final StringRedisTemplate redisTemplate;

    public RedisOtpStore(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public void saveOtp(String email, String otpHash, Duration ttl) {
        String key = normalize(email);
        long ttlSeconds = Math.max(1L, ttl.toSeconds());
        redisTemplate.execute(
                SAVE_OTP_SCRIPT,
                List.of(OTP_PREFIX + key, ATTEMPTS_PREFIX + key),
                otpHash,
                String.valueOf(ttlSeconds)
        );
    }

    @Override
    public VerifyResult verifyAndConsume(String email, String otpHash) {
        String key = normalize(email);
        Long code = redisTemplate.execute(
                VERIFY_AND_CONSUME_SCRIPT,
                List.of(OTP_PREFIX + key, ATTEMPTS_PREFIX + key),
                otpHash,
                String.valueOf(MAX_ATTEMPTS)
        );
        if (code == null || code == 0L) {
            return VerifyResult.INVALID_OR_EXPIRED;
        }
        if (code == 1L) {
            return VerifyResult.VALID;
        }
        return VerifyResult.TOO_MANY_ATTEMPTS;
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
