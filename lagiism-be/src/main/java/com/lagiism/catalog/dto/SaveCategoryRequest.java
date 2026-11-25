package com.lagiism.catalog.dto;

import jakarta.validation.constraints.NotBlank;

public record SaveCategoryRequest(
        @NotBlank String code,
        @NotBlank String title,
        String subtitle,
        String imageUrl,
        String imagePublicId,
        int sortOrder,
        boolean active
) {}
