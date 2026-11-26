package com.lagiism;

import com.lagiism.auth.security.otp.OtpStore;
import com.lagiism.auth.security.otp.RedisOtpStore;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class RedisOtpStoreTest {

    @Test
    @SuppressWarnings("unchecked")
    void saveAndVerifyExecuteAtomicLuaScriptsWithFiveMinuteTtl() {
        StringRedisTemplate redisTemplate = mock(StringRedisTemplate.class);
        RedisOtpStore store = new RedisOtpStore(redisTemplate);

        List<String> expectedKeys = List.of("auth:otp:khoi@lagiism.vn", "auth:otp:attempts:khoi@lagiism.vn");

        store.saveOtp("Khoi@Lagiism.vn", "hashed-otp", Duration.ofMinutes(5));
        verify(redisTemplate).execute(any(RedisScript.class), eq(expectedKeys), eq("hashed-otp"), eq("300"));

        when(redisTemplate.execute(any(RedisScript.class), eq(expectedKeys), eq("hashed-otp"), eq("5")))
                .thenReturn(1L);
        assertThat(store.verifyAndConsume("khoi@lagiism.vn", "hashed-otp"))
                .isEqualTo(OtpStore.VerifyResult.VALID);

        when(redisTemplate.execute(any(RedisScript.class), eq(expectedKeys), eq("wrong"), eq("5")))
                .thenReturn(0L);
        assertThat(store.verifyAndConsume("khoi@lagiism.vn", "wrong"))
                .isEqualTo(OtpStore.VerifyResult.INVALID_OR_EXPIRED);

        when(redisTemplate.execute(any(RedisScript.class), eq(expectedKeys), eq("wrong"), eq("5")))
                .thenReturn(-1L);
        assertThat(store.verifyAndConsume("khoi@lagiism.vn", "wrong"))
                .isEqualTo(OtpStore.VerifyResult.TOO_MANY_ATTEMPTS);
    }
}
