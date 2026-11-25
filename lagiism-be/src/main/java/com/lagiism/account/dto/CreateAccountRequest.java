package com.lagiism.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAccountRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 120) String fullName,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank String role
) {}
