package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.RemoteIntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class AuthProfileHealthCoverageIT extends RemoteIntegrationTestSupport {

    @Test
    void healthEndpointIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.service").value("last-resolve"));
    }

    @Test
    void userCanChangePasswordAndLoginWithTheNewPassword() throws Exception {
        String adminToken = login(ADMIN_USERNAME, DEMO_PASSWORD);
        String username = "pwuser" + uniqueSuffix();
        createUser(adminToken, username);

        String token = login(username, DEMO_PASSWORD);

        mockMvc.perform(post("/api/auth/change-password")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "currentPassword", DEMO_PASSWORD,
                    "newPassword", "newDemo123",
                    "confirmPassword", "newDemo123"
                ))))
            .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "password", "newDemo123"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.user.username").value(username));
    }

    @Test
    void changePasswordRejectsMismatchedConfirmation() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/auth/change-password")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "currentPassword", DEMO_PASSWORD,
                    "newPassword", "newDemo123",
                    "confirmPassword", "different"
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("New password and confirmation do not match"));
    }

    @Test
    void profileEndpointsReturnAndPersistCurrentUserDetails() throws Exception {
        String adminToken = login(ADMIN_USERNAME, DEMO_PASSWORD);
        String username = "profile" + uniqueSuffix();
        createUser(adminToken, username);
        String token = login(username, DEMO_PASSWORD);

        mockMvc.perform(get("/api/profile")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value(username))
            .andExpect(jsonPath("$.role").value("employee"));

        mockMvc.perform(put("/api/profile")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "phone", "+1-555-0999",
                    "bio", "Integration coverage profile"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.phone").value("+1-555-0999"))
            .andExpect(jsonPath("$.bio").value("Integration coverage profile"));
    }

    @Test
    void profileRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/profile"))
            .andExpect(status().isUnauthorized());
    }

    private JsonNode createUser(String adminToken, String username) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/users")
                .header("Authorization", bearer(adminToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "name", "Integration " + username,
                    "email", username + "@example.com",
                    "role", "employee",
                    "departmentId", "00000000-0000-0000-0000-000000000102",
                    "active", true,
                    "phone", "+1-555-0199"
                ))))
            .andExpect(status().isOk())
            .andReturn();
        return objectMapper.readTree(result.getResponse().getContentAsString());
    }
}
