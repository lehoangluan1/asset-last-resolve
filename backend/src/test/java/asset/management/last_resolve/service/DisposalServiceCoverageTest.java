package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.DisposalRequest;
import asset.management.last_resolve.enums.DisposalStatus;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DisposalRequestRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DisposalServiceCoverageTest {

    @Mock private DisposalRequestRepository disposalRequestRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private WorkflowMapper workflowMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;

    private DisposalService service;
    private AppUser admin;
    private AppUser employee;
    private DisposalRequest request;

    @BeforeEach
    void setUp() {
        service = new DisposalService(
            disposalRequestRepository,
            assetRepository,
            workflowMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService
        );

        Department department = TestDataFactory.department("HR");
        admin = TestDataFactory.user(UserRole.ADMIN, department, "admin");
        employee = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        Asset asset = TestDataFactory.asset(department, null, false, LifecycleStatus.PENDING_DISPOSAL);
        asset.setName("Damaged Desk");
        request = new DisposalRequest();
        request.setId(java.util.UUID.randomUUID());
        request.setAsset(asset);
        request.setStatus(DisposalStatus.PROPOSED);
        request.setNotes("Coverage notes");
        request.setEstimatedValue(java.math.BigDecimal.TEN);
        request.setCreatedAt(java.time.OffsetDateTime.now());
    }

    @Test
    void listFiltersVisibleRequests() {
        WorkflowDtos.DisposalRequestResponse response = new WorkflowDtos.DisposalRequestResponse(
            request.getId().toString(),
            request.getAsset().getId().toString(),
            request.getAsset().getCode(),
            request.getAsset().getName(),
            "Damaged",
            request.getStatus().getValue(),
            null,
            null,
            null,
            10.0,
            request.getNotes(),
            request.getCreatedAt().toString()
        );
        CommonDtos.PageResponse<WorkflowDtos.DisposalRequestResponse> page = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(admin);
        when(disposalRequestRepository.findAll()).thenReturn(List.of(request));
        when(authorizationService.canViewDisposal(admin, request)).thenReturn(true);
        when(workflowMapper.toDisposalResponse(request)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(page);

        CommonDtos.PageResponse<WorkflowDtos.DisposalRequestResponse> result = service.list("Damaged", "proposed", 0, 10);

        assertThat(result.items()).containsExactly(response);
    }

    @Test
    void approveRejectsUsersWithoutDisposalPermission() {
        when(currentUserService.currentUser()).thenReturn(employee);
        when(authorizationService.canManageDisposal(employee)).thenReturn(false);

        assertThatThrownBy(() -> service.approve(request.getId(), new WorkflowDtos.DecisionRequest("ok")))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("manage disposal requests");
    }

    @Test
    void approveSetsEffectiveDateAndReviewer() {
        WorkflowDtos.DisposalRequestResponse response = new WorkflowDtos.DisposalRequestResponse(
            request.getId().toString(),
            request.getAsset().getId().toString(),
            request.getAsset().getCode(),
            request.getAsset().getName(),
            "Damaged",
            DisposalStatus.APPROVED.getValue(),
            null,
            admin.getFullName(),
            java.time.LocalDate.now().toString(),
            10.0,
            "Approved",
            request.getCreatedAt().toString()
        );
        when(currentUserService.currentUser()).thenReturn(admin);
        when(authorizationService.canManageDisposal(admin)).thenReturn(true);
        when(disposalRequestRepository.findById(request.getId())).thenReturn(Optional.of(request));
        when(authorizationService.canViewDisposal(admin, request)).thenReturn(true);
        when(disposalRequestRepository.save(request)).thenReturn(request);
        when(workflowMapper.toDisposalResponse(request)).thenReturn(response);

        WorkflowDtos.DisposalRequestResponse result = service.approve(request.getId(), new WorkflowDtos.DecisionRequest("Approved"));

        assertThat(request.getStatus()).isEqualTo(DisposalStatus.APPROVED);
        assertThat(request.getReviewedBy()).isEqualTo(admin);
        assertThat(request.getEffectiveDate()).isNotNull();
        assertThat(result.status()).isEqualTo(DisposalStatus.APPROVED.getValue());
        verify(disposalRequestRepository).save(request);
    }
}
