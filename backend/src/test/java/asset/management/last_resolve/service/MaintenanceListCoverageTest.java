package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MaintenanceListCoverageTest {

    @Mock private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private WorkflowMapper workflowMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;
    @Mock private NotificationService notificationService;

    private MaintenanceService service;
    private AppUser technician;
    private MaintenanceRecord record;

    @BeforeEach
    void setUp() {
        service = new MaintenanceService(
            maintenanceRecordRepository,
            assetRepository,
            appUserRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService,
            notificationService
        );

        Department department = TestDataFactory.department("OPS");
        technician = TestDataFactory.user(UserRole.TECHNICIAN, department, "technician");
        Asset asset = TestDataFactory.asset(department, null, false, LifecycleStatus.UNDER_MAINTENANCE);
        asset.setName("Fleet Vehicle");
        record = TestDataFactory.maintenanceRecord(asset, technician, MaintenanceStatus.IN_PROGRESS);
    }

    @Test
    void listReturnsVisibleMaintenanceRecordsMatchingStatus() {
        WorkflowDtos.MaintenanceRecordResponse response = new WorkflowDtos.MaintenanceRecordResponse(
            record.getId().toString(),
            record.getAsset().getId().toString(),
            record.getAsset().getCode(),
            record.getAsset().getName(),
            record.getMaintenanceType(),
            record.getDescription(),
            record.getTechCondition().getValue(),
            record.getStatus().getValue(),
            record.getPriority().getValue(),
            technician.getId().toString(),
            technician.getFullName(),
            record.getScheduledDate().toString(),
            null,
            0.0,
            record.getNotes(),
            record.getCreatedAt().toString()
        );
        CommonDtos.PageResponse<WorkflowDtos.MaintenanceRecordResponse> page = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(technician);
        when(maintenanceRecordRepository.findAll()).thenReturn(List.of(record));
        when(authorizationService.canViewMaintenance(technician, record)).thenReturn(true);
        when(workflowMapper.toMaintenanceResponse(record)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(page);

        CommonDtos.PageResponse<WorkflowDtos.MaintenanceRecordResponse> result = service.list("Fleet", "in-progress", 0, 10);

        assertThat(result.items()).containsExactly(response);
    }
}
