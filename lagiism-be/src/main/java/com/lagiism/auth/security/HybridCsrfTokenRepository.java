package com.lagiism.auth.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.security.web.csrf.DefaultCsrfToken;

import java.util.UUID;

/**
 * Hybrid CSRF Token Repository persisting tokens in both the XSRF-TOKEN cookie
 * and HttpSession, while always exposing X-XSRF-TOKEN in response headers so
 * cross-site SPAs never break when browsers block third-party cookies.
 */
public class HybridCsrfTokenRepository implements CsrfTokenRepository {

    public static final String HEADER_NAME = "X-XSRF-TOKEN";
    public static final String PARAMETER_NAME = "_csrf";
    public static final String COOKIE_NAME = "XSRF-TOKEN";
    private static final String SESSION_ATTR = HybridCsrfTokenRepository.class.getName() + ".CSRF_TOKEN";

    private final boolean cookieSecure;
    private final String cookieSameSite;

    public HybridCsrfTokenRepository(boolean cookieSecure, String cookieSameSite) {
        this.cookieSecure = cookieSecure;
        this.cookieSameSite = cookieSameSite;
    }

    @Override
    public CsrfToken generateToken(HttpServletRequest request) {
        return new DefaultCsrfToken(HEADER_NAME, PARAMETER_NAME, UUID.randomUUID().toString());
    }

    @Override
    public void saveToken(CsrfToken token, HttpServletRequest request, HttpServletResponse response) {
        String tokenValue = token != null ? token.getToken() : "";

        HttpSession session = request.getSession(token != null);
        if (session != null) {
            if (token == null) {
                session.removeAttribute(SESSION_ATTR);
            } else {
                session.setAttribute(SESSION_ATTR, token);
            }
        }

        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(COOKIE_NAME, tokenValue)
                .path("/")
                .httpOnly(false)
                .secure(cookieSecure)
                .sameSite(cookieSameSite)
                .maxAge(token == null ? 0 : -1);

        response.addHeader(HttpHeaders.SET_COOKIE, cookieBuilder.build().toString());
        if (token != null) {
            response.setHeader(HEADER_NAME, tokenValue);
        }
    }

    @Override
    public CsrfToken loadToken(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            Object attr = session.getAttribute(SESSION_ATTR);
            if (attr instanceof CsrfToken sessionToken) {
                return sessionToken;
            }
        }

        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (COOKIE_NAME.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank()) {
                    return new DefaultCsrfToken(HEADER_NAME, PARAMETER_NAME, cookie.getValue());
                }
            }
        }

        return null;
    }
}
