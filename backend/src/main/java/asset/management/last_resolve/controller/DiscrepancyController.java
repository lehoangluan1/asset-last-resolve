package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.service.DiscrepancyService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/discrepancies")
@RequiredArgsConstructor
public class DiscrepancyController {

    private final DiscrepancyService discrepancyService;

    @GetMapping
    @PreAuthorize("hasAuthority('discrepancies.read')")
    public ResponseEntity<CommonDtos.PageResponse<WorkflowDtos.DiscrepancyResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String severity,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(discrepancyService.list(search, status, severity, page, size));
    }

    @GetMapping("/{discrepancyId}")
    @PreAuthorize("hasAuthority('discrepancies.read')")
    public ResponseEntity<WorkflowDtos.DiscrepancyResponse> get(@PathVariable UUID discrepancyId) {
        return ResponseEntity.ok(discrepancyService.get(discrepancyId));
    }

    @PostMapping("/{discrepancyId}/reconcile")
    @PreAuthorize("hasAuthority('discrepancies.manage')")
    public ResponseEntity<WorkflowDtos.DiscrepancyResponse> reconcile(@PathVariable UUID discrepancyId, @RequestBody(required = false) WorkflowDtos.DiscrepancyActionRequest request) {
        WorkflowDtos.DiscrepancyActionRequest safeRequest = request == null ? new WorkflowDtos.DiscrepancyActionRequest(null, null, null) : request;
        return ResponseEntity.ok(discrepancyService.reconcile(discrepancyId, safeRequest));
    }

    @PostMapping("/{discrepancyId}/escalate")
    @PreAuthorize("hasAuthority('discrepancies.manage')")
    public ResponseEntity<WorkflowDtos.DiscrepancyResponse> escalate(@PathVariable UUID discrepancyId, @RequestBody(required = false) WorkflowDtos.DiscrepancyActionRequest request) {
        WorkflowDtos.DiscrepancyActionRequest safeRequest = request == null ? new WorkflowDtos.DiscrepancyActionRequest(null, null, null) : request;
        return ResponseEntity.ok(discrepancyService.escalate(discrepancyId, safeRequest));
    }

    @PostMapping("/{discrepancyId}/maintenance")
    @PreAuthorize("hasAuthority('discrepancies.manage')")
    public ResponseEntity<WorkflowDtos.DiscrepancyResponse> maintenance(@PathVariable UUID discrepancyId, @RequestBody(required = false) WorkflowDtos.DiscrepancyActionRequest request) {
        WorkflowDtos.DiscrepancyActionRequest safeRequest = request == null ? new WorkflowDtos.DiscrepancyActionRequest(null, null, null) : request;
        return ResponseEntity.ok(discrepancyService.sendToMaintenance(discrepancyId, safeRequest));
    }
}
