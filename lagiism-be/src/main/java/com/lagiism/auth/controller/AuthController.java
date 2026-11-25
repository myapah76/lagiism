package com.lagiism.auth.controller;

import com.lagiism.auth.dto.*;
import com.lagiism.auth.security.HybridCsrfTokenRepository;
import com.lagiism.auth.service.AuthService;
import com.lagiism.shared.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final HybridCsrfTokenRepository csrfTokenRepository;

    @GetMapping("/csrf")
    public ApiResponse<Map<String, String>> csrf(HttpServletRequest request, HttpServletResponse response) {
        CsrfToken token = csrfTokenRepository.loadToken(request);
        if (token == null) {
            token = csrfTokenRepository.generateToken(request);
        }
        csrfTokenRepository.saveToken(token, request, response);
        return ApiResponse.ok(Map.of(
                "headerName", token.getHeaderName(),
                "token", token.getToken()
        ));
    }

    @PostMapping("/register")
    public ApiResponse<AuthTokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.ok("Account created", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthTokenResponse> login(@Valid @RequestBody LoginRequest request,
                                                HttpServletRequest httpRequest,
                                                HttpServletResponse httpResponse) {
        AuthTokenResponse response = authService.login(request, httpRequest);
        CsrfToken refreshed = csrfTokenRepository.generateToken(httpRequest);
        csrfTokenRepository.saveToken(refreshed, httpRequest, httpResponse);
        return ApiResponse.ok("Login successful", response);
    }

    @PostMapping("/google")
    public ApiResponse<AuthTokenResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ApiResponse.ok("Google authentication successful", authService.loginWithGoogle(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthTokenResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.ok("Token refreshed", authService.refresh(request));
    }

    @GetMapping("/me")
    public ApiResponse<AuthUserDto> me(Authentication authentication) {
        return ApiResponse.ok(authService.getCurrentUser(authentication.getName()));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody(required = false) LogoutRequest logoutRequest,
                                    HttpServletRequest httpRequest,
                                    Authentication authentication) {
        authService.logout(httpRequest, logoutRequest, authentication != null ? authentication.getName() : null);
        return ApiResponse.ok("Logged out", null);
    }

    @PostMapping("/change-password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
                                            HttpServletRequest httpRequest,
                                            Authentication authentication) {
        authService.changePassword(authentication.getName(), request, httpRequest);
        return ApiResponse.ok("Password updated", null);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.requestPasswordResetOtp(request);
        return ApiResponse.ok("If the email exists, a recovery code has been sent.", null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.ok("Password reset successful", null);
    }
}
