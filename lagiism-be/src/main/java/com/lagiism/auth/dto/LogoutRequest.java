package com.lagiism.auth.dto;

public record LogoutRequest(
        String refreshToken
) {}
