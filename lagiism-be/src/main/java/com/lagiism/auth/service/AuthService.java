package com.lagiism.auth.service;

import com.lagiism.account.entity.Role;
import com.lagiism.account.entity.RoleName;
import com.lagiism.account.entity.User;
import com.lagiism.account.repository.RoleRepository;
import com.lagiism.account.repository.UserRepository;
import com.lagiism.account.service.AuditLogService;
import com.lagiism.auth.security.blacklist.TokenBlacklistService;
import com.lagiism.auth.dto.*;
import com.lagiism.auth.security.jwt.JwtService;
import com.lagiism.auth.mapper.AuthMapper;
import com.lagiism.auth.security.oauth.GoogleTokenVerifierService;
import com.lagiism.auth.security.otp.OtpStore;
import com.lagiism.email.service.EmailService;
import com.lagiism.shared.BadRequestException;
import com.lagiism.shared.ResourceNotFoundException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final int OTP_EXPIRY_MINUTES = 5;

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuditLogService auditLogService;
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
    private final OtpStore otpStore;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final AuthMapper authMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AuthTokenResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("An account with this email already exists");
        }

        Role userRole = getRole(RoleName.USER);
        User user = User.builder()
                .email(normalizedEmail)
                .fullName(request.fullName().trim())
                .passwordHash(passwordEncoder.encode(request.password()))
                .authProvider("LOCAL")
                .roles(new HashSet<>(Set.of(userRole)))
                .active(true)
                .lastLoginAt(Instant.now())
                .build();

        User saved = userRepository.save(user);
        auditLogService.record(saved.getEmail(), "REGISTER", "AUTH", String.valueOf(saved.getId()),
                "User registered (LOCAL)");
        return issueTokenResponse(saved);
    }

    @Transactional
    public AuthTokenResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

        User user = userRepository.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        auditLogService.record(user.getEmail(), "LOGIN", "AUTH", String.valueOf(user.getId()),
                "Login (" + user.getPrimaryRole() + ")");
        return issueTokenResponse(user);
    }

    @Transactional
    public AuthTokenResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleTokenVerifierService.GoogleUserInfo googleUser = googleTokenVerifierService.verify(request.idToken());

        User user = userRepository.findByGoogleSub(googleUser.sub())
                .or(() -> userRepository.findByEmailIgnoreCase(googleUser.email()))
                .map(existing -> {
                    if (!existing.isActive()) {
                        throw new BadRequestException("Account is disabled");
                    }
                    if (existing.getGoogleSub() == null) {
                        existing.setGoogleSub(googleUser.sub());
                    }
                    if (googleUser.avatarUrl() != null && !googleUser.avatarUrl().isBlank()) {
                        existing.setAvatarUrl(googleUser.avatarUrl());
                    }
                    existing.setLastLoginAt(Instant.now());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    Role userRole = getRole(RoleName.USER);
                    User created = User.builder()
                            .email(googleUser.email())
                            .fullName(googleUser.fullName())
                            .passwordHash(null)
                            .authProvider("GOOGLE")
                            .googleSub(googleUser.sub())
                            .avatarUrl(googleUser.avatarUrl())
                            .roles(new HashSet<>(Set.of(userRole)))
                            .active(true)
                            .lastLoginAt(Instant.now())
                            .build();
                    return userRepository.save(created);
                });

        auditLogService.record(user.getEmail(), "GOOGLE_LOGIN", "AUTH", String.valueOf(user.getId()),
                "Google OAuth login (" + user.getPrimaryRole() + ")");
        return issueTokenResponse(user);
    }

    @Transactional
    public AuthTokenResponse refresh(RefreshTokenRequest request) {
        try {
            Claims claims = jwtService.parseClaims(request.refreshToken());
            String tokenType = claims.get(JwtService.CLAIM_TYPE, String.class);
            if (!JwtService.TYPE_REFRESH.equals(tokenType)) {
                throw new BadRequestException("Invalid refresh token type");
            }
            String jti = claims.getId();
            if (tokenBlacklistService.isBlacklisted(jti)) {
                throw new BadRequestException("Refresh token has been revoked");
            }

            User user = userRepository.findByEmailIgnoreCase(claims.getSubject())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            if (!user.isActive()) {
                throw new BadRequestException("Account is disabled");
            }

            // Rotate refresh token by blacklisting the old one in Redis
            tokenBlacklistService.blacklist(jti, jwtService.getRemainingTtl(claims));
            return issueTokenResponse(user);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new BadRequestException("Invalid or expired refresh token");
        }
    }

    @Transactional(readOnly = true)
    public AuthUserDto getCurrentUser(String email) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return authMapper.toAuthUserDto(user);
    }

    public void logout(HttpServletRequest httpRequest, LogoutRequest logoutRequest, String actorEmail) {
        String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            blacklistRawToken(authHeader.substring(7).trim());
        }
        if (logoutRequest != null && logoutRequest.refreshToken() != null && !logoutRequest.refreshToken().isBlank()) {
            blacklistRawToken(logoutRequest.refreshToken().trim());
        }

        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        if (actorEmail != null) {
            auditLogService.record(actorEmail, "LOGOUT", "AUTH", null, "User logged out and JWT blacklisted");
        }
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        String authHeader = httpRequest.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            blacklistRawToken(authHeader.substring(7).trim());
        }
        auditLogService.record(email, "PASSWORD_CHANGED", "AUTH", String.valueOf(user.getId()), "Password changed");
    }

    @Transactional
    public void requestPasswordResetOtp(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(request.email().trim()).ifPresent(user -> {
            if (!user.isActive()) {
                return;
            }
            String otp = String.format("%06d", secureRandom.nextInt(1_000_000));
            otpStore.saveOtp(user.getEmail(), sha256Hex(otp), Duration.ofMinutes(OTP_EXPIRY_MINUTES));
            emailService.sendPasswordResetOtp(user.getEmail(), otp, OTP_EXPIRY_MINUTES);
            auditLogService.record(user.getEmail(), "OTP_REQUESTED", "AUTH", String.valueOf(user.getId()),
                    "Password reset OTP stored in Redis (5m TTL)");
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        OtpStore.VerifyResult result = otpStore.verifyAndConsume(email, sha256Hex(request.otp().trim()));

        if (result == OtpStore.VerifyResult.TOO_MANY_ATTEMPTS) {
            throw new BadRequestException("Too many invalid OTP attempts. Please request a new code.");
        }
        if (result != OtpStore.VerifyResult.VALID) {
            throw new BadRequestException("Invalid or expired OTP code");
        }

        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        auditLogService.record(user.getEmail(), "PASSWORD_RESET", "AUTH", String.valueOf(user.getId()),
                "Password reset via Redis OTP");
    }

    public static String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    private Role getRole(RoleName name) {
        return roleRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + name));
    }

    private AuthTokenResponse issueTokenResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return authMapper.toAuthTokenResponse(accessToken, refreshToken, jwtService.getAccessExpirationMs(), user);
    }

    private void blacklistRawToken(String rawToken) {
        try {
            Claims claims = jwtService.parseClaims(rawToken);
            tokenBlacklistService.blacklist(claims.getId(), jwtService.getRemainingTtl(claims));
        } catch (JwtException | IllegalArgumentException ignored) {
            // Already expired or invalid; nothing to blacklist
        }
    }
}
