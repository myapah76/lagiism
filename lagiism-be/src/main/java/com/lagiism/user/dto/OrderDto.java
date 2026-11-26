package com.lagiism.user.dto;

import java.time.Instant;
import java.util.List;

public record OrderDto(
        Long id,
        String orderCode,
        Long userId,
        String userEmail,
        String status,
        String orderSource,
        String paymentMethod,
        long totalVnd,
        String recipientName,
        String recipientPhone,
        String shippingAddress,
        String shippingCity,
        String note,
        List<OrderItemDto> items,
        Instant createdAt
) {}
