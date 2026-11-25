package com.lagiism.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateAccountRequest(
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank String role,
        boolean active
) {}
