package com.lagiism.auth.dto;

import java.util.List;

public record AuthUserDto(
        Long id,
        String email,
        String fullName,
        String role,
        List<String> roles,
        String authProvider,
        String avatarUrl,
        String phone,
        String defaultAddress,
        String defaultCity
) {}
