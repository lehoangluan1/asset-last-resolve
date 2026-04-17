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
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssignmentRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceCoverageTest {

    @Mock private AssignmentRepository assignmentRepository;
    @Mock private WorkflowMapper workflowMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;

    private AssignmentService service;
    private AppUser manager;
    private Assignment visibleAssignment;
    private Assignment hiddenAssignment;

    @BeforeEach
    void setUp() {
        service = new AssignmentService(
            assignmentRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService
        );

        Department it = TestDataFactory.department("IT");
        manager = TestDataFactory.user(UserRole.MANAGER, it, "manager");
        Asset visibleAsset = TestDataFactory.asset(it, manager, false, LifecycleStatus.IN_USE);
        visibleAsset.setCode("AST-3001");
        visibleAsset.setName("Visible Workstation");
        visibleAssignment = TestDataFactory.assignment(visibleAsset, manager, it);
        Asset hiddenAsset = TestDataFactory.asset(TestDataFactory.department("HR"), null, false, LifecycleStatus.IN_USE);
        hiddenAssignment = TestDataFactory.assignment(hiddenAsset, manager, it);
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
}
