package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.RemoteIntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class UserReferenceCoverageIT extends RemoteIntegrationTestSupport {

    @Test
    void adminCanUpdateResetAndToggleUsers() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);
        String username = "managed" + uniqueSuffix();
        MvcResult createdResult = mockMvc.perform(post("/api/users")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "name", "Managed User",
                    "email", username + "@example.com",
                    "role", "employee",
                    "departmentId", "00000000-0000-0000-0000-000000000102",
                    "active", true,
                    "phone", "+1-555-0119"
                ))))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode created = objectMapper.readTree(createdResult.getResponse().getContentAsString());
        String userId = created.get("id").asText();

        mockMvc.perform(put("/api/users/" + userId)
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "name", "Updated Managed User",
                    "email", username + "@example.com",
                    "role", "manager",
                    "departmentId", "00000000-0000-0000-0000-000000000102",
                    "active", true,
                    "phone", "+1-555-0220"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Managed User"))
            .andExpect(jsonPath("$.role").value("manager"));

        mockMvc.perform(post("/api/users/" + userId + "/reset-password")
                .header("Authorization", bearer(token)))
            .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/users/" + userId + "/toggle-status")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("inactive"));
    }

    @Test
    void referenceReadEndpointsReturnSeededData() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/reference/departments")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].code").value("FIN"));

        mockMvc.perform(get("/api/reference/locations")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].name").value("Compliance Office"));

        mockMvc.perform(get("/api/reference/categories")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].code").value("FUR"));
    }

    @Test
    void referenceUsersEndpointFiltersByRole() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/reference/users")
                .queryParam("roles", "manager")
                .queryParam("roles", "technician")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].role").value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.anyOf(
                org.hamcrest.Matchers.is("manager"),
                org.hamcrest.Matchers.is("technician")
            ))));
    }

    @Test
    void adminCanCreateUpdateAndDeleteCategories() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);
        String suffix = uniqueSuffix().toUpperCase();

        MvcResult createdResult = mockMvc.perform(post("/api/reference/categories")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "name", "Coverage Category " + suffix,
                    "code", "CAT" + suffix,
                    "description", "Created by integration coverage",
                    "borrowableByDefault", true,
                    "requiresSerial", true,
                    "requiresVerification", false
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("CAT" + suffix))
            .andReturn();

        String categoryId = objectMapper.readTree(createdResult.getResponse().getContentAsString()).get("id").asText();

        mockMvc.perform(put("/api/reference/categories/" + categoryId)
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "name", "Coverage Category Updated " + suffix,
                    "code", "CAT" + suffix,
                    "description", "Updated by integration coverage",
                    "borrowableByDefault", false,
                    "requiresSerial", true,
                    "requiresVerification", true,
                    "status", "inactive"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Coverage Category Updated " + suffix))
            .andExpect(jsonPath("$.status").value("inactive"));

        mockMvc.perform(delete("/api/reference/categories/" + categoryId)
                .header("Authorization", bearer(token)))
            .andExpect(status().isNoContent());
    }

    @Test
    void deleteCategoryRejectsSeededCategoriesThatAreInUse() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(delete("/api/reference/categories/00000000-0000-0000-0000-000000000301")
                .header("Authorization", bearer(token)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Cannot delete a category that is in use"));
    }
}
