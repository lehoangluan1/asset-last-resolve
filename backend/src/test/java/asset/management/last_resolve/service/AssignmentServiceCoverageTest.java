package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.AssignmentType;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.TransferStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AssignmentRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceCoverageTest {

    @Mock private AssignmentRepository assignmentRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private AppUserRepository appUserRepository;
    @Mock private WorkflowMapper workflowMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;

    private AssignmentService service;
    private AppUser manager;
    private AppUser officer;
    private Assignment visibleAssignment;
    private Assignment hiddenAssignment;
    private Asset assignableAsset;

    @BeforeEach
    void setUp() {
        service = new AssignmentService(
            assignmentRepository,
            assetRepository,
            appUserRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService
        );

        Department it = TestDataFactory.department("IT");
        manager = TestDataFactory.user(UserRole.MANAGER, it, "manager");
        officer = TestDataFactory.user(UserRole.OFFICER, it, "officer");
        Asset visibleAsset = TestDataFactory.asset(it, manager, false, LifecycleStatus.IN_USE);
        visibleAsset.setCode("AST-3001");
        visibleAsset.setName("Visible Workstation");
        visibleAssignment = TestDataFactory.assignment(visibleAsset, manager, it);
        Asset hiddenAsset = TestDataFactory.asset(TestDataFactory.department("HR"), null, false, LifecycleStatus.IN_USE);
        hiddenAssignment = TestDataFactory.assignment(hiddenAsset, manager, it);
        assignableAsset = TestDataFactory.asset(it, null, false, LifecycleStatus.IN_STORAGE);
    }

    @Test
    void listRespectsAssignmentScopeAndFilters() {
        WorkflowDtos.AssignmentResponse response = new WorkflowDtos.AssignmentResponse(
            visibleAssignment.getId().toString(),
            visibleAssignment.getAsset().getId().toString(),
            visibleAssignment.getAsset().getCode(),
            visibleAssignment.getAsset().getName(),
            visibleAssignment.getAssignmentType().getValue(),
            null, null, null, null,
            manager.getId().toString(), manager.getFullName(),
            manager.getDepartment().getId().toString(), manager.getDepartment().getCode(),
            visibleAssignment.getStatus().getValue(),
            visibleAssignment.getEffectiveDate().toString(),
            null,
            "Notes",
            visibleAssignment.getCreatedAt().toString(),
            manager.getFullName()
        );
        CommonDtos.PageResponse<WorkflowDtos.AssignmentResponse> page = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(manager);
        when(assignmentRepository.findAll()).thenReturn(List.of(hiddenAssignment, visibleAssignment));
        when(authorizationService.canViewAssignment(manager, visibleAssignment)).thenReturn(true);
        when(authorizationService.canViewAssignment(manager, hiddenAssignment)).thenReturn(false);
        when(workflowMapper.toAssignmentResponse(visibleAssignment)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(page);

        CommonDtos.PageResponse<WorkflowDtos.AssignmentResponse> result = service.list("Visible", "permanent", 0, 10);

        assertThat(result.items()).containsExactly(response);
        verify(pageResponseFactory).create(List.of(response), 0, 10);
    }

    @Test
    void createAssignsAssetToSelectedUser() {
        WorkflowDtos.AssignmentResponse response = new WorkflowDtos.AssignmentResponse(
            "assignment-1",
            assignableAsset.getId().toString(),
            assignableAsset.getCode(),
            assignableAsset.getName(),
            AssignmentType.PERMANENT.getValue(),
            null,
            null,
            assignableAsset.getDepartment().getId().toString(),
            assignableAsset.getDepartment().getCode(),
            manager.getId().toString(),
            manager.getFullName(),
            manager.getDepartment().getId().toString(),
            manager.getDepartment().getCode(),
            TransferStatus.COMPLETED.getValue(),
            "2026-05-01",
            null,
            "Coverage assignment",
            "2026-04-18T00:00:00Z",
            officer.getFullName()
        );
        when(currentUserService.currentUser()).thenReturn(officer);
        when(authorizationService.canManageAssignments(officer)).thenReturn(true);
        when(assetRepository.findById(assignableAsset.getId())).thenReturn(Optional.of(assignableAsset));
        when(appUserRepository.findById(manager.getId())).thenReturn(Optional.of(manager));
        when(assignmentRepository.save(org.mockito.ArgumentMatchers.any(Assignment.class))).thenAnswer(invocation -> {
            Assignment assignment = invocation.getArgument(0);
            assignment.setId(java.util.UUID.randomUUID());
            return assignment;
        });
        when(workflowMapper.toAssignmentResponse(org.mockito.ArgumentMatchers.any(Assignment.class))).thenReturn(response);

        WorkflowDtos.AssignmentResponse result = service.create(new WorkflowDtos.AssignmentCreateRequest(
            assignableAsset.getId().toString(),
            manager.getId().toString(),
            "permanent",
            "2026-05-01",
            null,
            "Coverage assignment"
        ));

        assertThat(assignableAsset.getAssignedToUser()).isEqualTo(manager);
        assertThat(assignableAsset.getLifecycleStatus()).isEqualTo(LifecycleStatus.IN_USE);
        assertThat(result.toUserId()).isEqualTo(manager.getId().toString());
    }

    @Test
    void createRejectsUnavailableAssets() {
        assignableAsset.setLifecycleStatus(LifecycleStatus.UNDER_MAINTENANCE);
        when(currentUserService.currentUser()).thenReturn(officer);
        when(authorizationService.canManageAssignments(officer)).thenReturn(true);
        when(assetRepository.findById(assignableAsset.getId())).thenReturn(Optional.of(assignableAsset));
        when(appUserRepository.findById(manager.getId())).thenReturn(Optional.of(manager));

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.create(new WorkflowDtos.AssignmentCreateRequest(
            assignableAsset.getId().toString(),
            manager.getId().toString(),
            "permanent",
            "2026-05-01",
            null,
            "Coverage assignment"
        )))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("not available for assignment");
    }
}
