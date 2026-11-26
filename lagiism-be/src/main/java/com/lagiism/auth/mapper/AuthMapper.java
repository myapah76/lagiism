package com.lagiism.auth.mapper;

import com.lagiism.account.entity.User;
import com.lagiism.auth.dto.AuthTokenResponse;
import com.lagiism.auth.dto.AuthUserDto;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public AuthUserDto toAuthUserDto(User user) {
        return new AuthUserDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPrimaryRole(),
                user.getRoleNames(),
                user.getAuthProvider(),
                user.getAvatarUrl(),
                user.getPhone(),
                user.getDefaultAddress(),
                user.getDefaultCity()
        );
    }

    public AuthTokenResponse toAuthTokenResponse(String accessToken,
                                                 String refreshToken,
                                                 long expiresInMs,
                                                 User user) {
        return new AuthTokenResponse(
                accessToken,
                refreshToken,
                "Bearer",
                expiresInMs,
                toAuthUserDto(user)
        );
    }
}
