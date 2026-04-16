package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.DashboardDtos;
import asset.management.last_resolve.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAuthority('dashboard.read')")
    public ResponseEntity<DashboardDtos.DashboardResponse> dashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }
}
