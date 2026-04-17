package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.AssetMapper;
import asset.management.last_resolve.mapper.CommonMapper;
import asset.management.last_resolve.repository.AssetCategoryRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AssignmentRepository;
import asset.management.last_resolve.repository.AuditLogRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.repository.DiscrepancyRepository;
import asset.management.last_resolve.repository.LocationRepository;
import asset.management.last_resolve.repository.MaintenanceRecordRepository;
import asset.management.last_resolve.repository.VerificationTaskRepository;
import asset.management.last_resolve.support.TestDataFactory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AssetServiceCoverageTest {

    @Mock private AssetRepository assetRepository;
    @Mock private AssetCategoryRepository assetCategoryRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private LocationRepository locationRepository;
    @Mock private AssignmentRepository assignmentRepository;
    @Mock private BorrowRequestRepository borrowRequestRepository;
    @Mock private MaintenanceRecordRepository maintenanceRecordRepository;
    @Mock private VerificationTaskRepository verificationTaskRepository;
    @Mock private DiscrepancyRepository discrepancyRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private AssetMapper assetMapper;
    @Mock private CommonMapper commonMapper;
    @Mock private PageResponseFactory pageResponseFactory;
    @Mock private CurrentUserService currentUserService;
    @Mock private AuthorizationService authorizationService;
    @Mock private AuditService auditService;

    private AssetService service;
    private Department department;
    private AppUser officer;
    private AppUser employee;
    private Asset visibleAsset;
    private Asset hiddenAsset;

    @BeforeEach
    void setUp() {
        service = new AssetService(
            assetRepository,
            assetCategoryRepository,
            departmentRepository,
            locationRepository,
            assignmentRepository,
            borrowRequestRepository,
            maintenanceRecordRepository,
            verificationTaskRepository,
            discrepancyRepository,
            auditLogRepository,
            assetMapper,
            commonMapper,
            pageResponseFactory,
            currentUserService,
            authorizationService,
            auditService
        );

        department = TestDataFactory.department("IT");
        officer = TestDataFactory.user(UserRole.OFFICER, department, "officer");
        employee = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        visibleAsset = TestDataFactory.asset(department, null, true, LifecycleStatus.IN_STORAGE);
        hiddenAsset = TestDataFactory.asset(TestDataFactory.department("HR"), null, true, LifecycleStatus.IN_USE);
        visibleAsset.setCode("AST-1001");
        visibleAsset.setName("Visible Laptop");
        hiddenAsset.setCode("AST-2001");
        hiddenAsset.setName("Hidden Server");
    }

    @Test
    void listFiltersVisibleAssetsBeforePaging() {
        AssetDtos.AssetResponse response = new AssetDtos.AssetResponse(
            visibleAsset.getId().toString(), visibleAsset.getCode(), visibleAsset.getName(), "Desc", null, null, null, null,
            null, null, null, null, "good", LifecycleStatus.IN_STORAGE.getValue(), null, null, null, null, null, null, true, null, null, null, null
        );
        CommonDtos.PageResponse<AssetDtos.AssetResponse> paged = new CommonDtos.PageResponse<>(List.of(response), 1, 0, 10, 1);
        when(currentUserService.currentUser()).thenReturn(employee);
        when(assetRepository.findAll()).thenReturn(List.of(hiddenAsset, visibleAsset));
        when(authorizationService.canViewAsset(employee, visibleAsset)).thenReturn(true);
        when(authorizationService.canViewAsset(employee, hiddenAsset)).thenReturn(false);
        when(assetMapper.toAssetResponse(visibleAsset)).thenReturn(response);
        when(pageResponseFactory.create(List.of(response), 0, 10)).thenReturn(paged);

        CommonDtos.PageResponse<AssetDtos.AssetResponse> result = service.list("Visible", "in-storage", null, 0, 10);

        assertThat(result.items()).containsExactly(response);
        verify(pageResponseFactory).create(List.of(response), 0, 10);
    }

    @Test
    void getRejectsOutOfScopeAssetAccess() {
        when(currentUserService.currentUser()).thenReturn(employee);
        when(assetRepository.findById(hiddenAsset.getId())).thenReturn(Optional.of(hiddenAsset));
        when(authorizationService.canViewAsset(employee, hiddenAsset)).thenReturn(false);

        assertThatThrownBy(() -> service.get(hiddenAsset.getId()))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("do not have access");
    }

    @Test
    void createRejectsUsersWithoutManagePermission() {
        when(currentUserService.currentUser()).thenReturn(employee);
        when(authorizationService.canManageAssets(employee)).thenReturn(false);
        AssetDtos.AssetUpsertRequest request = request();

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(ForbiddenOperationException.class)
            .hasMessageContaining("create assets");
    }

    @Test
    void createRequiresLocation() {
        AssetDtos.AssetUpsertRequest baseRequest = request();
        when(currentUserService.currentUser()).thenReturn(officer);
        when(authorizationService.canManageAssets(officer)).thenReturn(true);
        when(assetCategoryRepository.findById(UUID.fromString(baseRequest.categoryId()))).thenReturn(Optional.of(TestDataFactory.category("LAP")));
        when(departmentRepository.findById(UUID.fromString(baseRequest.departmentId()))).thenReturn(Optional.of(department));

        AssetDtos.AssetUpsertRequest request = new AssetDtos.AssetUpsertRequest(
            "Coverage Asset", "cov-asset", baseRequest.categoryId(), baseRequest.departmentId(), "", "Brand", "Model", "SER-1",
            "2026-04-10", 10.0, "2027-04-10", true, "Notes", "good", "Desc"
        );

        assertThatThrownBy(() -> service.create(request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Location is required");
    }

    @Test
    void updateRejectsMissingAssets() {
        AssetDtos.AssetUpsertRequest request = request();
        when(currentUserService.currentUser()).thenReturn(officer);
        when(authorizationService.canManageAssets(officer)).thenReturn(true);
        when(assetRepository.findById(visibleAsset.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(visibleAsset.getId(), request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Asset not found");
    }

    @Test
    void deleteRejectsLinkedWorkflowRecords() {
        when(currentUserService.currentUser()).thenReturn(officer);
        when(authorizationService.canManageAssets(officer)).thenReturn(true);
        when(assetRepository.findById(visibleAsset.getId())).thenReturn(Optional.of(visibleAsset));
        when(assignmentRepository.findAll()).thenReturn(List.of(TestDataFactory.assignment(visibleAsset, officer, department)));

        assertThatThrownBy(() -> service.delete(visibleAsset.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("cannot be deleted");
    }

    @Test
    void createPersistsNormalizedAssetFields() {
        AssetDtos.AssetUpsertRequest request = request();
        AssetDtos.AssetResponse response = new AssetDtos.AssetResponse(
            visibleAsset.getId().toString(), "COV-ASSET", "Coverage Asset", "Created for coverage", null, null, null, null,
            null, null, null, null, "good", LifecycleStatus.IN_STORAGE.getValue(), "Brand", "Model", "SER-1", "2026-04-10",
            10.0, "2027-04-10", true, null, null, "Notes", null
        );
        when(currentUserService.currentUser()).thenReturn(officer);
        when(authorizationService.canManageAssets(officer)).thenReturn(true);
        when(assetCategoryRepository.findById(UUID.fromString(request.categoryId()))).thenReturn(Optional.of(TestDataFactory.category("LAP")));
        when(departmentRepository.findById(UUID.fromString(request.departmentId()))).thenReturn(Optional.of(department));
        when(locationRepository.findById(UUID.fromString(request.locationId()))).thenReturn(Optional.of(TestDataFactory.location("HQ")));
        when(assetRepository.save(any(Asset.class))).thenAnswer(invocation -> {
            Asset saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });
        when(assetMapper.toAssetResponse(any(Asset.class))).thenReturn(response);

        AssetDtos.AssetResponse result = service.create(request);

        ArgumentCaptor<Asset> captor = ArgumentCaptor.forClass(Asset.class);
        verify(assetRepository).save(captor.capture());
        assertThat(captor.getValue().getCode()).isEqualTo("COV-ASSET");
        assertThat(captor.getValue().getCreatedBy()).isEqualTo(officer);
        assertThat(result.code()).isEqualTo("COV-ASSET");
    }

    private AssetDtos.AssetUpsertRequest request() {
        return new AssetDtos.AssetUpsertRequest(
            "Coverage Asset",
            "cov-asset",
            UUID.randomUUID().toString(),
            department.getId().toString(),
            UUID.randomUUID().toString(),
            "Brand",
            "Model",
            "SER-1",
            "2026-04-10",
            10.0,
            "2027-04-10",
            true,
            "Notes",
            "good",
            "Created for coverage"
        );
    }
}
