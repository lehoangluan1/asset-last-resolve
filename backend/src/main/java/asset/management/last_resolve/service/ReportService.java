package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.ReportDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.mapper.CommonMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AuditLogRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final AssetRepository assetRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final CommonMapper commonMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;

    @Transactional(readOnly = true)
    public ReportDtos.ReportSummaryResponse summary() {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canViewReports(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("You do not have access to reports");
        }
        long totalAssets = assetRepository.findAll().stream()
            .filter(asset -> authorizationService.canViewAsset(currentUser, asset))
            .count();
        long openDiscrepancies = discrepancyRepository.findAll().stream()
            .filter(discrepancy -> authorizationService.canViewDiscrepancy(currentUser, discrepancy))
            .filter(discrepancy -> !discrepancy.getStatus().getValue().equals("resolved"))
            .count();
        long activeMaintenance = maintenanceRecordRepository.findAll().stream()
            .filter(record -> authorizationService.canViewMaintenance(currentUser, record))
            .filter(record -> !record.getStatus().getValue().equals("completed"))
            .count();
        long activeBorrows = borrowRequestRepository.findAll().stream()
            .filter(request -> authorizationService.canViewBorrowRequest(currentUser, request))
            .filter(request -> request.getStatus().getValue().equals("checked-out"))
            .count();
        return new ReportDtos.ReportSummaryResponse(totalAssets, openDiscrepancies, activeMaintenance, activeBorrows);
    }

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<CommonDtos.AuditLogResponse> auditLogs(String search, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canViewReports(currentUser)) {
            throw new asset.management.last_resolve.exception.ForbiddenOperationException("You do not have access to reports");
        }
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<CommonDtos.AuditLogResponse> items = auditLogRepository.findAll().stream()
            .filter(log -> currentUser.getRole().name().equals("MANAGER")
                ? log.getActorUser() != null && log.getActorUser().getDepartment().getId().equals(currentUser.getDepartment().getId())
                : true)
            .filter(log -> normalizedSearch.isBlank()
                || log.getActorName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || log.getEntityName().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .sorted(Comparator.comparing(item -> item.getCreatedAt(), Comparator.reverseOrder()))
            .map(commonMapper::toAuditLogResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }
}
