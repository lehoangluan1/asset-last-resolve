package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.DashboardDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
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
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DashboardServiceCoverageTest {

    @Mock private AssetRepository assetRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private VerificationCampaignRepository verificationCampaignRepository;
    @Mock private VerificationTaskRepository verificationTaskRepository;
    @Mock private DiscrepancyRepository discrepancyRepository;
    @Mock private BorrowRequestRepository borrowRequestRepository;
    @Mock private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock private DisposalRequestRepository disposalRequestRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private CommonMapper commonMapper;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;

    private DashboardService service;
    private Department department;
    private AppUser admin;
    private AppUser employee;
    private Asset asset;

    @BeforeEach
    void setUp() {
        service = new DashboardService(
            assetRepository,
            departmentRepository,
            verificationCampaignRepository,
            verificationTaskRepository,
            discrepancyRepository,
            borrowRequestRepository,
            maintenanceRecordRepository,
            disposalRequestRepository,
            auditLogRepository,
            commonMapper,
            currentUserService,
            authorizationService
        );

        department = TestDataFactory.department("IT");
        admin = TestDataFactory.user(UserRole.ADMIN, department, "admin");
        employee = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        asset = TestDataFactory.asset(department, employee, true, LifecycleStatus.IN_USE);
    }

    @Test
    void adminDashboardIncludesVerificationSummary() {
        VerificationCampaign campaign = TestDataFactory.campaign("VER-ADMIN", CampaignStatus.ACTIVE, Set.of(department), admin);
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageVerification(admin)).thenReturn(true);
        when(authorizationService.canManageMaintenance(admin)).thenReturn(true);
        when(authorizationService.canManageDisposal(admin)).thenReturn(true);
        when(authorizationService.isOneOf(admin, UserRole.MANAGER, UserRole.OFFICER, UserRole.ADMIN)).thenReturn(true);
        when(assetRepository.findAll()).thenReturn(List.of(asset));
        when(authorizationService.canViewAsset(admin, asset)).thenReturn(true);
        when(borrowRequestRepository.findAll()).thenReturn(List.of());
        when(discrepancyRepository.findAll()).thenReturn(List.of());
        when(maintenanceRecordRepository.findAll()).thenReturn(List.of());
        when(disposalRequestRepository.findAll()).thenReturn(List.of());
        when(departmentRepository.findAll()).thenReturn(List.of(department));
        when(verificationCampaignRepository.findFirstByStatusOrderByStartDateDesc(CampaignStatus.ACTIVE)).thenReturn(Optional.of(campaign));
        when(authorizationService.canViewVerificationCampaign(admin, campaign)).thenReturn(true);
        when(verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(campaign.getId())).thenReturn(List.of());
        when(auditLogRepository.findTop8ByOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDtos.DashboardResponse response = service.getDashboard();

        assertThat(response.role()).isEqualTo(UserRole.ADMIN.getValue());
        assertThat(response.activeCampaign()).isNotNull();
        assertThat(response.stats()).extracting(DashboardDtos.DashboardStatResponse::key).contains("discrepancies", "maintenance", "pending-disposal");
    }

    @Test
    void employeeDashboardOmitsVerificationCampaignSummary() {
        BorrowRequest borrowed = TestDataFactory.borrowRequest(asset, employee, BorrowStatus.APPROVED);
        borrowed.setCheckedOutAt(java.time.OffsetDateTime.now());
        when(currentUserService.currentUser()).thenReturn(employee);
        when(authorizationService.canManageVerification(employee)).thenReturn(false);
        when(authorizationService.canManageMaintenance(employee)).thenReturn(false);
        when(authorizationService.canManageDisposal(employee)).thenReturn(false);
        when(assetRepository.findAll()).thenReturn(List.of(asset));
        when(authorizationService.canViewAsset(employee, asset)).thenReturn(true);
        when(borrowRequestRepository.findAll()).thenReturn(List.of(borrowed));
        when(authorizationService.canViewBorrowRequest(employee, borrowed)).thenReturn(true);
        when(discrepancyRepository.findAll()).thenReturn(List.of());
        when(maintenanceRecordRepository.findAll()).thenReturn(List.of());
        when(disposalRequestRepository.findAll()).thenReturn(List.of());
        when(departmentRepository.findAll()).thenReturn(List.of(department));
        when(auditLogRepository.findTop8ByOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDtos.DashboardResponse response = service.getDashboard();

        assertThat(response.activeCampaign()).isNull();
        assertThat(response.stats()).extracting(DashboardDtos.DashboardStatResponse::key).doesNotContain("discrepancies", "pending-disposal");
        assertThat(response.stats()).extracting(DashboardDtos.DashboardStatResponse::key).contains("borrowed");
    }
}
