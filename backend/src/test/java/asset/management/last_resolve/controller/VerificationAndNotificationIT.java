package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.IntegrationTestSupport;
import java.util.Map;
import org.junit.jupiter.api.Test;

class VerificationAndNotificationIT extends IntegrationTestSupport {

    @Test
    void auditorCanListVerificationCampaigns() throws Exception {
        String token = login(AUDITOR_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/verification/campaigns")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(ACTIVE_CAMPAIGN_ID));
    }

    @Test
    void employeeCannotCreateVerificationCampaigns() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/verification/campaigns")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "name", "Unauthorized Campaign",
                    "code", "VER-SEC-1",
                    "year", 2026,
                    "description", "Should fail",
                    "departmentIds", new String[] { "00000000-0000-0000-0000-000000000102" },
                    "status", "active",
                    "dueDate", "2026-05-10",
                    "startDate", "2026-05-01"
                ))))
            .andExpect(status().isForbidden());
    }

    @Test
    void notificationsAreScopedToCurrentUser() throws Exception {
        String employeeToken = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/notifications")
                .header("Authorization", bearer(employeeToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Borrow request approved"))
            .andExpect(jsonPath("$[*].title").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.hasItem("Disposal request awaiting review"))));
    }

    @Test
    void readAllMarksCurrentUsersNotificationsAsRead() throws Exception {
        String employeeToken = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/notifications/read-all")
                .header("Authorization", bearer(employeeToken)))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notifications")
                .header("Authorization", bearer(employeeToken)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[*].read").value(org.hamcrest.Matchers.everyItem(org.hamcrest.Matchers.is(true))));
    }
}
