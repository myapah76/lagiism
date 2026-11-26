package com.lagiism.user.controller;

import com.lagiism.shared.ApiResponse;
import com.lagiism.user.dto.CreateOrderRequest;
import com.lagiism.user.dto.OrderDto;
import com.lagiism.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/orders")
@RequiredArgsConstructor
public class PublicOrderController {

    private final UserProfileService userProfileService;

    @PostMapping
    public ApiResponse<OrderDto> placeGuestOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.ok("Order placed", userProfileService.placeGuestOrder(request));
    }
}
