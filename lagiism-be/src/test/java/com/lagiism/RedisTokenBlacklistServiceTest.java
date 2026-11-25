package com.lagiism;

import com.lagiism.auth.security.RedisTokenBlacklistService;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class RedisTokenBlacklistServiceTest {

    @Test
    @SuppressWarnings("unchecked")
    void blacklistStoresKeyWithTtlAndChecksRedis() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOps = mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(redisTemplate.hasKey("jwt:blacklist:jti-123")).thenReturn(true);

        RedisTokenBlacklistService service = new RedisTokenBlacklistService(redisTemplate);
        Duration ttl = Duration.ofMinutes(15);

        service.blacklist("jti-123", ttl);

        verify(valueOps).set("jwt:blacklist:jti-123", "revoked", ttl);
        assertThat(service.isBlacklisted("jti-123")).isTrue();
    }
}
