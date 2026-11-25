package com.lagiism.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateSmtpConfigRequest(
        @NotBlank String host,
        @Min(1) @Max(65535) int port,
        @NotBlank String username,
        String password,
        @NotBlank @Email String fromEmail,
        @NotBlank String fromName,
        boolean useTls,
        boolean useSsl,
        boolean enabled
) {}
