package com.lagiism.email.controller;

import com.lagiism.email.dto.SendTestEmailRequest;
import com.lagiism.email.dto.SmtpConfigDto;
import com.lagiism.email.dto.UpdateSmtpConfigRequest;
import com.lagiism.email.service.EmailService;
import com.lagiism.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/smtp")
@RequiredArgsConstructor
public class AdminSmtpController {

    private final EmailService emailService;

    @GetMapping
    public ApiResponse<SmtpConfigDto> getSmtpConfig() {
        return ApiResponse.ok(emailService.getConfig().orElse(null));
    }

    @PutMapping
    public ApiResponse<SmtpConfigDto> updateSmtpConfig(@Valid @RequestBody UpdateSmtpConfigRequest request,
                                                       Authentication authentication) {
        return ApiResponse.ok("SMTP configuration updated",
                emailService.saveConfig(request, authentication.getName()));
    }

    @PostMapping("/test")
    public ApiResponse<Void> sendTestEmail(@Valid @RequestBody SendTestEmailRequest request) {
        emailService.sendTestEmail(request.toEmail());
        return ApiResponse.ok("Test email dispatched to " + request.toEmail(), null);
    }
}
