package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.support.IntegrationTestSupport;
import com.fasterxml.jackson.databind.JsonNode;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;

class BorrowRequestControllerIT extends IntegrationTestSupport {

    @Test
    void employeeCanCreateBorrowRequestForOwnScope() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", HR_LAPTOP_ID,
                    "borrowDate", "2026-04-24",
                    "returnDate", "2026-04-26",
                    "purpose", "HR offsite workshop",
                    "notes", "Need a spare device"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.requesterName").value("David Kim"))
            .andExpect(jsonPath("$.status").value("pending-approval"));
    }

    @Test
    void employeeCannotApproveBorrowRequests() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests/" + HR_BORROW_REQUEST_ID + "/approve")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "No authority"))))
            .andExpect(status().isForbidden());
    }

    @Test
    void departmentManagerCanApproveOwnDepartmentRequest() throws Exception {
        String employeeToken = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);
        MvcResult creation = mockMvc.perform(post("/api/borrow-requests")
                .header("Authorization", bearer(employeeToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", HR_THINKPAD_ID,
                    "borrowDate", "2026-05-01",
                    "returnDate", "2026-05-03",
                    "purpose", "Interview panel backup",
                    "notes", "Manager approval test"
                ))))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode created = objectMapper.readTree(creation.getResponse().getContentAsString());
        String requestId = created.get("id").asText();
        String managerToken = login(HR_MANAGER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests/" + requestId + "/approve")
                .header("Authorization", bearer(managerToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Approved for HR use"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("approved"));
    }

    @Test
    void differentDepartmentManagerCannotApproveRequest() throws Exception {
        String employeeToken = login(IT_EMPLOYEE_USERNAME, DEMO_PASSWORD);
        MvcResult creation = mockMvc.perform(post("/api/borrow-requests")
                .header("Authorization", bearer(employeeToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", IT_MACBOOK_ID,
                    "borrowDate", "2026-05-04",
                    "returnDate", "2026-05-05",
                    "purpose", "Field support",
                    "notes", "Cross-department denial test"
                ))))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode created = objectMapper.readTree(creation.getResponse().getContentAsString());
        String requestId = created.get("id").asText();
        String hrManagerToken = login(HR_MANAGER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/borrow-requests/" + requestId + "/approve")
                .header("Authorization", bearer(hrManagerToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Should fail"))))
            .andExpect(status().isForbidden());
    }
}
