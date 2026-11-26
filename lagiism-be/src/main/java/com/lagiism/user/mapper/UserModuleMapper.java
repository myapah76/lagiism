package com.lagiism.user.mapper;

import com.lagiism.account.entity.User;
import com.lagiism.user.dto.*;
import com.lagiism.user.entity.Order;
import com.lagiism.user.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserModuleMapper {

    public UserProfileDto toProfileDto(User user) {
        return new UserProfileDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPrimaryRole(),
                user.getRoleNames(),
                user.getAuthProvider(),
                user.getAvatarUrl(),
                user.getPhone(),
                user.getDefaultAddress(),
                user.getDefaultCity()
        );
    }

    public void applyProfileUpdate(User user, UpdateProfileRequest req) {
        user.setFullName(req.fullName().trim());
        user.setPhone(normalizeNullable(req.phone()));
        user.setDefaultAddress(normalizeNullable(req.defaultAddress()));
        user.setDefaultCity(normalizeNullable(req.defaultCity()));
    }

    public OrderDto toOrderDto(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(this::toOrderItemDto)
                .toList();
        Long userId = order.getUser() != null ? order.getUser().getId() : null;
        String userEmail = order.getUser() != null ? order.getUser().getEmail() : null;
        return new OrderDto(
                order.getId(),
                order.getOrderCode(),
                userId,
                userEmail,
                order.getStatus(),
                order.getOrderSource(),
                order.getPaymentMethod(),
                order.getTotalVnd(),
                order.getRecipientName(),
                order.getRecipientPhone(),
                order.getShippingAddress(),
                order.getShippingCity(),
                order.getNote(),
                itemDtos,
                order.getCreatedAt()
        );
    }

    public OrderItemDto toOrderItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getId(),
                item.getProductSlug(),
                item.getProductName(),
                item.getSize(),
                item.getColorName(),
                item.getUnitPriceVnd(),
                item.getQuantity(),
                item.getImageUrl()
        );
    }

    public OrderItem toOrderItemEntity(Order order, CreateOrderItemRequest req) {
        return OrderItem.builder()
                .order(order)
                .productSlug(req.productSlug().trim())
                .productName(req.productName().trim())
                .size(req.size().trim().toUpperCase())
                .colorName(req.colorName())
                .unitPriceVnd(req.unitPriceVnd())
                .quantity(req.quantity())
                .imageUrl(req.imageUrl())
                .build();
    }

    private String normalizeNullable(String val) {
        if (val == null || val.isBlank()) {
            return null;
        }
        return val.trim();
    }
}
