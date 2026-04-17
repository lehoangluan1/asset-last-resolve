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
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class AssetAssignmentCoverageIT extends RemoteIntegrationTestSupport {

    @Test
    void assignmentListReturnsScopedResults() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/assignments")
                .queryParam("type", "permanent")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void officerCanCreateUpdateAndDeleteAnAsset() throws Exception {
        String token = login(OFFICER_USERNAME, DEMO_PASSWORD);
        String suffix = uniqueSuffix();

        MvcResult createdResult = mockMvc.perform(post("/api/assets")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assetPayload("Coverage Asset " + suffix, "COV-" + suffix, "Created by coverage test", "Coverage create"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(("COV-" + suffix).toUpperCase()))
            .andReturn();

        JsonNode created = objectMapper.readTree(createdResult.getResponse().getContentAsString());
        String assetId = created.get("id").asText();

        mockMvc.perform(put("/api/assets/" + assetId)
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(assetPayload("Updated Coverage Asset " + suffix, "COV-" + suffix, "Updated by coverage test", "Coverage update"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Updated Coverage Asset " + suffix));

        mockMvc.perform(delete("/api/assets/" + assetId)
                .header("Authorization", bearer(token)))
            .andExpect(status().isNoContent());
    }

    @Test
    void assetCreateReturnsValidationErrorsForIncompletePayload() throws Exception {
        String token = login(OFFICER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/assets")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "name", "",
                    "code", "",
                    "categoryId", "",
                    "departmentId", "",
                    "borrowable", true,
                    "condition", ""
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    void employeeCannotManageAssets() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/assets")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "name", "Forbidden Asset",
                    "code", "FORBID-" + uniqueSuffix(),
                    "categoryId", "00000000-0000-0000-0000-000000000301",
                    "departmentId", "00000000-0000-0000-0000-000000000102",
                    "locationId", "00000000-0000-0000-0000-000000000203",
                    "borrowable", true,
                    "condition", "good"
                ))))
            .andExpect(status().isForbidden());
    }

    @Test
    void assetDeleteRejectsLinkedSeededAssets() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(delete("/api/assets/" + HR_THINKPAD_ID)
                .header("Authorization", bearer(token)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Asset cannot be deleted while related workflow records exist"));
    }

    @Test
    void assetGetReturnsNotFoundForUnknownIds() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/assets/" + UUID.randomUUID())
                .header("Authorization", bearer(token)))
            .andExpect(status().isNotFound());
    }

    private Map<String, Object> assetPayload(String name, String code, String notes, String description) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("name", name);
        payload.put("code", code);
        payload.put("categoryId", "00000000-0000-0000-0000-000000000301");
        payload.put("departmentId", "00000000-0000-0000-0000-000000000101");
        payload.put("locationId", "00000000-0000-0000-0000-000000000201");
        payload.put("brand", "Dell");
        payload.put("model", "CoverageBook");
        payload.put("serialNumber", "SER-" + uniqueSuffix());
        payload.put("purchaseDate", "2026-04-10");
        payload.put("purchasePrice", 1250.0);
        payload.put("warrantyExpiry", "2028-04-10");
        payload.put("borrowable", true);
        payload.put("notes", notes);
        payload.put("condition", "good");
        payload.put("description", description);
        return payload;
    }
}
