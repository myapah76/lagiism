package com.lagiism.email.dto;

import java.time.Instant;

public record SmtpConfigDto(
        Long id,
        String host,
        int port,
        String username,
        boolean hasPassword,
        String fromEmail,
        String fromName,
        boolean useTls,
        boolean useSsl,
        boolean enabled,
        Instant updatedAt
) {}
