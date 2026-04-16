package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.service.VerificationService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/verification")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping("/campaigns")
    @PreAuthorize("hasAuthority('verification.read')")
    public ResponseEntity<List<WorkflowDtos.VerificationCampaignResponse>> campaigns() {
        return ResponseEntity.ok(verificationService.listCampaigns());
    }

    @GetMapping("/campaigns/{campaignId}")
    @PreAuthorize("hasAuthority('verification.read')")
    public ResponseEntity<WorkflowDtos.VerificationCampaignResponse> campaign(@PathVariable UUID campaignId) {
        return ResponseEntity.ok(verificationService.getCampaign(campaignId));
    }

    @PostMapping("/campaigns")
    @PreAuthorize("hasAuthority('verification.manage')")
    public ResponseEntity<WorkflowDtos.VerificationCampaignResponse> createCampaign(@Valid @RequestBody WorkflowDtos.VerificationCampaignCreateRequest request) {
        return ResponseEntity.ok(verificationService.createCampaign(request));
    }
}
