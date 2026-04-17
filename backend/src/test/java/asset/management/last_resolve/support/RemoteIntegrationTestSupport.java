package asset.management.last_resolve.support;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
public abstract class RemoteIntegrationTestSupport {

    protected static final String ADMIN_USERNAME = "admin";
    protected static final String OFFICER_USERNAME = "officer";
    protected static final String MANAGER_USERNAME = "manager";
    protected static final String EMPLOYEE_USERNAME = "employee";
    protected static final String AUDITOR_USERNAME = "auditor";
    protected static final String IT_EMPLOYEE_USERNAME = "canderson";
    protected static final String HR_MANAGER_USERNAME = "emily";
    protected static final String DEMO_PASSWORD = "demo123";
    protected static final String INACTIVE_USERNAME = "inactivehr";

    protected static final String HR_LAPTOP_ID = "00000000-0000-0000-0000-000000000515";
    protected static final String HR_THINKPAD_ID = "00000000-0000-0000-0000-000000000510";
    protected static final String IT_MACBOOK_ID = "00000000-0000-0000-0000-000000000501";
    protected static final String IT_SERVER_ID = "00000000-0000-0000-0000-000000000504";
    protected static final String HR_BORROW_REQUEST_ID = "00000000-0000-0000-0000-000000000703";
    protected static final String ACTIVE_CAMPAIGN_ID = "00000000-0000-0000-0000-000000000802";

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    protected String bearer(String token) {
        return "Bearer " + token;
    }

    protected String uniqueSuffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    protected String login(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "username", username,
                    "password", password
                ))))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
        return body.get("token").asText();
    }
}
