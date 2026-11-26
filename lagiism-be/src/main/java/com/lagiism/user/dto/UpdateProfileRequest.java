package com.lagiism.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        String fullName,

        @Pattern(
                regexp = "^$|^[0-9+\\-\\s().]{8,20}$",
                message = "Phone number must be 8-20 characters (digits, +, -, spaces)"
        )
        String phone,

        @Size(max = 500, message = "Address is too long")
        String defaultAddress,

        @Size(max = 120, message = "City name is too long")
        String defaultCity
) {}
