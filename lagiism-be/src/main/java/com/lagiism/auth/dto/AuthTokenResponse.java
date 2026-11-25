package com.lagiism.auth.dto;

public record AuthTokenResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresInMs,
        AuthUserDto user
) {}
