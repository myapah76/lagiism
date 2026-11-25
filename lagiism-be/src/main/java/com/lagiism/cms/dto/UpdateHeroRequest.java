package com.lagiism.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateHeroRequest(
        @NotBlank String headline,
        @NotBlank String subheadline,
        String badgeText,
        @NotBlank String primaryCtaLabel,
        @NotBlank String secondaryCtaLabel,
        @NotBlank String imageUrl,
        String imagePublicId,
        boolean active
) {}
