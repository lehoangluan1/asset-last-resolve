package asset.management.last_resolve.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;

class SearchControllerIT extends IntegrationTestSupport {

    @Test
    void adminSearchCanReturnUserResults() throws Exception {
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/search")
                .queryParam("q", "Sarah")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.query").value("Sarah"))
            .andExpect(jsonPath("$.totalResults").value(greaterThanOrEqualTo(1)))
            .andExpect(jsonPath("$.sections[0].key").value("users"))
            .andExpect(jsonPath("$.sections[0].items[0].title").value("Sarah Chen"));
    }

    @Test
    void employeeSearchOnlyReturnsAssetsWithinScope() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/search")
                .queryParam("q", "ThinkPad")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.sections[0].key").value("assets"))
            .andExpect(jsonPath("$.sections[0].items[0].title").value("ThinkPad X1 Carbon"));

        mockMvc.perform(get("/api/search")
                .queryParam("q", "PowerEdge")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalResults").value(0))
            .andExpect(jsonPath("$.sections").isEmpty());
    }
}
