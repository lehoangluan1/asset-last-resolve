package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    @PreAuthorize("hasAuthority('assignments.read')")
    public ResponseEntity<CommonDtos.PageResponse<WorkflowDtos.AssignmentResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String type,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(assignmentService.list(search, type, page, size));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('assignments.manage')")
    public ResponseEntity<WorkflowDtos.AssignmentResponse> create(@Valid @RequestBody WorkflowDtos.AssignmentCreateRequest request) {
        return ResponseEntity.ok(assignmentService.create(request));
    }
}
