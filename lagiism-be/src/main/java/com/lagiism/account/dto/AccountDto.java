package com.lagiism.account.dto;

import java.time.Instant;
import java.util.List;

public record AccountDto(
        Long id,
        String email,
        String fullName,
        String phone,
        String defaultAddress,
        String defaultCity,
        String role,
        List<String> roles,
        String authProvider,
        String avatarUrl,
        boolean active,
        Instant lastLoginAt,
        Instant createdAt
) {}
