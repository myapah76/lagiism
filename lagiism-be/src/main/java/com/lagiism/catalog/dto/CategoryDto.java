package com.lagiism.catalog.dto;

public record CategoryDto(
        Long id,
        String code,
        String title,
        String subtitle,
        String imageUrl,
        String imagePublicId,
        int sortOrder,
        boolean active
) {}
