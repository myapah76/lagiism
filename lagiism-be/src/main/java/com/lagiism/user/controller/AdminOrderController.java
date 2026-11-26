package com.lagiism.user.controller;

import com.lagiism.shared.ApiResponse;
import com.lagiism.user.dto.AdminCreateOrderRequest;
import com.lagiism.user.dto.OrderDto;
import com.lagiism.user.dto.UpdateOrderStatusRequest;
import com.lagiism.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final UserProfileService userProfileService;

    @GetMapping
    public ApiResponse<List<OrderDto>> listAllOrders() {
        return ApiResponse.ok(userProfileService.listAllOrdersAdmin());
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<OrderDto>> listOrdersByUser(@PathVariable Long userId) {
        return ApiResponse.ok(userProfileService.listOrdersByUserIdAdmin(userId));
    }

    @PostMapping
    public ApiResponse<OrderDto> createOrder(@Valid @RequestBody AdminCreateOrderRequest request,
                                             Authentication authentication) {
        return ApiResponse.ok("Order created", userProfileService.createOrderByAdmin(request, authentication.getName()));
    }

    @PutMapping("/{id}/status")
    public ApiResponse<OrderDto> updateStatus(@PathVariable Long id,
                                              @Valid @RequestBody UpdateOrderStatusRequest request,
                                              Authentication authentication) {
        return ApiResponse.ok("Order status updated",
                userProfileService.updateOrderStatus(id, request, authentication.getName()));
    }
}
