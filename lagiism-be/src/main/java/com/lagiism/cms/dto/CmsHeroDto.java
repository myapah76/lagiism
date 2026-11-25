package com.lagiism.cms.dto;

import java.time.Instant;

public record CmsHeroDto(
        Long id,
        String headline,
        String subheadline,
        String badgeText,
        String primaryCtaLabel,
        String secondaryCtaLabel,
        String imageUrl,
        String imagePublicId,
        boolean active,
        Instant updatedAt
) {}
