package com.lagiism.cms.dto;

import jakarta.validation.constraints.NotBlank;

public record SaveSectionRequest(
        @NotBlank String sectionKey,
        @NotBlank String title,
        String subtitle,
        String content,
        String imageUrl,
        String imagePublicId,
        int sortOrder,
        boolean active
) {}
