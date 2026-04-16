package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.DashboardDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.DisposalStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.mapper.CommonMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AuditLogRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.DisposalRequestRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.repository.VerificationCampaignRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final Set<BorrowStatus> ACTIVE_BORROW_STATUSES = Set.of(
        BorrowStatus.PENDING_APPROVAL,
        BorrowStatus.APPROVED,
        BorrowStatus.CHECKED_OUT
    );

    private final AssetRepository assetRepository;
    private final DepartmentRepository departmentRepository;
    private final VerificationCampaignRepository verificationCampaignRepository;
    private final VerificationTaskRepository verificationTaskRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final DisposalRequestRepository disposalRequestRepository;
    private final AuditLogRepository auditLogRepository;
    private final CommonMapper commonMapper;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;

    @Transactional(readOnly = true)
    public DashboardDtos.DashboardResponse getDashboard() {
        AppUser currentUser = currentUserService.currentUser();
        boolean showVerificationSummary = authorizationService.canManageVerification(currentUser) || currentUser.getRole() == UserRole.MANAGER;
        List<asset.management.last_resolve.entity.Asset> visibleAssets = assetRepository.findAll().stream()
            .filter(asset -> authorizationService.canViewAsset(currentUser, asset))
            .toList();
        List<asset.management.last_resolve.entity.BorrowRequest> visibleBorrows = borrowRequestRepository.findAll().stream()
            .filter(request -> authorizationService.canViewBorrowRequest(currentUser, request))
            .toList();
        List<asset.management.last_resolve.entity.Discrepancy> visibleDiscrepancies = discrepancyRepository.findAll().stream()
            .filter(discrepancy -> authorizationService.canViewDiscrepancy(currentUser, discrepancy))
            .toList();
        List<asset.management.last_resolve.entity.MaintenanceRecord> visibleMaintenance = maintenanceRecordRepository.findAll().stream()
            .filter(record -> authorizationService.canViewMaintenance(currentUser, record))
            .toList();
        List<asset.management.last_resolve.entity.DisposalRequest> visibleDisposals = disposalRequestRepository.findAll().stream()
            .filter(request -> authorizationService.canViewDisposal(currentUser, request))
            .toList();

        List<DashboardDtos.DashboardStatResponse> stats = new ArrayList<>();
        stats.add(new DashboardDtos.DashboardStatResponse("total-assets", "Total Assets", visibleAssets.size(), "primary", "In your current scope"));
        stats.add(new DashboardDtos.DashboardStatResponse("in-use", "In Use", countAssetsByLifecycle(visibleAssets, LifecycleStatus.IN_USE), "success", null));
        if (showVerificationSummary) {
            stats.add(new DashboardDtos.DashboardStatResponse("discrepancies", "Discrepancies", visibleDiscrepancies.stream().filter(item -> item.getStatus() != DiscrepancyStatus.RESOLVED).count(), "destructive", null));
        }
        if (authorizationService.canManageMaintenance(currentUser) || currentUser.getRole() == UserRole.MANAGER) {
            stats.add(new DashboardDtos.DashboardStatResponse("maintenance", "Maintenance", visibleMaintenance.stream().filter(item -> item.getStatus() != MaintenanceStatus.COMPLETED).count(), "warning", null));
        }
        if (authorizationService.canManageDisposal(currentUser)) {
            stats.add(new DashboardDtos.DashboardStatResponse("pending-disposal", "Pending Disposal", visibleDisposals.stream().filter(item -> item.getStatus() != DisposalStatus.COMPLETED).count(), "default", null));
        }
        if (authorizationService.isOneOf(currentUser, UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.OFFICER, UserRole.ADMIN)) {
            stats.add(new DashboardDtos.DashboardStatResponse("active-borrows", "Active Borrows", countActiveBorrows(visibleBorrows), "info", null));
        }

        List<DashboardDtos.DistributionItemResponse> departmentDistribution = departmentRepository.findAll().stream()
            .filter(department -> currentUser.getRole() == UserRole.MANAGER ? department.getId().equals(currentUser.getDepartment().getId()) : true)
            .map(department -> new DashboardDtos.DistributionItemResponse(
                department.getCode(),
                visibleAssets.stream().filter(asset -> asset.getDepartment().getId().equals(department.getId())).count()
            ))
            .toList();

        List<DashboardDtos.DistributionItemResponse> statusBreakdown = List.of(
            new DashboardDtos.DistributionItemResponse("In Use", countAssetsByLifecycle(visibleAssets, LifecycleStatus.IN_USE)),
            new DashboardDtos.DistributionItemResponse("In Storage", countAssetsByLifecycle(visibleAssets, LifecycleStatus.IN_STORAGE)),
            new DashboardDtos.DistributionItemResponse("Maintenance", countAssetsByLifecycle(visibleAssets, LifecycleStatus.UNDER_MAINTENANCE)),
            new DashboardDtos.DistributionItemResponse("Pending Disposal", countAssetsByLifecycle(visibleAssets, LifecycleStatus.PENDING_DISPOSAL)),
            new DashboardDtos.DistributionItemResponse("Disposed", countAssetsByLifecycle(visibleAssets, LifecycleStatus.DISPOSED)),
            new DashboardDtos.DistributionItemResponse("Borrowed", countAssetsByLifecycle(visibleAssets, LifecycleStatus.BORROWED))
        );

        DashboardDtos.ActiveCampaignResponse activeCampaign = activeCampaignFor(currentUser, showVerificationSummary);

        List<DashboardDtos.DeadlineItemResponse> upcomingDeadlines = new ArrayList<>();
        if (activeCampaign != null) {
            upcomingDeadlines.add(new DashboardDtos.DeadlineItemResponse(activeCampaign.name(), activeCampaign.dueDate(), "warning"));
        }
        visibleMaintenance.stream()
            .sorted(Comparator.comparing(item -> item.getScheduledDate(), Comparator.nullsLast(Comparator.naturalOrder())))
            .limit(2)
            .forEach(item -> upcomingDeadlines.add(new DashboardDtos.DeadlineItemResponse(item.getAsset().getName() + " maintenance", item.getScheduledDate().toString(), item.getStatus().getValue())));
        visibleBorrows.stream()
            .filter(item -> item.getReturnDate() != null && item.getStatus().getValue().equals("checked-out"))
            .sorted(Comparator.comparing(item -> item.getReturnDate()))
            .limit(2)
            .forEach(item -> upcomingDeadlines.add(new DashboardDtos.DeadlineItemResponse(item.getAsset().getName() + " return", item.getReturnDate().toString(), "pending")));

        Set<String> visibleEntityIds = java.util.stream.Stream.of(
                visibleAssets.stream().map(asset -> asset.getId().toString()),
                visibleBorrows.stream().map(request -> request.getId().toString()),
                visibleDiscrepancies.stream().map(discrepancy -> discrepancy.getId().toString()),
                visibleMaintenance.stream().map(record -> record.getId().toString()),
                visibleDisposals.stream().map(request -> request.getId().toString())
            )
            .flatMap(stream -> stream)
            .collect(java.util.stream.Collectors.toSet());

        List<CommonDtos.AuditLogResponse> recentActivity = auditLogRepository.findTop8ByOrderByCreatedAtDesc().stream()
            .filter(log -> authorizationService.canViewAuditLog(currentUser, log, visibleEntityIds))
            .map(commonMapper::toAuditLogResponse)
            .toList();

        return new DashboardDtos.DashboardResponse(
            currentUser.getRole().getValue(),
            stats,
            departmentDistribution,
            statusBreakdown,
            activeCampaign,
            recentActivity,
            upcomingDeadlines
        );
    }

    private DashboardDtos.ActiveCampaignResponse activeCampaignFor(AppUser currentUser, boolean showVerificationSummary) {
        if (!showVerificationSummary) {
            return null;
        }
        return verificationCampaignRepository.findFirstByStatusOrderByStartDateDesc(CampaignStatus.ACTIVE)
            .filter(campaign -> authorizationService.canViewVerificationCampaign(currentUser, campaign))
            .map(campaign -> {
                List<asset.management.last_resolve.entity.VerificationTask> tasks = verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(campaign.getId());
                long completed = tasks.stream().filter(task -> task.getVerifiedAt() != null).count();
                long discrepancies = tasks.stream().filter(task -> task.getResult().getValue().equals("discrepancy")).count();
                return new DashboardDtos.ActiveCampaignResponse(
                    campaign.getId().toString(),
                    campaign.getName(),
                    campaign.getScope(),
                    campaign.getDueDate().toString(),
                    tasks.size(),
                    (int) completed,
                    (int) discrepancies
                );
            })
            .orElse(null);
    }

    private long countAssetsByLifecycle(List<asset.management.last_resolve.entity.Asset> assets, LifecycleStatus status) {
        return assets.stream().filter(asset -> asset.getLifecycleStatus() == status).count();
    }

    private long countActiveBorrows(List<asset.management.last_resolve.entity.BorrowRequest> borrowRequests) {
        return borrowRequests.stream()
            .filter(item -> ACTIVE_BORROW_STATUSES.contains(item.getStatus()))
            .count();
    }
}
