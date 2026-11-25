package com.lagiism.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record SaveProductRequest(
        @NotBlank String slug,
        @NotBlank String sku,
        @NotBlank String name,
        String nameVi,
        @Min(0) long priceVnd,
        @NotBlank String categoryCode,
        @NotBlank String setSlot,
        @NotBlank String colorName,
        @NotBlank String colorHex,
        List<String> sizes,
        @NotBlank String imageUrl,
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
