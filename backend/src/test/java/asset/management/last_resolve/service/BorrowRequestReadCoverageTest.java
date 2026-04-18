package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetCategoryRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class BorrowRequestReadCoverageTest {

    @Mock private BorrowRequestRepository borrowRequestRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private AssetCategoryRepository assetCategoryRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private WorkflowMapper workflowMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;
    @Mock private NotificationService notificationService;

    private BorrowRequestService service;
    private AppUser employee;
    private AppUser manager;
    private BorrowRequest request;

    @BeforeEach
    void setUp() {
        service = new BorrowRequestService(
            borrowRequestRepository,
            assetRepository,
            assetCategoryRepository,
            departmentRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService,
            notificationService
        );

        Department department = TestDataFactory.department("HR");
        employee = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        manager = TestDataFactory.user(UserRole.MANAGER, department, "manager");
        Asset asset = TestDataFactory.asset(department, null, true, LifecycleStatus.IN_STORAGE);
        asset.setName("Shared Laptop");
        request = TestDataFactory.borrowRequest(asset, employee, BorrowStatus.PENDING_APPROVAL);
    }

    @Test
    void listAppliesScopeSearchAndStatusFilters() {
        WorkflowDtos.BorrowRequestResponse response = response(BorrowStatus.PENDING_APPROVAL);
        CommonDtos.PageResponse<WorkflowDtos.BorrowRequestResponse> page = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(manager);
        when(borrowRequestRepository.findAll()).thenReturn(List.of(request));
        when(authorizationService.canViewBorrowRequest(manager, request)).thenReturn(true);
        when(workflowMapper.toBorrowRequestResponse(request)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(page);

        CommonDtos.PageResponse<WorkflowDtos.BorrowRequestResponse> result = service.list("Shared", "pending-approval", 0, 10);

        assertThat(result.items()).containsExactly(response);
    }

    @Test
    void getRejectsOutOfScopeBorrowRequests() {
        when(currentUserService.currentUser()).thenReturn(manager);
        when(borrowRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
        when(authorizationService.canViewBorrowRequest(manager, request)).thenReturn(false);

        assertThatThrownBy(() -> service.get(request.getId()))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("do not have access");
    }

    @Test
    void rejectTransitionsPendingRequestAndCreatesNotification() {
        WorkflowDtos.BorrowRequestResponse response = response(BorrowStatus.REJECTED);
        when(currentUserService.currentUser()).thenReturn(manager);
        when(borrowRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
        when(authorizationService.canApproveBorrowRequest(manager, request)).thenReturn(true);
        when(borrowRequestRepository.save(request)).thenReturn(request);
        when(workflowMapper.toBorrowRequestResponse(request)).thenReturn(response);

        WorkflowDtos.BorrowRequestResponse result = service.reject(request.getId(), new WorkflowDtos.DecisionRequest("No longer available"));

        assertThat(result.status()).isEqualTo(BorrowStatus.REJECTED.getValue());
        verify(notificationService).create(eq(employee), any(), any(), any(), eq("BorrowRequest"), eq(request.getId().toString()), eq(manager.getFullName()), eq("high"));
    }

    private WorkflowDtos.BorrowRequestResponse response(BorrowStatus status) {
        return new WorkflowDtos.BorrowRequestResponse(
            request.getId().toString(),
            request.getAsset().getId().toString(),
            request.getAsset().getCode(),
            request.getAsset().getName(),
            request.getCategory().getId().toString(),
            request.getCategory().getCode(),
            request.getCategory().getName(),
            employee.getId().toString(),
            employee.getFullName(),
            employee.getDepartment().getId().toString(),
            employee.getDepartment().getName(),
            "individual",
            request.getBorrowDate().toString(),
            request.getReturnDate().toString(),
            request.getPurpose(),
            request.getNotes(),
            status.getValue(),
            null,
            null,
            null,
            null,
            request.getCreatedAt().toString()
        );
    }
}
