package com.lagiism;

import com.lagiism.auth.oauth.GoogleTokenVerifierService;
import com.lagiism.auth.otp.OtpStore;
import com.lagiism.auth.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LagiismApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OtpStore otpStore;

    @MockitoBean
    private GoogleTokenVerifierService googleTokenVerifierService;

    @Test
    void publicHealthAndHomepageAggregateWork() throws Exception {
        mockMvc.perform(get("/api/public/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"));

        mockMvc.perform(get("/api/public/homepage"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hero.headline").value("LAGIISM // DROP 01"))
                .andExpect(jsonPath("$.data.sections").isArray())
                .andExpect(jsonPath("$.data.reviews").isArray())
                .andExpect(jsonPath("$.data.settings.brand_name").value("LAGIISM"));
    }

    @Test
    void publicCatalogReturnsSeededProductsAndCategories() throws Exception {
        mockMvc.perform(get("/api/public/catalog/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(8));

        mockMvc.perform(get("/api/public/catalog/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(4));
    }

    @Test
    void adminLoginIssuesJwtAndAllowsAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/accounts"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));

        MvcResult csrfResult = mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-XSRF-TOKEN"))
                .andReturn();

        String csrfToken = csrfResult.getResponse().getHeader("X-XSRF-TOKEN");
        MockHttpSession session = (MockHttpSession) csrfResult.getRequest().getSession(false);
        assertThat(csrfToken).isNotBlank();
        assertThat(session).isNotNull();

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .session(session)
                        .header("X-XSRF-TOKEN", csrfToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "test-admin@lagiism.com",
                                  "password": "TestPassword123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("test-admin@lagiism.com"))
                .andExpect(jsonPath("$.data.user.role").value("ADMIN"))
                .andExpect(jsonPath("$.data.user.roles[0]").value("ADMIN"))
                .andReturn();

        JsonNode root = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String accessToken = root.path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test-admin@lagiism.com"))
                .andExpect(jsonPath("$.data.roles[0]").value("ADMIN"));

        mockMvc.perform(get("/api/admin/database/status")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.healthy").value(true))
                .andExpect(jsonPath("$.data.tableCounts.roles").value(3))
                .andExpect(jsonPath("$.data.tableCounts.products").value(8));

        // Guest website order (no login required)
        mockMvc.perform(post("/api/public/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "recipientName": "Guest Buyer",
                                  "recipientPhone": "0909888777",
                                  "shippingAddress": "La Gi Harbor",
                                  "paymentMethod": "COD",
                                  "items": [
                                    {
                                      "productSlug": "lg-tee-01",
                                      "productName": "LAGIISM BOXY WASHED TEE",
                                      "size": "M",
                                      "unitPriceVnd": 450000,
                                      "quantity": 1
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderSource").value("WEBSITE"))
                .andExpect(jsonPath("$.data.userId").doesNotExist());

        // Admin creates an Instagram non-user order
        mockMvc.perform(post("/api/admin/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "orderSource": "INSTAGRAM",
                                  "paymentMethod": "BANK",
                                  "recipientName": "IG Customer",
                                  "recipientPhone": "0912345678",
                                  "shippingAddress": "District 3, TP.HCM",
                                  "note": "@ig_buyer",
                                  "items": [
                                    {
                                      "productSlug": "lg-denim-01",
                                      "productName": "RAW WIDE-LEG SELVEDGE DENIM",
                                      "size": "L",
                                      "unitPriceVnd": 850000,
                                      "quantity": 1
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderSource").value("INSTAGRAM"))
                .andExpect(jsonPath("$.data.paymentMethod").value("BANK"))
                .andExpect(jsonPath("$.data.totalVnd").value(850000));

        // Admin can list all orders
        mockMvc.perform(get("/api/admin/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(2)));
    }

    @Test
    void customerRegisterRoleEnforcementAndLogoutBlacklistWork() throws Exception {
        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "customer@lagiism.com",
                                  "fullName": "Lagi Customer",
                                  "password": "CustomerPass123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role").value("USER"))
                .andExpect(jsonPath("$.data.user.authProvider").value("LOCAL"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        JsonNode regNode = objectMapper.readTree(regResult.getResponse().getContentAsString());
        String accessToken = regNode.path("data").path("accessToken").asText();
        String refreshToken = regNode.path("data").path("refreshToken").asText();

        // USER can access /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("USER"));

        // USER can update default profile (phone & shipping address)
        mockMvc.perform(put("/api/user/profile")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Lagi Customer Updated",
                                  "phone": "0901234567",
                                  "defaultAddress": "123 Le Loi, District 1",
                                  "defaultCity": "TP.HCM"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.phone").value("0901234567"))
                .andExpect(jsonPath("$.data.defaultCity").value("TP.HCM"));

        // USER can place an order and read order history
        mockMvc.perform(post("/api/user/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "recipientName": "Lagi Customer Updated",
                                  "recipientPhone": "0901234567",
                                  "shippingAddress": "123 Le Loi, District 1",
                                  "shippingCity": "TP.HCM",
                                  "items": [
                                    {
                                      "productSlug": "lg-tee-01",
                                      "productName": "LAGIISM BOXY WASHED TEE",
                                      "size": "L",
                                      "colorName": "WASHED CHARCOAL",
                                      "unitPriceVnd": 450000,
                                      "quantity": 2
                                    }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalVnd").value(900000))
                .andExpect(jsonPath("$.data.items.length()").value(1));

        mockMvc.perform(get("/api/user/orders")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].recipientPhone").value("0901234567"));

        // USER is forbidden on /api/admin/**
        mockMvc.perform(get("/api/admin/accounts")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isForbidden());

        // Logout blacklists both access & refresh tokens
        mockMvc.perform(post("/api/auth/logout")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk());

        // Blacklisted access token is rejected with 401
        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Token has been revoked"));

        // Blacklisted refresh token is rejected with 400
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void googleOAuthCreatesUserAndIssuesJwt() throws Exception {
        when(googleTokenVerifierService.verify("mock-google-id-token"))
                .thenReturn(new GoogleTokenVerifierService.GoogleUserInfo(
                        "google-sub-12345",
                        "google.user@lagiism.com",
                        "Google Streetwear Fan",
                        "https://example.com/avatar.png"
                ));

        mockMvc.perform(post("/api/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idToken\":\"mock-google-id-token\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("google.user@lagiism.com"))
                .andExpect(jsonPath("$.data.user.role").value("USER"))
                .andExpect(jsonPath("$.data.user.authProvider").value("GOOGLE"));
    }

    @Test
    void forgotResetOtpAndChangePasswordFlowWorks() throws Exception {
        // Register a fresh member
        MvcResult reg = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khoi@lagiism.vn",
                                  "fullName": "Tran Minh Khoi",
                                  "password": "InitialPassword1!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn();

        String initialToken = objectMapper.readTree(reg.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        // Change password after login (revokes current JWT)
        mockMvc.perform(post("/api/auth/change-password")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + initialToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "InitialPassword1!",
                                  "newPassword": "ChangedPassword2!"
                                }
                                """))
                .andExpect(status().isOk());

        // Revoked token is rejected with 401
        mockMvc.perform(get("/api/auth/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + initialToken))
                .andExpect(status().isUnauthorized());

        // Forgot password + atomic 5-min OTP reset
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"khoi@lagiism.vn\"}"))
                .andExpect(status().isOk());

        // Seed known 6-digit OTP into OtpStore (5m TTL) and verify atomic consume on reset
        otpStore.saveOtp("khoi@lagiism.vn", AuthService.sha256Hex("654321"), java.time.Duration.ofMinutes(5));

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khoi@lagiism.vn",
                                  "otp": "654321",
                                  "newPassword": "RecoveredPassword3!"
                                }
                                """))
                .andExpect(status().isOk());

        // Reusing the consumed OTP fails
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "khoi@lagiism.vn",
                                  "otp": "654321",
                                  "newPassword": "AnotherPassword4!"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
