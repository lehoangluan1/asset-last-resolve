package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.ReferenceDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.AssetCategory;
import asset.management.last_resolve.exception.BadRequestException;
import asset.management.last_resolve.exception.ResourceNotFoundException;
import asset.management.last_resolve.mapper.ReferenceMapper;
import asset.management.last_resolve.mapper.UserMapper;
import asset.management.last_resolve.repository.AssignmentRepository;
import asset.management.last_resolve.repository.AssetCategoryRepository;
import asset.management.last_resolve.repository.AssetRepository;
import asset.management.last_resolve.repository.AppUserRepository;
import asset.management.last_resolve.repository.BorrowRequestRepository;
import asset.management.last_resolve.repository.DepartmentRepository;
import asset.management.last_resolve.repository.LocationRepository;
import asset.management.last_resolve.repository.VerificationCampaignRepository;
import asset.management.last_resolve.enums.ReferenceStatus;
import asset.management.last_resolve.enums.UserRole;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReferenceService {

    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final AssetRepository assetRepository;
    private final AppUserRepository appUserRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final AssignmentRepository assignmentRepository;
    private final VerificationCampaignRepository verificationCampaignRepository;
    private final ReferenceMapper referenceMapper;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public List<ReferenceDtos.DepartmentResponse> departments() {
        return departmentRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(department -> department.getName().toLowerCase()))
            .map(referenceMapper::toDepartmentResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ReferenceDtos.LocationResponse> locations() {
        return locationRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(location -> location.getName().toLowerCase()))
            .map(referenceMapper::toLocationResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ReferenceDtos.AssetCategoryResponse> categories() {
        return assetCategoryRepository.findAll().stream()
            .sorted(java.util.Comparator.comparing(category -> category.getName().toLowerCase()))
            .map(referenceMapper::toCategoryResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<UserDtos.UserResponse> usersByRoles(List<String> roles) {
        List<UserRole> allowedRoles = roles.stream().map(UserRole::fromValue).toList();
        return appUserRepository.findAll().stream()
            .filter(user -> allowedRoles.contains(user.getRole()))
            .sorted(java.util.Comparator.comparing(user -> user.getFullName().toLowerCase()))
            .map(userMapper::toUserResponse)
            .toList();
    }

    @Transactional
    public ReferenceDtos.DepartmentResponse createDepartment(ReferenceDtos.DepartmentUpsertRequest request) {
        departmentRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            throw new BadRequestException("Department code already exists");
        });
        Department department = new Department();
        department.setEmployeeCount(0);
        applyDepartment(department, request);
        return referenceMapper.toDepartmentResponse(departmentRepository.save(department));
    }

    @Transactional
    public ReferenceDtos.DepartmentResponse updateDepartment(UUID departmentId, ReferenceDtos.DepartmentUpsertRequest request) {
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        departmentRepository.findByCodeIgnoreCase(request.code())
            .filter(existing -> !existing.getId().equals(departmentId))
            .ifPresent(existing -> {
                throw new BadRequestException("Department code already exists");
            });
        applyDepartment(department, request);
        return referenceMapper.toDepartmentResponse(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(UUID departmentId) {
        Department department = departmentRepository.findById(departmentId)
            .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        if (isDepartmentInUse(departmentId)) {
            throw new BadRequestException("Cannot delete a department that is in use");
        }
        departmentRepository.delete(department);
    }

    @Transactional
    public ReferenceDtos.AssetCategoryResponse createCategory(ReferenceDtos.AssetCategoryUpsertRequest request) {
        assetCategoryRepository.findByCodeIgnoreCase(request.code()).ifPresent(existing -> {
            throw new BadRequestException("Category code already exists");
        });
        AssetCategory category = new AssetCategory();
        applyCategory(category, request);
        return referenceMapper.toCategoryResponse(assetCategoryRepository.save(category));
    }

    @Transactional
    public ReferenceDtos.AssetCategoryResponse updateCategory(UUID categoryId, ReferenceDtos.AssetCategoryUpsertRequest request) {
        AssetCategory category = assetCategoryRepository.findById(categoryId)
            .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        assetCategoryRepository.findByCodeIgnoreCase(request.code())
            .filter(existing -> !existing.getId().equals(categoryId))
            .ifPresent(existing -> {
                throw new BadRequestException("Category code already exists");
            });
        applyCategory(category, request);
        return referenceMapper.toCategoryResponse(assetCategoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        if (assetRepository.findAll().stream().anyMatch(asset -> asset.getCategory().getId().equals(categoryId))) {
            throw new BadRequestException("Cannot delete a category that is in use");
        }
        assetCategoryRepository.deleteById(categoryId);
    }

    private boolean isDepartmentInUse(UUID departmentId) {
        return appUserRepository.findAll().stream().anyMatch(user ->
                user.getDepartment() != null && user.getDepartment().getId().equals(departmentId))
            || assetRepository.findAll().stream().anyMatch(asset ->
                asset.getDepartment() != null && asset.getDepartment().getId().equals(departmentId))
            || borrowRequestRepository.findAll().stream().anyMatch(request ->
                request.getDepartment() != null && request.getDepartment().getId().equals(departmentId))
            || assignmentRepository.findAll().stream().anyMatch(assignment ->
                (assignment.getFromDepartment() != null && assignment.getFromDepartment().getId().equals(departmentId))
                    || (assignment.getToDepartment() != null && assignment.getToDepartment().getId().equals(departmentId)))
            || verificationCampaignRepository.findAll().stream().anyMatch(campaign ->
                campaign.getDepartments().stream().anyMatch(department -> department.getId().equals(departmentId)));
    }

    private void applyDepartment(Department department, ReferenceDtos.DepartmentUpsertRequest request) {
        department.setName(request.name().trim());
        department.setCode(request.code().trim().toUpperCase());
        department.setLocation(request.location().trim());
        if (department.getEmployeeCount() == null) {
            department.setEmployeeCount(0);
        }
    }

    private void applyCategory(AssetCategory category, ReferenceDtos.AssetCategoryUpsertRequest request) {
        category.setName(request.name().trim());
        category.setCode(request.code().trim().toUpperCase());
        category.setDescription(request.description().trim());
        category.setBorrowableByDefault(Boolean.TRUE.equals(request.borrowableByDefault()));
        category.setRequiresSerial(request.requiresSerial() == null || request.requiresSerial());
        category.setRequiresVerification(request.requiresVerification() == null || request.requiresVerification());
        category.setStatus(request.status() == null ? ReferenceStatus.ACTIVE : ReferenceStatus.fromValue(request.status()));
        if (request.parentId() == null || request.parentId().isBlank()) {
            category.setParent(null);
        } else {
            category.setParent(assetCategoryRepository.findById(UUID.fromString(request.parentId()))
                .orElseThrow(() -> new ResourceNotFoundException("Parent category not found")));
        }
    }
}
