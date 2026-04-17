package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.RemoteIntegrationTestSupport;
import org.junit.jupiter.api.Test;

class ReportVerificationCoverageIT extends RemoteIntegrationTestSupport {

    @Test
    void reportsEndpointsReturnSummaryAndAuditLogsForAdmins() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/reports/summary")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalAssets").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.openDiscrepancies").value(org.hamcrest.Matchers.greaterThanOrEqualTo(0)));

        mockMvc.perform(get("/api/reports/audit-logs")
                .queryParam("search", "Sarah")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items").isArray());
    }

    @Test
    void reportsAreForbiddenForStandardEmployees() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/reports/summary")
                .header("Authorization", bearer(token)))
            .andExpect(status().isForbidden());
    }

    @Test
    void verificationDetailReturnsCampaignPayload() throws Exception {
        String token = login(AUDITOR_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/verification/campaigns/" + ACTIVE_CAMPAIGN_ID)
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(ACTIVE_CAMPAIGN_ID))
            .andExpect(jsonPath("$.tasks").isArray());
    }

    @Test
    void privilegedUsersCanCreateVerificationCampaigns() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);
        String suffix = uniqueSuffix().toUpperCase();

        mockMvc.perform(post("/api/verification/campaigns")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(java.util.Map.of(
                    "name", "Coverage Campaign " + suffix,
                    "code", "VER-COV-" + suffix,
                    "year", 2026,
                    "description", "Created by integration coverage",
                    "departmentIds", java.util.List.of("00000000-0000-0000-0000-000000000101", "00000000-0000-0000-0000-000000000104"),
                    "status", "active",
                    "dueDate", "2026-06-30",
                    "startDate", "2026-05-20"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value("VER-COV-" + suffix))
            .andExpect(jsonPath("$.tasks.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }

    @Test
    void verificationCreateValidatesRequiredFields() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/verification/campaigns")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(java.util.Map.of(
                    "name", "",
                    "code", "",
                    "year", 2026,
                    "departmentIds", java.util.List.of(),
                    "status", "",
                    "dueDate", "",
                    "startDate", ""
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors").isArray());
    }
}
