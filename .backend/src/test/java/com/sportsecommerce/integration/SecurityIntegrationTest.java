package com.sportsecommerce.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.hasKey;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void ordersEndpointRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminEndpointAllowsAdminToken() throws Exception {
        String token = registerAndFetchAccessToken("admin.integration@sportshub.local", "password123", "Admin Integration");

        mockMvc.perform(get("/api/admin/metrics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void adminEndpointRejectsRegularUser() throws Exception {
        String token = registerAndFetchAccessToken("user.integration@sportshub.local", "password123", "User Integration");

        mockMvc.perform(get("/api/admin/metrics")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminSettingsEndpointRejectsRegularUser() throws Exception {
        String token = registerAndFetchAccessToken("user.settings@sportshub.local", "password123", "Settings User");

        mockMvc.perform(get("/api/admin/settings")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminSettingsGetNeverReturnsStripeSecret() throws Exception {
        String token = registerAndFetchAccessToken("admin.settings@sportshub.local", "password123", "Settings Admin");

        String updateBody = """
                {
                  "general": {
                    "storeName": "Sports Hub",
                    "logoUrl": null,
                    "contactEmail": "admin@sportshub.local",
                    "defaultCurrency": "USD",
                    "defaultLanguage": "en"
                  },
                  "payments": {
                    "creditCardEnabled": true,
                    "cashOnDeliveryEnabled": true,
                    "stripeEnabled": true,
                    "stripePublicKey": "pk_live_example",
                    "stripeSecretKey": "sk_live_secret_should_not_echo"
                  },
                  "shipping": {
                    "flatShippingFee": 8.99,
                    "freeShippingThreshold": 80.00,
                    "deliveryRegions": ["United States"],
                    "estimatedDeliveryTime": "3-5 business days"
                  },
                  "tax": {
                    "taxRatePercent": 7.00,
                    "regionTaxRules": []
                  },
                  "product": {
                    "defaultStockThreshold": 10,
                    "lowStockAlertsEnabled": true,
                    "reviewsEnabled": true
                  },
                  "notifications": {
                    "alertNewOrders": true,
                    "alertLowStock": true,
                    "alertNewUserRegistration": true
                  },
                  "security": {
                    "passwordMinLength": 8,
                    "passwordRequireUppercase": true,
                    "passwordRequireNumber": true,
                    "passwordRequireSpecialCharacter": false,
                    "sessionTimeoutMinutes": 30,
                    "maxLoginAttempts": 5,
                    "jwtExpirationMinutes": 15
                  }
                }
                """;

        mockMvc.perform(put("/api/admin/settings")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payments.stripeSecretConfigured").value(true))
                .andExpect(jsonPath("$.payments", not(hasKey("stripeSecretKey"))));

        mockMvc.perform(get("/api/admin/settings")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.payments.stripeSecretConfigured").value(true))
                .andExpect(jsonPath("$.payments", not(hasKey("stripeSecretKey"))));
    }

    private String registerAndFetchAccessToken(String email, String password, String fullName) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "%s",
                  "fullName": "%s"
                }
                """.formatted(email, password, fullName);

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode json = objectMapper.readTree(response);
        return json.get("accessToken").asText();
    }
}
