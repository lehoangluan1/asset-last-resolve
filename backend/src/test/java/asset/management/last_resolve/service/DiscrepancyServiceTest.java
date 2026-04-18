package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DiscrepancyServiceTest {

    @Mock
    private DiscrepancyRepository discrepancyRepository;
    @Mock
    private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock
    private AppUserRepository appUserRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private VerificationTaskRepository verificationTaskRepository;
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

    private DiscrepancyService service;
    private AppUser auditor;
    private AppUser technician;
    private Discrepancy discrepancy;

    @BeforeEach
    void setUp() {
        service = new DiscrepancyService(
            discrepancyRepository,
            maintenanceRecordRepository,
            appUserRepository,
            assetRepository,
            verificationTaskRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService
        );

        Department department = TestDataFactory.department("IT");
        auditor = TestDataFactory.user(UserRole.AUDITOR, department, "auditor");
        technician = TestDataFactory.user(UserRole.TECHNICIAN, department, "tech");
        VerificationCampaign campaign = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(department), auditor);
        Asset asset = TestDataFactory.asset(department, null, false, LifecycleStatus.IN_USE);
        discrepancy = TestDataFactory.discrepancy(campaign, asset, auditor, DiscrepancyStatus.OPEN);
    }

    @Test
    void reconcileRejectsUnauthorizedUsers() {
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(false);

        assertThatThrownBy(() -> service.reconcile(discrepancy.getId(), action()))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("reconcile discrepancies");
    }

    @Test
    void reconcileRejectsResolvedDiscrepancies() {
        discrepancy.setStatus(DiscrepancyStatus.RESOLVED);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(true);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));

        assertThatThrownBy(() -> service.reconcile(discrepancy.getId(), action()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("already been resolved");
    }

    @Test
    void reconcileMarksDiscrepancyAsResolved() {
        WorkflowDtos.DiscrepancyResponse response = response(DiscrepancyStatus.RESOLVED);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(true);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));
        when(discrepancyRepository.save(discrepancy)).thenReturn(discrepancy);
        when(workflowMapper.toDiscrepancyResponse(discrepancy)).thenReturn(response);

        WorkflowDtos.DiscrepancyResponse result = service.reconcile(discrepancy.getId(), action());

        assertThat(discrepancy.getStatus()).isEqualTo(DiscrepancyStatus.RESOLVED);
        assertThat(discrepancy.getResolvedBy()).isEqualTo(auditor);
        assertThat(discrepancy.getResolvedAt()).isNotNull();
        assertThat(result.status()).isEqualTo(DiscrepancyStatus.RESOLVED.getValue());
    }

    @Test
    void escalateRejectsResolvedDiscrepancies() {
        discrepancy.setStatus(DiscrepancyStatus.RESOLVED);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(true);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));

        assertThatThrownBy(() -> service.escalate(discrepancy.getId(), action()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("cannot be escalated");
    }

    @Test
    void escalateMarksDiscrepancyAsEscalated() {
        WorkflowDtos.DiscrepancyResponse response = response(DiscrepancyStatus.ESCALATED);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(true);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));
        when(discrepancyRepository.save(discrepancy)).thenReturn(discrepancy);
        when(workflowMapper.toDiscrepancyResponse(discrepancy)).thenReturn(response);

        WorkflowDtos.DiscrepancyResponse result = service.escalate(discrepancy.getId(), action());

        assertThat(discrepancy.getStatus()).isEqualTo(DiscrepancyStatus.ESCALATED);
        assertThat(result.status()).isEqualTo(DiscrepancyStatus.ESCALATED.getValue());
    }

    @Test
    void sendToMaintenanceRejectsResolvedDiscrepancies() {
        discrepancy.setStatus(DiscrepancyStatus.RESOLVED);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(true);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));

        assertThatThrownBy(() -> service.sendToMaintenance(discrepancy.getId(), action()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("cannot be sent to maintenance");
    }

    @Test
    void sendToMaintenanceCreatesMaintenanceAndUpdatesDiscrepancy() {
        WorkflowDtos.DiscrepancyResponse response = response(DiscrepancyStatus.INVESTIGATING);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageDiscrepancy(auditor)).thenReturn(true);
        when(discrepancyRepository.findById(discrepancy.getId())).thenReturn(Optional.of(discrepancy));
        when(appUserRepository.findAll()).thenReturn(List.of(technician));
        when(maintenanceRecordRepository.save(any(MaintenanceRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(discrepancyRepository.save(discrepancy)).thenReturn(discrepancy);
        when(workflowMapper.toDiscrepancyResponse(discrepancy)).thenReturn(response);

        WorkflowDtos.DiscrepancyResponse result = service.sendToMaintenance(discrepancy.getId(), action());

        ArgumentCaptor<MaintenanceRecord> captor = ArgumentCaptor.forClass(MaintenanceRecord.class);
        verify(maintenanceRecordRepository).save(captor.capture());
        assertThat(captor.getValue().getAssignedToUser()).isEqualTo(technician);
        assertThat(captor.getValue().getStatus()).isEqualTo(MaintenanceStatus.SCHEDULED);
        assertThat(discrepancy.getStatus()).isEqualTo(DiscrepancyStatus.INVESTIGATING);
        assertThat(result.status()).isEqualTo(DiscrepancyStatus.INVESTIGATING.getValue());
    }

    private WorkflowDtos.DiscrepancyActionRequest action() {
        return new WorkflowDtos.DiscrepancyActionRequest("Cable strain", "Resolved", "Inspection required");
    }

    private WorkflowDtos.DiscrepancyResponse response(DiscrepancyStatus status) {
        return new WorkflowDtos.DiscrepancyResponse(
            discrepancy.getId().toString(),
            discrepancy.getCampaign().getId().toString(),
            discrepancy.getTask().getId().toString(),
            discrepancy.getAsset().getId().toString(),
            discrepancy.getAsset().getCode(),
            discrepancy.getAsset().getName(),
            discrepancy.getType().getValue(),
            discrepancy.getSeverity().getValue(),
            status.getValue(),
            discrepancy.getExpectedValue(),
            discrepancy.getObservedValue(),
            discrepancy.getRootCause(),
            discrepancy.getResolution(),
            auditor.getFullName(),
            null,
            "2026-04-16T00:00:00Z"
        );
    }
}
