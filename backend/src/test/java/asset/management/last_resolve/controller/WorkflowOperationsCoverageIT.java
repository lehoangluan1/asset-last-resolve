package asset.management.last_resolve.controller;

import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.DisposalRequest;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.entity.VerificationTask;
import asset.management.last_resolve.enums.DiscrepancySeverity;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.DiscrepancyType;
import asset.management.last_resolve.enums.DisposalStatus;
import asset.management.last_resolve.enums.VerificationResult;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.DisposalRequestRepository;
import asset.management.last_resolve.repository.VerificationCampaignRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import asset.management.last_resolve.support.RemoteIntegrationTestSupport;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class WorkflowOperationsCoverageIT extends RemoteIntegrationTestSupport {

    @Autowired private AssetRepository assetRepository;
    @Autowired private AppUserRepository appUserRepository;
    @Autowired private VerificationCampaignRepository verificationCampaignRepository;
    @Autowired private VerificationTaskRepository verificationTaskRepository;
    @Autowired private DiscrepancyRepository discrepancyRepository;
    @Autowired private DisposalRequestRepository disposalRequestRepository;

    @Test
    void maintenanceEndpointsSupportListingAndCreation() throws Exception {
        String token = login(OFFICER_USERNAME, DEMO_PASSWORD);
        String assetId = createCoverageMaintenanceAsset(token);

        mockMvc.perform(get("/api/maintenance")
                .queryParam("status", "in-progress")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items[0].status").value("in-progress"));

        mockMvc.perform(post("/api/maintenance")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", assetId,
                    "type", "Inspection",
                    "description", "Coverage maintenance " + uniqueSuffix(),
                    "techCondition", "good",
                    "status", "scheduled",
                    "priority", "normal",
                    "assignedToUserId", "00000000-0000-0000-0000-000000000405",
                    "scheduledDate", "2026-05-20",
                    "notes", "Created by integration coverage"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.type").value("Inspection"))
            .andExpect(jsonPath("$.status").value("scheduled"));
    }

    @Test
    void maintenanceCreateValidatesRequiredFields() throws Exception {
        String token = login(OFFICER_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/maintenance")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "assetId", "",
                    "type", "",
                    "description", "",
                    "techCondition", "",
                    "status", "",
                    "priority", "",
                    "assignedToUserId", "",
                    "scheduledDate", ""
                ))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    void discrepancyEndpointsCoverDetailAndTransitions() throws Exception {
        Discrepancy reconcileTarget = createCoverageDiscrepancy();
        Discrepancy escalateTarget = createCoverageDiscrepancy();
        Discrepancy maintenanceTarget = createCoverageDiscrepancy();
        String token = login(AUDITOR_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/discrepancies")
                .queryParam("status", "open")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/discrepancies/" + reconcileTarget.getId())
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(reconcileTarget.getId().toString()));

        mockMvc.perform(post("/api/discrepancies/" + reconcileTarget.getId() + "/reconcile")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "rootCause", "Coverage root cause",
                    "resolution", "Resolved by integration coverage",
                    "notes", "Coverage reconcile"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("resolved"));

        mockMvc.perform(post("/api/discrepancies/" + escalateTarget.getId() + "/escalate")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "rootCause", "Coverage investigation",
                    "notes", "Escalated by integration coverage"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("escalated"));

        mockMvc.perform(post("/api/discrepancies/" + maintenanceTarget.getId() + "/maintenance")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of(
                    "notes", "Send to maintenance from coverage flow"
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("investigating"));
    }

    @Test
    void disposalEndpointsCoverListAndDecisionActions() throws Exception {
        DisposalRequest approveTarget = createCoverageDisposalRequest();
        DisposalRequest rejectTarget = createCoverageDisposalRequest();
        DisposalRequest deferTarget = createCoverageDisposalRequest();
        String token = login(ADMIN_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(get("/api/disposal")
                .queryParam("status", "proposed")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.items.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));

        mockMvc.perform(post("/api/disposal/" + approveTarget.getId() + "/approve")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Approved by coverage flow"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("approved"));

        mockMvc.perform(post("/api/disposal/" + rejectTarget.getId() + "/reject")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Rejected by coverage flow"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("rejected"));

        mockMvc.perform(post("/api/disposal/" + deferTarget.getId() + "/defer")
                .header("Authorization", bearer(token))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Map.of("notes", "Deferred by coverage flow"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("deferred"));
    }

    @Test
    void notificationReadEndpointMarksSingleNotificationRead() throws Exception {
        String token = login(EMPLOYEE_USERNAME, DEMO_PASSWORD);

        mockMvc.perform(post("/api/notifications/00000000-0000-0000-0000-000000001302/read")
                .header("Authorization", bearer(token)))
            .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/notifications")
                .header("Authorization", bearer(token)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[?(@.id=='00000000-0000-0000-0000-000000001302')].read").value(org.hamcrest.Matchers.hasItem(true)));
    }

    private Discrepancy createCoverageDiscrepancy() {
        Asset asset = assetRepository.findById(UUID.fromString(IT_SERVER_ID)).orElseThrow();
        AppUser auditor = appUserRepository.findByUsernameIgnoreCase(AUDITOR_USERNAME).orElseThrow();
        VerificationCampaign campaign = verificationCampaignRepository.findById(UUID.fromString(ACTIVE_CAMPAIGN_ID)).orElseThrow();

        VerificationTask task = new VerificationTask();
        task.setCampaign(campaign);
        task.setAsset(asset);
        task.setAssignedToUser(auditor);
        task.setExpectedLocation(asset.getLocation());
        task.setExpectedCondition(asset.getCondition());
        task.setExpectedAssignee(asset.getAssignedToUser());
        task.setResult(VerificationResult.PENDING);
        task.setNotes("Coverage task " + uniqueSuffix());
        task = verificationTaskRepository.save(task);

        Discrepancy discrepancy = new Discrepancy();
        discrepancy.setCampaign(campaign);
        discrepancy.setTask(task);
        discrepancy.setAsset(asset);
        discrepancy.setType(DiscrepancyType.LOCATION);
        discrepancy.setSeverity(DiscrepancySeverity.HIGH);
        discrepancy.setStatus(DiscrepancyStatus.OPEN);
        discrepancy.setExpectedValue("Server Room");
        discrepancy.setObservedValue("Warehouse " + uniqueSuffix());
        discrepancy.setCreatedBy(auditor);
        return discrepancyRepository.save(discrepancy);
    }

    private DisposalRequest createCoverageDisposalRequest() {
        Asset asset = assetRepository.findById(UUID.fromString(HR_LAPTOP_ID)).orElseThrow();
        AppUser proposer = appUserRepository.findByUsernameIgnoreCase(HR_MANAGER_USERNAME).orElseThrow();

        DisposalRequest request = new DisposalRequest();
        request.setAsset(asset);
        request.setReason("Coverage disposal " + uniqueSuffix());
        request.setStatus(DisposalStatus.PROPOSED);
        request.setProposedBy(proposer);
        request.setEstimatedValue(BigDecimal.valueOf(125));
        request.setNotes("Created by integration coverage");
        return disposalRequestRepository.save(request);
    }

    private String createCoverageMaintenanceAsset(String officerToken) throws Exception {
        String suffix = uniqueSuffix().toUpperCase();
        org.springframework.test.web.servlet.MvcResult result = mockMvc.perform(post("/api/assets")
                .header("Authorization", bearer(officerToken))
                .contentType(APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new java.util.LinkedHashMap<String, Object>() {{
                    put("name", "Maintenance Coverage " + suffix);
                    put("code", "MNT-" + suffix);
                    put("categoryId", "00000000-0000-0000-0000-000000000301");
                    put("departmentId", "00000000-0000-0000-0000-000000000102");
                    put("locationId", "00000000-0000-0000-0000-000000000203");
                    put("brand", "Lenovo");
                    put("model", "Coverage");
                    put("serialNumber", "MNT-SER-" + suffix);
                    put("purchaseDate", "2026-04-01");
                    put("purchasePrice", 1250.0);
                    put("warrantyExpiry", "2028-04-01");
                    put("borrowable", true);
                    put("notes", "Created for maintenance coverage");
                    put("condition", "good");
                    put("description", "Fresh asset for maintenance integration coverage");
                }})))
            .andExpect(status().isOk())
            .andReturn();

        return objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
    }
}
