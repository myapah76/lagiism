package com.lagiism.user.dto;

public record OrderItemDto(
        Long id,
        String productSlug,
        String productName,
        String size,
        String colorName,
        long unitPriceVnd,
        int quantity,
        String imageUrl
) {}
