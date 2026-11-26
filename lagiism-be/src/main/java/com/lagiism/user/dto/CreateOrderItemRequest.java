package com.lagiism.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateOrderItemRequest(
        @NotBlank String productSlug,
        @NotBlank String productName,
        @NotBlank String size,
        String colorName,
        @Min(0) long unitPriceVnd,
        @Min(1) int quantity,
        String imageUrl
) {}
