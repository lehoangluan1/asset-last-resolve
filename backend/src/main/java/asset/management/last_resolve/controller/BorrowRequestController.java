package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.service.BorrowRequestService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/borrow-requests")
@RequiredArgsConstructor
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    @GetMapping
    @PreAuthorize("hasAuthority('borrows.read')")
    public ResponseEntity<CommonDtos.PageResponse<WorkflowDtos.BorrowRequestResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(borrowRequestService.list(search, status, page, size));
    }

    @GetMapping("/{requestId}")
    @PreAuthorize("hasAuthority('borrows.read')")
    public ResponseEntity<WorkflowDtos.BorrowRequestResponse> get(@PathVariable UUID requestId) {
        return ResponseEntity.ok(borrowRequestService.get(requestId));
    }

    @GetMapping("/{requestId}/available-assets")
    @PreAuthorize("hasAuthority('borrows.approve')")
    public ResponseEntity<java.util.List<AssetDtos.AssetResponse>> availableAssets(@PathVariable UUID requestId) {
        return ResponseEntity.ok(borrowRequestService.availableAssets(requestId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('borrows.request')")
    public ResponseEntity<WorkflowDtos.BorrowRequestResponse> create(@Valid @RequestBody WorkflowDtos.BorrowRequestCreateRequest request) {
        return ResponseEntity.ok(borrowRequestService.create(request));
    }

    @PostMapping("/{requestId}/approve")
    @PreAuthorize("hasAuthority('borrows.approve')")
    public ResponseEntity<WorkflowDtos.BorrowRequestResponse> approve(
        @PathVariable UUID requestId,
        @RequestBody(required = false) WorkflowDtos.BorrowApprovalRequest request
    ) {
        WorkflowDtos.BorrowApprovalRequest safeRequest = request == null ? new WorkflowDtos.BorrowApprovalRequest(null, null) : request;
        return ResponseEntity.ok(borrowRequestService.approve(requestId, safeRequest));
    }

    @PostMapping("/{requestId}/reject")
    @PreAuthorize("hasAuthority('borrows.approve')")
    public ResponseEntity<WorkflowDtos.BorrowRequestResponse> reject(
        @PathVariable UUID requestId,
        @RequestBody(required = false) WorkflowDtos.DecisionRequest request
    ) {
        WorkflowDtos.DecisionRequest safeRequest = request == null ? new WorkflowDtos.DecisionRequest(null) : request;
        return ResponseEntity.ok(borrowRequestService.reject(requestId, safeRequest));
    }
}
