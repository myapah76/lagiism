package com.lagiism.user.controller;

import com.lagiism.shared.ApiResponse;
import com.lagiism.user.dto.*;
import com.lagiism.user.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/profile")
    public ApiResponse<UserProfileDto> getProfile(Authentication authentication) {
        return ApiResponse.ok(userProfileService.getProfile(authentication.getName()));
    }

    @PutMapping("/profile")
    public ApiResponse<UserProfileDto> updateProfile(@Valid @RequestBody UpdateProfileRequest request,
                                                     Authentication authentication) {
        return ApiResponse.ok("Profile updated", userProfileService.updateProfile(authentication.getName(), request));
    }

    @GetMapping("/orders")
    public ApiResponse<List<OrderDto>> getOrderHistory(Authentication authentication) {
        return ApiResponse.ok(userProfileService.getOrderHistory(authentication.getName()));
    }

    @PostMapping("/orders")
    public ApiResponse<OrderDto> placeOrder(@Valid @RequestBody CreateOrderRequest request,
                                            Authentication authentication) {
        return ApiResponse.ok("Order placed", userProfileService.placeOrder(authentication.getName(), request));
    }
}
