package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.service.MaintenanceService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    @PreAuthorize("hasAuthority('maintenance.read')")
    public ResponseEntity<CommonDtos.PageResponse<WorkflowDtos.MaintenanceRecordResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(maintenanceService.list(search, status, page, size));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('maintenance.manage')")
    public ResponseEntity<WorkflowDtos.MaintenanceRecordResponse> create(@Valid @RequestBody WorkflowDtos.MaintenanceCreateRequest request) {
        return ResponseEntity.ok(maintenanceService.create(request));
    }

    @PatchMapping("/{recordId}/status")
    @PreAuthorize("hasAuthority('maintenance.manage')")
    public ResponseEntity<WorkflowDtos.MaintenanceRecordResponse> updateStatus(
        @PathVariable UUID recordId,
        @Valid @RequestBody WorkflowDtos.MaintenanceStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(maintenanceService.updateStatus(recordId, request));
    }
}
