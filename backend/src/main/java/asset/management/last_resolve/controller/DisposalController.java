package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.service.DisposalService;
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
@RequestMapping("/api/disposal")
@RequiredArgsConstructor
public class DisposalController {

    private final DisposalService disposalService;

    @GetMapping
    @PreAuthorize("hasAuthority('disposal.read')")
    public ResponseEntity<CommonDtos.PageResponse<WorkflowDtos.DisposalRequestResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(disposalService.list(search, status, page, size));
    }

    @PostMapping("/{disposalId}/approve")
    @PreAuthorize("hasAuthority('disposal.manage')")
    public ResponseEntity<WorkflowDtos.DisposalRequestResponse> approve(@PathVariable UUID disposalId, @RequestBody(required = false) WorkflowDtos.DecisionRequest request) {
        WorkflowDtos.DecisionRequest safeRequest = request == null ? new WorkflowDtos.DecisionRequest(null) : request;
        return ResponseEntity.ok(disposalService.approve(disposalId, safeRequest));
    }

    @PostMapping("/{disposalId}/reject")
    @PreAuthorize("hasAuthority('disposal.manage')")
    public ResponseEntity<WorkflowDtos.DisposalRequestResponse> reject(@PathVariable UUID disposalId, @RequestBody(required = false) WorkflowDtos.DecisionRequest request) {
        WorkflowDtos.DecisionRequest safeRequest = request == null ? new WorkflowDtos.DecisionRequest(null) : request;
        return ResponseEntity.ok(disposalService.reject(disposalId, safeRequest));
    }

    @PostMapping("/{disposalId}/defer")
    @PreAuthorize("hasAuthority('disposal.manage')")
    public ResponseEntity<WorkflowDtos.DisposalRequestResponse> defer(@PathVariable UUID disposalId, @RequestBody(required = false) WorkflowDtos.DecisionRequest request) {
        WorkflowDtos.DecisionRequest safeRequest = request == null ? new WorkflowDtos.DecisionRequest(null) : request;
        return ResponseEntity.ok(disposalService.defer(disposalId, safeRequest));
    }
}
