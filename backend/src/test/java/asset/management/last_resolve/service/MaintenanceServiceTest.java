package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.NotificationType;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private WorkflowMapper workflowMapper;
    @Mock
    private PageResponseFactory pageResponseFactory;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private AuditService auditService;
    @Mock
    private NotificationService notificationService;

    private MaintenanceService service;
    private AppUser creator;
    private AppUser technician;
    private Asset asset;

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

        Department department = TestDataFactory.department("IT");
        creator = TestDataFactory.user(UserRole.OFFICER, department, "officer");
        technician = TestDataFactory.user(UserRole.TECHNICIAN, department, "tech");
        asset = TestDataFactory.asset(department, null, false, LifecycleStatus.IN_USE);
    }

    @Test
    void createRejectsUnauthorizedUsers() {
        when(currentUserService.currentUser()).thenReturn(creator);
        when(authorizationService.canCreateMaintenance(creator)).thenReturn(false);

        assertThatThrownBy(() -> service.create(request(MaintenanceStatus.SCHEDULED, null)))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("create maintenance records");
    }

    @Test
    void createRejectsInvalidAssignedRole() {
        AppUser invalidAssignee = TestDataFactory.user(UserRole.EMPLOYEE, creator.getDepartment(), "employee");
        when(currentUserService.currentUser()).thenReturn(creator);
        when(authorizationService.canCreateMaintenance(creator)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(appUserRepository.findById(invalidAssignee.getId())).thenReturn(Optional.of(invalidAssignee));
        when(authorizationService.isOneOf(invalidAssignee, UserRole.TECHNICIAN, UserRole.OFFICER)).thenReturn(false);

        assertThatThrownBy(() -> service.create(request(MaintenanceStatus.SCHEDULED, null, invalidAssignee.getId().toString())))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("technician or officer");
    }

    @Test
    void createRejectsCompletedDateBeforeScheduledDate() {
        when(currentUserService.currentUser()).thenReturn(creator);
        when(authorizationService.canCreateMaintenance(creator)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(appUserRepository.findById(technician.getId())).thenReturn(Optional.of(technician));
        when(authorizationService.isOneOf(technician, UserRole.TECHNICIAN, UserRole.OFFICER)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request(MaintenanceStatus.IN_PROGRESS, "2026-04-10")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Completed date cannot be before");
    }

    @Test
    void createRejectsCompletedStatusWithoutCompletedDate() {
        when(currentUserService.currentUser()).thenReturn(creator);
        when(authorizationService.canCreateMaintenance(creator)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(appUserRepository.findById(technician.getId())).thenReturn(Optional.of(technician));
        when(authorizationService.isOneOf(technician, UserRole.TECHNICIAN, UserRole.OFFICER)).thenReturn(true);

        assertThatThrownBy(() -> service.create(request(MaintenanceStatus.COMPLETED, null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("must include a completed date");
    }

    @Test
    void createMovesAssetIntoUnderMaintenanceForActiveWork() {
        WorkflowDtos.MaintenanceRecordResponse response = response(MaintenanceStatus.IN_PROGRESS);
        when(currentUserService.currentUser()).thenReturn(creator);
        when(authorizationService.canCreateMaintenance(creator)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(appUserRepository.findById(technician.getId())).thenReturn(Optional.of(technician));
        when(authorizationService.isOneOf(technician, UserRole.TECHNICIAN, UserRole.OFFICER)).thenReturn(true);
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenAnswer(invocation -> {
            MaintenanceRecord record = invocation.getArgument(0);
            record.setId(java.util.UUID.randomUUID());
            return record;
        });
        when(workflowMapper.toMaintenanceResponse(any(MaintenanceRecord.class))).thenReturn(response);

        WorkflowDtos.MaintenanceRecordResponse result = service.create(request(MaintenanceStatus.IN_PROGRESS, null));

        ArgumentCaptor<MaintenanceRecord> captor = ArgumentCaptor.forClass(MaintenanceRecord.class);
        verify(maintenanceRecordRepository).save(captor.capture());
        assertThat(captor.getValue().getAssignedToUser()).isEqualTo(technician);
        assertThat(asset.getLifecycleStatus()).isEqualTo(LifecycleStatus.UNDER_MAINTENANCE);
        assertThat(result.status()).isEqualTo(MaintenanceStatus.IN_PROGRESS.getValue());
    }

    @Test
    void createAllowsCompletedMaintenanceWhenCompletedDateProvided() {
        WorkflowDtos.MaintenanceRecordResponse response = response(MaintenanceStatus.COMPLETED);
        when(currentUserService.currentUser()).thenReturn(creator);
        when(authorizationService.canCreateMaintenance(creator)).thenReturn(true);
        when(assetRepository.findById(asset.getId())).thenReturn(Optional.of(asset));
        when(appUserRepository.findById(technician.getId())).thenReturn(Optional.of(technician));
        when(authorizationService.isOneOf(technician, UserRole.TECHNICIAN, UserRole.OFFICER)).thenReturn(true);
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenAnswer(invocation -> {
            MaintenanceRecord record = invocation.getArgument(0);
            record.setId(java.util.UUID.randomUUID());
            return record;
        });
        when(workflowMapper.toMaintenanceResponse(any(MaintenanceRecord.class))).thenReturn(response);

        WorkflowDtos.MaintenanceRecordResponse result = service.create(request(MaintenanceStatus.COMPLETED, "2026-04-21"));

        assertThat(asset.getLifecycleStatus()).isEqualTo(LifecycleStatus.IN_USE);
        assertThat(result.status()).isEqualTo(MaintenanceStatus.COMPLETED.getValue());
        verify(notificationService).create(
            eq(technician),
            eq("Maintenance scheduled"),
            eq(asset.getName() + " has been assigned to you."),
            eq(NotificationType.GENERAL),
            eq("Maintenance"),
            anyString(),
            eq(creator.getFullName()),
            eq("normal")
        );
    }

    @Test
    void updateStatusAllowsAssignedTechnicianToCompleteRecord() {
        MaintenanceRecord record = TestDataFactory.maintenanceRecord(asset, technician, MaintenanceStatus.IN_PROGRESS);
        WorkflowDtos.MaintenanceRecordResponse response = response(MaintenanceStatus.COMPLETED);
        asset.setLifecycleStatus(LifecycleStatus.UNDER_MAINTENANCE);

        when(currentUserService.currentUser()).thenReturn(technician);
        when(maintenanceRecordRepository.findById(record.getId())).thenReturn(Optional.of(record));
        when(authorizationService.canUpdateMaintenanceStatus(technician, record)).thenReturn(true);
        when(maintenanceRecordRepository.save(record)).thenReturn(record);
        when(workflowMapper.toMaintenanceResponse(record)).thenReturn(response);

        WorkflowDtos.MaintenanceRecordResponse result = service.updateStatus(record.getId(), new WorkflowDtos.MaintenanceStatusUpdateRequest("completed", "2026-04-21", "Finished"));

        assertThat(record.getStatus()).isEqualTo(MaintenanceStatus.COMPLETED);
        assertThat(record.getCompletedDate()).isNotNull();
        assertThat(result.status()).isEqualTo(MaintenanceStatus.COMPLETED.getValue());
    }

    private WorkflowDtos.MaintenanceCreateRequest request(MaintenanceStatus status, String completedDate) {
        return request(status, completedDate, technician.getId().toString());
    }

    private WorkflowDtos.MaintenanceCreateRequest request(MaintenanceStatus status, String completedDate, String technicianId) {
        return new WorkflowDtos.MaintenanceCreateRequest(
            asset.getId().toString(),
            "Inspection",
            "Inspect device",
            "good",
            status.getValue(),
            "normal",
            technicianId,
            "2026-04-20",
            completedDate,
            0.0,
            "Notes"
        );
    }

    private WorkflowDtos.MaintenanceRecordResponse response(MaintenanceStatus status) {
        return new WorkflowDtos.MaintenanceRecordResponse(
            "record-1",
            asset.getId().toString(),
            asset.getCode(),
            asset.getName(),
            "Inspection",
            "Inspect device",
            "good",
            status.getValue(),
            "normal",
            technician.getId().toString(),
            technician.getFullName(),
            "2026-04-20",
            status == MaintenanceStatus.COMPLETED ? "2026-04-21" : null,
            0.0,
            "Notes",
            "2026-04-16T00:00:00Z"
        );
    }
}
