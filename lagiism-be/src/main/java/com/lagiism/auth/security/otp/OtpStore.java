package com.lagiism.auth.security.otp;

import java.time.Duration;

public interface OtpStore {

    enum VerifyResult {
        VALID,
        INVALID_OR_EXPIRED,
        TOO_MANY_ATTEMPTS
    }

    void saveOtp(String email, String otpHash, Duration ttl);

    VerifyResult verifyAndConsume(String email, String otpHash);
}
