package com.lagiism.auth.security.oauth;

import com.lagiism.shared.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class GoogleTokenVerifierService {

    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";

    private final RestClient restClient;
    private final String googleClientId;

    public GoogleTokenVerifierService(@Value("${app.google.client-id:}") String googleClientId) {
        this.restClient = RestClient.create();
        this.googleClientId = googleClientId != null ? googleClientId.trim() : "";
    }

    public GoogleUserInfo verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadRequestException("Google ID token is required");
        }
        try {
            Map<String, Object> payload = restClient.get()
                    .uri(GOOGLE_TOKENINFO_URL, idToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});

            if (payload == null) {
                throw new BadRequestException("Invalid Google ID token");
            }

            String aud = stringVal(payload.get("aud"));
            if (!googleClientId.isBlank() && !googleClientId.equals(aud)) {
                throw new BadRequestException("Google token audience mismatch");
            }

            String emailVerified = stringVal(payload.get("email_verified"));
            if (!"true".equalsIgnoreCase(emailVerified)) {
                throw new BadRequestException("Google account email is not verified");
            }

            String sub = stringVal(payload.get("sub"));
            String email = stringVal(payload.get("email"));
            String name = stringVal(payload.get("name"));
            String picture = stringVal(payload.get("picture"));

            if (sub.isBlank() || email.isBlank()) {
                throw new BadRequestException("Google token missing required identity claims");
            }

            return new GoogleUserInfo(
                    sub,
                    email.toLowerCase(),
                    !name.isBlank() ? name : email.substring(0, email.indexOf('@')),
                    picture
            );
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Failed to verify Google ID token");
        }
    }

    private String stringVal(Object val) {
        return val != null ? String.valueOf(val).trim() : "";
    }

    public record GoogleUserInfo(
            String sub,
            String email,
            String fullName,
            String avatarUrl
    ) {}
}
