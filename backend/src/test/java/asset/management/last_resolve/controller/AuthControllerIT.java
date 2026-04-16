package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.IntegrationTestSupport;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AuthControllerIT extends IntegrationTestSupport {

    @Test
    void loginAcceptsSeededAdminCredentials() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", ADMIN_USERNAME,
                    "password", DEMO_PASSWORD
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.token").isNotEmpty())
            .andExpect(jsonPath("$.user.username").value(ADMIN_USERNAME))
            .andExpect(jsonPath("$.user.role").value("admin"));
    }

    @Test
    void loginRejectsInvalidPassword() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", ADMIN_USERNAME,
                    "password", "wrong-password"
                ))))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void loginRejectsInactiveSeededUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", INACTIVE_USERNAME,
                    "password", DEMO_PASSWORD
                ))))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void meReturnsCurrentUserForAuthenticatedRequest() throws Exception {
        String token = login(OFFICER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value(OFFICER_USERNAME))
            .andExpect(jsonPath("$.role").value("officer"))
            .andExpect(jsonPath("$.grants").isArray());
    }

    @Test
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }
}
