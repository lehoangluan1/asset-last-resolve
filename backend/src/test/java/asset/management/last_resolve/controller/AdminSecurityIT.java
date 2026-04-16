package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.IntegrationTestSupport;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AdminSecurityIT extends IntegrationTestSupport {

    @Test
    void adminCanListUsers() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/users")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isArray())
            .andExpect(jsonPath("$.items.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void managerCannotListUsers() throws Exception {
        String token = login(MANAGER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/users")
                .header("Authorization", bearer(token)))
            .andExpect(status().isForbidden());
    }

    @Test
    void adminCanCreateUser() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/users")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "apitestuser",
                    "name", "API Test User",
                    "email", "apitestuser@example.com",
                    "role", "employee",
                    "departmentId", "00000000-0000-0000-0000-000000000102",
                    "active", true,
                    "phone", "+1-555-0200"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("apitestuser"))
            .andExpect(jsonPath("$.role").value("employee"));
    }

    @Test
    void createUserReturnsValidationErrorsForInvalidPayload() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/users")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", "",
                    "name", "",
                    "email", "not-an-email",
                    "role", "",
                    "departmentId", "",
                    "active", true
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors").isArray());
    }
}
