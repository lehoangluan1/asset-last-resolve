package asset.management.last_resolve.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.IntegrationTestSupport;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;

class DashboardScopeIT extends IntegrationTestSupport {

    @Test
    void adminDashboardShowsAdminRoleAndVerificationSummary() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/dashboard")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("admin"))
            .andExpect(jsonPath("$.activeCampaign.id").value(ACTIVE_CAMPAIGN_ID))
            .andExpect(jsonPath("$.stats[?(@.key=='discrepancies')]").exists());
    }

    @Test
    void employeeDashboardIsRoleScoped() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/dashboard")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("employee"))
            .andExpect(jsonPath("$.activeCampaign").value(Matchers.nullValue()));
    }

    @Test
    void employeeAssetListOnlyReturnsVisibleScope() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/assets")
                .queryParam("search", "ThinkPad")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(1))
            .andExpect(jsonPath("$.items[0].id").value(HR_THINKPAD_ID));

        mockMvc.perform(get("/api/assets")
                .queryParam("search", "PowerEdge")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(0));
    }

    @Test
    void employeeCannotOpenOutOfScopeAssetDetail() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/assets/" + IT_SERVER_ID)
                .header("Authorization", bearer(token)))
            .andExpect(status().isForbidden());
    }
}
