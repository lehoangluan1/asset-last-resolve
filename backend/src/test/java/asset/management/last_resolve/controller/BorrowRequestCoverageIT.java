package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.RemoteIntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class BorrowRequestCoverageIT extends RemoteIntegrationTestSupport {

    @Test
    void borrowRequestListSupportsStatusFiltering() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/borrow-requests")
                .queryParam("status", "checked-out")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].status").value("checked-out"));
    }

    @Test
    void borrowRequestDetailReturnsCurrentScopeRequest() throws Exception {
        String token = login(HR_MANAGER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/borrow-requests/" + HR_BORROW_REQUEST_ID)
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(HR_BORROW_REQUEST_ID))
            .andExpect(jsonPath("$.assetName").value("iPhone 15 Pro"));
    }

    @Test
    void borrowRequestCreateValidatesRequiredFields() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", "",
                    "borrowDate", "",
                    "returnDate", "",
                    "purpose", ""
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    void managerCanRejectPendingBorrowRequests() throws Exception {
        String officerToken = login(OFFICER_USERNAME, DEMO_PASSWORD);
        String employeeToken = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);
        String purpose = "Reject flow " + uniqueSuffix();
        String assetId = createBorrowableHrAsset(officerToken, purpose);
        MvcResult creation = mockMvc.perform(post("/api/borrow-requests")
                .header("Authorization", bearer(employeeToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", assetId,
                    "borrowDate", "2026-05-10",
                    "returnDate", "2026-05-12",
                    "purpose", purpose,
                    "notes", "Coverage reject flow"
                ))))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode created = objectMapper.readTree(creation.getResponse().getContentAsString());
        String requestId = created.get("id").asText();
        String managerToken = login(HR_MANAGER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests/" + requestId + "/reject")
                .header("Authorization", bearer(managerToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Rejected by coverage flow"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("rejected"))
            .andExpect(jsonPath("$.approverNotes").value("Rejected by coverage flow"));
    }

    @Test
    void rejectReturnsNotFoundForUnknownRequests() throws Exception {
        String token = login(HR_MANAGER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests/" + UUID.randomUUID() + "/reject")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Missing"))))
            .andExpect(status().isNotFound());
    }

    private String createBorrowableHrAsset(String officerToken, String purpose) throws Exception {
        String suffix = uniqueSuffix().toUpperCase();
        MvcResult result = mockMvc.perform(post("/api/assets")
                .header("Authorization", bearer(officerToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new java.util.LinkedHashMap<String, Object>() {{
                    put("name", "Borrow Coverage " + suffix);
                    put("code", "BRW-" + suffix);
                    put("categoryId", "00000000-0000-0000-0000-000000000301");
                    put("departmentId", "00000000-0000-0000-0000-000000000102");
                    put("locationId", "00000000-0000-0000-0000-000000000203");
                    put("brand", "Lenovo");
                    put("model", "Borrow Flow");
                    put("serialNumber", "SER-" + suffix);
                    put("purchaseDate", "2026-04-01");
                    put("purchasePrice", 999.0);
                    put("warrantyExpiry", "2028-04-01");
                    put("borrowable", true);
                    put("notes", "Created for " + purpose);
                    put("condition", "good");
                    put("description", "Fresh asset for borrow rejection coverage");
                }})))
            .andExpect(status().isOk())
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }
}
