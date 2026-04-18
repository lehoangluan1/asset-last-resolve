package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.ReportDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.AuditLog;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.CommonMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AuditLogRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReportServiceCoverageTest {

    @Mock private AssetRepository assetRepository;
    @Mock private DiscrepancyRepository discrepancyRepository;
    @Mock private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock private BorrowRequestRepository borrowRequestRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private CommonMapper commonMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;

    private ReportService service;
    private AppUser admin;

    @BeforeEach
    void setUp() {
        service = new ReportService(
            assetRepository,
            discrepancyRepository,
            maintenanceRecordRepository,
            borrowRequestRepository,
            auditLogRepository,
            commonMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService
        );

        Department department = TestDataFactory.department("IT");
        admin = TestDataFactory.user(UserRole.ADMIN, department, "admin");
    }

    @Test
    void summaryRejectsUnauthorizedUsers() {
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canViewReports(admin)).thenReturn(false);

        assertThatThrownBy(service::summary)
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("access to reports");
    }

    @Test
    void summaryCountsOnlyVisibleOpenWorkItems() {
        Asset asset = TestDataFactory.asset(admin.getDepartment(), null, false, LifecycleStatus.IN_USE);
        Discrepancy discrepancy = TestDataFactory.discrepancy(TestDataFactory.campaign("VER", CampaignStatus.ACTIVE, java.util.Set.of(admin.getDepartment()), admin), asset, admin, DiscrepancyStatus.OPEN);
        MaintenanceRecord maintenance = TestDataFactory.maintenanceRecord(asset, admin, MaintenanceStatus.IN_PROGRESS);
        BorrowRequest borrowRequest = TestDataFactory.borrowRequest(asset, admin, BorrowStatus.CHECKED_OUT);
        borrowRequest.setCheckedOutAt(java.time.OffsetDateTime.now());
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canViewReports(admin)).thenReturn(true);
        when(assetRepository.findAll()).thenReturn(List.of(asset));
        when(authorizationService.canViewAsset(admin, asset)).thenReturn(true);
        when(discrepancyRepository.findAll()).thenReturn(List.of(discrepancy));
        when(authorizationService.canViewDiscrepancy(admin, discrepancy)).thenReturn(true);
        when(maintenanceRecordRepository.findAll()).thenReturn(List.of(maintenance));
        when(authorizationService.canViewMaintenance(admin, maintenance)).thenReturn(true);
        when(borrowRequestRepository.findAll()).thenReturn(List.of(borrowRequest));
        when(authorizationService.canViewBorrowRequest(admin, borrowRequest)).thenReturn(true);

        ReportDtos.ReportSummaryResponse result = service.summary();

        assertThat(result.totalAssets()).isEqualTo(1);
        assertThat(result.openDiscrepancies()).isEqualTo(1);
        assertThat(result.activeMaintenance()).isEqualTo(1);
        assertThat(result.activeBorrows()).isEqualTo(1);
    }

    @Test
    void auditLogsAppliesSearchAndPaging() {
        AuditLog log = TestDataFactory.auditLog("Asset", "1", admin);
        CommonDtos.AuditLogResponse response = new CommonDtos.AuditLogResponse(
            log.getId().toString(), log.getActorName(), log.getAction(), log.getEntityType(), log.getEntityId(),
            log.getEntityName(), log.getCreatedAt().toString(), log.getDetails(), log.getCorrelationId()
        );
        CommonDtos.PageResponse<CommonDtos.AuditLogResponse> page = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canViewReports(admin)).thenReturn(true);
        when(auditLogRepository.findAll()).thenReturn(List.of(log));
        when(commonMapper.toAuditLogResponse(log)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(page);

        CommonDtos.PageResponse<CommonDtos.AuditLogResponse> result = service.auditLogs(admin.getFullName(), 0, 10);

        assertThat(result.items()).containsExactly(response);
    }
}
