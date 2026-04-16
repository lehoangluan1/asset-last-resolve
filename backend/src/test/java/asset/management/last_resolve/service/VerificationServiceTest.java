package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.entity.VerificationTask;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.repository.VerificationCampaignRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VerificationServiceTest {

    @Mock
    private VerificationCampaignRepository verificationCampaignRepository;
    @Mock
    private VerificationTaskRepository verificationTaskRepository;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private AssetRepository assetRepository;
    @Mock
    private WorkflowMapper workflowMapper;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private AuthorizationService authorizationService;
    @Mock
    private AuditService auditService;

    private VerificationService service;
    private AppUser auditor;
    private Department itDepartment;
    private Department hrDepartment;

    @BeforeEach
    void setUp() {
        service = new VerificationService(
            verificationCampaignRepository,
            verificationTaskRepository,
            departmentRepository,
            assetRepository,
            workflowMapper,
            currentUserService,
            authorizationService,
            auditService
        );
        itDepartment = TestDataFactory.department("IT");
        hrDepartment = TestDataFactory.department("HR");
        auditor = TestDataFactory.user(UserRole.AUDITOR, itDepartment, "auditor");
    }

    @Test
    void listCampaignsFiltersUnauthorizedCampaigns() {
        VerificationCampaign visible = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(itDepartment), auditor);
        VerificationCampaign hidden = TestDataFactory.campaign("VER-2", CampaignStatus.ACTIVE, Set.of(hrDepartment), auditor);
        WorkflowDtos.VerificationCampaignResponse response = response(visible.getId().toString(), visible.getCode());
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(verificationCampaignRepository.findAll()).thenReturn(List.of(visible, hidden));
        when(authorizationService.canViewVerificationCampaign(auditor, visible)).thenReturn(true);
        when(authorizationService.canViewVerificationCampaign(auditor, hidden)).thenReturn(false);
        when(verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(visible.getId())).thenReturn(List.of());
        when(workflowMapper.toCampaignResponse(visible, List.of())).thenReturn(response);

        List<WorkflowDtos.VerificationCampaignResponse> result = service.listCampaigns();

        assertThat(result).containsExactly(response);
    }

    @Test
    void getCampaignRejectsUnauthorizedAccess() {
        VerificationCampaign campaign = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(hrDepartment), auditor);
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(verificationCampaignRepository.findById(campaign.getId())).thenReturn(Optional.of(campaign));
        when(authorizationService.canViewVerificationCampaign(auditor, campaign)).thenReturn(false);

        assertThatThrownBy(() -> service.getCampaign(campaign.getId()))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("do not have access");
    }

    @Test
    void createCampaignRejectsUnauthorizedUsers() {
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageVerification(auditor)).thenReturn(false);

        assertThatThrownBy(() -> service.createCampaign(request("VER-1", "2026-04-20", "2026-04-18", List.of(itDepartment.getId().toString()))))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("create verification campaigns");
    }

    @Test
    void createCampaignRejectsDuplicateCode() {
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageVerification(auditor)).thenReturn(true);
        when(verificationCampaignRepository.findByCodeIgnoreCase("VER-1")).thenReturn(Optional.of(new VerificationCampaign()));

        assertThatThrownBy(() -> service.createCampaign(request("VER-1", "2026-04-18", "2026-04-20", List.of(itDepartment.getId().toString()))))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("code already exists");
    }

    @Test
    void createCampaignRejectsDueDateBeforeStartDate() {
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageVerification(auditor)).thenReturn(true);
        when(verificationCampaignRepository.findByCodeIgnoreCase("VER-1")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createCampaign(request("VER-1", "2026-04-20", "2026-04-18", List.of(itDepartment.getId().toString()))))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("on or after the start date");
    }

    @Test
    void createCampaignBuildsTasksForDepartmentAssets() {
        Asset itAsset = TestDataFactory.asset(itDepartment, null, false, LifecycleStatus.IN_USE);
        Asset hrAsset = TestDataFactory.asset(hrDepartment, null, false, LifecycleStatus.IN_USE);
        VerificationCampaign savedCampaign = TestDataFactory.campaign("VER-1", CampaignStatus.ACTIVE, Set.of(itDepartment), auditor);
        WorkflowDtos.VerificationCampaignResponse response = response(savedCampaign.getId().toString(), savedCampaign.getCode());
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageVerification(auditor)).thenReturn(true);
        when(verificationCampaignRepository.findByCodeIgnoreCase("VER-1")).thenReturn(Optional.empty());
        when(departmentRepository.findById(itDepartment.getId())).thenReturn(Optional.of(itDepartment));
        when(departmentRepository.count()).thenReturn(2L);
        when(verificationCampaignRepository.save(any(VerificationCampaign.class))).thenReturn(savedCampaign);
        when(assetRepository.findAll()).thenReturn(List.of(itAsset, hrAsset));
        when(verificationTaskRepository.findByCampaign_IdOrderByCreatedAtDesc(savedCampaign.getId())).thenReturn(List.of());
        when(workflowMapper.toCampaignResponse(eq(savedCampaign), any())).thenReturn(response);

        WorkflowDtos.VerificationCampaignResponse result = service.createCampaign(
            request("VER-1", "2026-04-18", "2026-04-20", List.of(itDepartment.getId().toString()))
        );

        ArgumentCaptor<List<VerificationTask>> tasksCaptor = ArgumentCaptor.forClass(List.class);
        verify(verificationTaskRepository).saveAll(tasksCaptor.capture());
        assertThat(tasksCaptor.getValue()).hasSize(1);
        assertThat(tasksCaptor.getValue().get(0).getAsset()).isEqualTo(itAsset);
        assertThat(result.code()).isEqualTo(savedCampaign.getCode());
    }

    @Test
    void createCampaignFailsWhenDepartmentDoesNotExist() {
        when(currentUserService.currentUser()).thenReturn(auditor);
        when(authorizationService.canManageVerification(auditor)).thenReturn(true);
        when(verificationCampaignRepository.findByCodeIgnoreCase("VER-1")).thenReturn(Optional.empty());
        when(departmentRepository.findById(UUID.fromString(itDepartment.getId().toString()))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.createCampaign(request("VER-1", "2026-04-18", "2026-04-20", List.of(itDepartment.getId().toString()))))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Department not found");
    }

    private WorkflowDtos.VerificationCampaignCreateRequest request(String code, String startDate, String dueDate, List<String> departmentIds) {
        return new WorkflowDtos.VerificationCampaignCreateRequest(
            "Quarterly Verification",
            code,
            2026,
            "Description",
            departmentIds,
            CampaignStatus.ACTIVE.getValue(),
            dueDate,
            startDate
        );
    }

    private WorkflowDtos.VerificationCampaignResponse response(String id, String code) {
        return new WorkflowDtos.VerificationCampaignResponse(
            id,
            code,
            "Quarterly Verification",
            2026,
            "IT",
            List.of(itDepartment.getId().toString()),
            CampaignStatus.ACTIVE.getValue(),
            "2026-04-20",
            "2026-04-18",
            1,
            0,
            0,
            "2026-04-16T00:00:00Z",
            List.of()
        );
    }
}
