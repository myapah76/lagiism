package com.lagiism.catalog.dto;

import java.util.List;

public record ProductDto(
        Long id,
        String slug,
        String sku,
        String name,
        String nameVi,
        long priceVnd,
        String categoryCode,
        String setSlot,
        String colorName,
        String colorHex,
        List<String> sizes,
        String imageUrl,
        String imagePublicId,
        String secondaryImageUrl,
        String secondaryImagePublicId,
        String glbModelSlot,
        String description,
        String gsm,
        String fabric,
        String fit,
        String origin,
        String coordinates,
        String badgeText,
        boolean active,
        int sortOrder
) {}
