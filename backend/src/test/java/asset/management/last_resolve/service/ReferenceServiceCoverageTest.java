package asset.management.last_resolve.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import asset.management.last_resolve.dto.ReferenceDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.AssetCategory;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.ReferenceMapper;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.AssetCategoryRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.repository.LocationRepository;
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
class ReferenceServiceCoverageTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private LocationRepository locationRepository;
    @Mock private AssetCategoryRepository assetCategoryRepository;
    @Mock private AssetRepository assetRepository;
    @Mock private AppUserRepository appUserRepository;

    private ReferenceService service;
    private Department department;

    @BeforeEach
    void setUp() {
        service = new ReferenceService(
            departmentRepository,
            locationRepository,
            assetCategoryRepository,
            assetRepository,
            appUserRepository,
            new ReferenceMapper(),
            new UserMapper()
        );
        department = TestDataFactory.department("IT");
    }

    @Test
    void usersByRolesReturnsOnlyAllowedRolesInNameOrder() {
        AppUser employee = TestDataFactory.user(UserRole.EMPLOYEE, department, "employee");
        employee.setFullName("Zoe Employee");
        AppUser manager = TestDataFactory.user(UserRole.MANAGER, department, "manager");
        manager.setFullName("Alex Manager");
        when(appUserRepository.findAll()).thenReturn(List.of(employee, manager));

        List<UserDtos.UserResponse> result = service.usersByRoles(List.of("manager"));

        assertThat(result).extracting(UserDtos.UserResponse::name).containsExactly("Alex Manager");
    }

    @Test
    void createCategoryRejectsDuplicateCodes() {
        when(assetCategoryRepository.findByCodeIgnoreCase("LAP")).thenReturn(Optional.of(new AssetCategory()));

        assertThatThrownBy(() -> service.createCategory(request("LAP")))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("already exists");
    }

    @Test
    void updateCategoryRejectsMissingParents() {
        AssetCategory category = TestDataFactory.category("MON");
        ReferenceDtos.AssetCategoryUpsertRequest request = request("LAP");
        when(assetCategoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(assetCategoryRepository.findByCodeIgnoreCase("LAP")).thenReturn(Optional.empty());
        when(assetCategoryRepository.findById(UUID.fromString(request.parentId()))).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateCategory(category.getId(), request))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Parent category not found");
    }

    @Test
    void deleteCategoryRejectsCategoriesInUse() {
        AssetCategory category = TestDataFactory.category("LAP");
        Asset asset = TestDataFactory.asset(department, null, true, LifecycleStatus.IN_STORAGE);
        asset.setCategory(category);
        when(assetRepository.findAll()).thenReturn(List.of(asset));

        assertThatThrownBy(() -> service.deleteCategory(category.getId()))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("in use");
    }

    @Test
    void createCategoryNormalizesCodeAndDefaultsFlags() {
        when(assetCategoryRepository.findByCodeIgnoreCase("lap")).thenReturn(Optional.empty());
        when(assetCategoryRepository.save(any(AssetCategory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ReferenceDtos.AssetCategoryResponse result = service.createCategory(new ReferenceDtos.AssetCategoryUpsertRequest(
            "Laptop",
            "lap",
            "Portable devices",
            null,
            true,
            null,
            null,
            null
        ));

        ArgumentCaptor<AssetCategory> captor = ArgumentCaptor.forClass(AssetCategory.class);
        verify(assetCategoryRepository).save(captor.capture());
        assertThat(captor.getValue().getCode()).isEqualTo("LAP");
        assertThat(captor.getValue().isRequiresSerial()).isTrue();
        assertThat(result.code()).isEqualTo("LAP");
    }

    private ReferenceDtos.AssetCategoryUpsertRequest request(String code) {
        return new ReferenceDtos.AssetCategoryUpsertRequest(
            "Laptop",
            code,
            "Portable devices",
            UUID.randomUUID().toString(),
            true,
            null,
            null,
            null
        );
    }
}
