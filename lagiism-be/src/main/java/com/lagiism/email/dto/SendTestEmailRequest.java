package com.lagiism.email.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendTestEmailRequest(
        @NotBlank @Email String toEmail
) {}
