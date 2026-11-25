package com.lagiism.account.dto;

import java.time.Instant;

public record AuditLogDto(
        Long id,
        String actorEmail,
        String action,
        String targetType,
        String targetId,
        String details,
        Instant createdAt
) {}
