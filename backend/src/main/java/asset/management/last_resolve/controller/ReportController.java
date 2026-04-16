package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.ReportDtos;
import asset.management.last_resolve.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/summary")
    @PreAuthorize("hasAuthority('reports.read')")
    public ResponseEntity<ReportDtos.ReportSummaryResponse> summary() {
        return ResponseEntity.ok(reportService.summary());
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAuthority('reports.read')")
    public ResponseEntity<CommonDtos.PageResponse<CommonDtos.AuditLogResponse>> auditLogs(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(reportService.auditLogs(search, page, size));
    }
}
