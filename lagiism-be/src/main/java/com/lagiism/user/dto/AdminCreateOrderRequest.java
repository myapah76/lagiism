package com.lagiism.user.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record AdminCreateOrderRequest(
        Long userId,
        String orderSource,
        String paymentMethod,
        String status,
        @NotBlank String recipientName,
        @NotBlank @Pattern(regexp = "^[0-9+\\-\\s().]{8,20}$", message = "Invalid recipient phone")
        String recipientPhone,
        @NotBlank String shippingAddress,
        String shippingCity,
        String note,
        @NotEmpty List<@Valid CreateOrderItemRequest> items
) {}
