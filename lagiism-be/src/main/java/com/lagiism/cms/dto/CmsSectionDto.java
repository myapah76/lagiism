package com.lagiism.cms.dto;

import java.time.Instant;

public record CmsSectionDto(
        Long id,
        String sectionKey,
        String title,
        String subtitle,
        String content,
        String imageUrl,
        String imagePublicId,
        int sortOrder,
        boolean active,
        Instant updatedAt
) {}
