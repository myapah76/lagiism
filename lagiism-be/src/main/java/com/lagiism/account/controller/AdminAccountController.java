package com.lagiism.account.controller;

import com.lagiism.account.dto.AccountDto;
import com.lagiism.account.dto.AuditLogDto;
import com.lagiism.account.dto.CreateAccountRequest;
import com.lagiism.account.dto.UpdateAccountRequest;
import com.lagiism.account.service.AccountService;
import com.lagiism.account.service.AuditLogService;
import com.lagiism.shared.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AccountService accountService;
    private final AuditLogService auditLogService;

    @GetMapping("/accounts")
    public ApiResponse<List<AccountDto>> listAccounts() {
        return ApiResponse.ok(accountService.listAll());
    }

    @PostMapping("/accounts")
    public ApiResponse<AccountDto> createAccount(@Valid @RequestBody CreateAccountRequest request,
                                                 Authentication authentication) {
        return ApiResponse.ok("Account created", accountService.create(request, authentication.getName()));
    }

    @PutMapping("/accounts/{id}")
    public ApiResponse<AccountDto> updateAccount(@PathVariable Long id,
                                                 @Valid @RequestBody UpdateAccountRequest request,
                                                 Authentication authentication) {
        return ApiResponse.ok("Account updated", accountService.update(id, request, authentication.getName()));
    }

    @DeleteMapping("/accounts/{id}")
    public ApiResponse<Void> deleteAccount(@PathVariable Long id, Authentication authentication) {
        accountService.delete(id, authentication.getName());
        return ApiResponse.ok("Account deleted", null);
    }

    @GetMapping("/audit-logs")
    public ApiResponse<List<AuditLogDto>> getAuditLogs() {
        return ApiResponse.ok(auditLogService.getRecentLogs());
    }
}
