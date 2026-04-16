package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
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
import asset.management.last_resolve.enums.AssetCondition;
import asset.management.last_resolve.enums.LifecycleStatus;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final AssetCategoryRepository assetCategoryRepository;
    private final DepartmentRepository departmentRepository;
    private final LocationRepository locationRepository;
    private final AssignmentRepository assignmentRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final VerificationTaskRepository verificationTaskRepository;
    private final DiscrepancyRepository discrepancyRepository;
    private final AuditLogRepository auditLogRepository;
    private final AssetMapper assetMapper;
    private final CommonMapper commonMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<AssetDtos.AssetResponse> list(String search, String lifecycle, String departmentId, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<AssetDtos.AssetResponse> items = assetRepository.findAll().stream()
            .filter(asset -> authorizationService.canViewAsset(currentUser, asset))
            .filter(asset -> normalizedSearch.isBlank()
                || asset.getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || asset.getCode().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(asset -> lifecycle == null || lifecycle.isBlank() || lifecycle.equalsIgnoreCase("all")
                || (asset.getLifecycleStatus() != null && asset.getLifecycleStatus().getValue().equalsIgnoreCase(lifecycle)))
            .filter(asset -> departmentId == null || departmentId.isBlank() || departmentId.equalsIgnoreCase("all")
                || asset.getDepartment().getId().equals(UUID.fromString(departmentId)))
            .sorted(Comparator.comparing(Asset::getCode))
            .map(assetMapper::toAssetResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }

    @Transactional(readOnly = true)
    public AssetDtos.AssetDetailResponse get(UUID assetId) {
        AppUser currentUser = currentUserService.currentUser();
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        if (!authorizationService.canViewAsset(currentUser, asset)) {
            throw new ForbiddenOperationException("You do not have access to this asset");
        }
        return assetMapper.toAssetDetailResponse(
            asset,
            assignmentRepository.findAll().stream().filter(item -> item.getAsset().getId().equals(assetId)).toList(),
            borrowRequestRepository.findAll().stream().filter(item -> item.getAsset().getId().equals(assetId)).toList(),
            maintenanceRecordRepository.findAll().stream().filter(item -> item.getAsset().getId().equals(assetId)).toList(),
            verificationTaskRepository.findAll().stream().filter(item -> item.getAsset().getId().equals(assetId)).toList(),
            discrepancyRepository.findAll().stream().filter(item -> item.getAsset().getId().equals(assetId)).toList(),
            auditLogRepository.findAll().stream()
                .filter(item -> item.getEntityId().equals(assetId.toString()) || item.getEntityName().equalsIgnoreCase(asset.getName()))
                .sorted(Comparator.comparing(item -> item.getCreatedAt(), Comparator.reverseOrder()))
                .limit(10)
                .map(commonMapper::toAuditLogResponse)
                .toList()
        );
    }

    @Transactional
    public AssetDtos.AssetResponse create(AssetDtos.AssetUpsertRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageAssets(currentUser)) {
            throw new ForbiddenOperationException("Only admins and officers can create assets");
        }
        Asset asset = new Asset();
        apply(asset, request, currentUser);
        Asset saved = assetRepository.save(asset);
        auditService.log(currentUser, "Created Asset", "Asset", saved.getId().toString(), saved.getName(), "Registered new asset");
        return assetMapper.toAssetResponse(saved);
    }

    @Transactional
    public AssetDtos.AssetResponse update(UUID assetId, AssetDtos.AssetUpsertRequest request) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageAssets(currentUser)) {
            throw new ForbiddenOperationException("Only admins and officers can update assets");
        }
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        apply(asset, request, currentUser);
        Asset saved = assetRepository.save(asset);
        auditService.log(currentUser, "Updated Asset", "Asset", saved.getId().toString(), saved.getName(), "Updated asset details");
        return assetMapper.toAssetResponse(saved);
    }

    @Transactional
    public void delete(UUID assetId) {
        AppUser currentUser = currentUserService.currentUser();
        if (!authorizationService.canManageAssets(currentUser)) {
            throw new ForbiddenOperationException("Only admins and officers can delete assets");
        }
        Asset asset = assetRepository.findById(assetId)
            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        boolean linked = assignmentRepository.findAll().stream().anyMatch(item -> item.getAsset().getId().equals(assetId))
            || borrowRequestRepository.findAll().stream().anyMatch(item -> item.getAsset().getId().equals(assetId))
            || maintenanceRecordRepository.findAll().stream().anyMatch(item -> item.getAsset().getId().equals(assetId));
        if (linked) {
            throw new BadRequestException("Asset cannot be deleted while related workflow records exist");
        }
        assetRepository.delete(asset);
        auditService.log(currentUser, "Deleted Asset", "Asset", asset.getId().toString(), asset.getName(), "Deleted asset record");
    }

    private void apply(Asset asset, AssetDtos.AssetUpsertRequest request, AppUser actor) {
        asset.setName(request.name().trim());
        asset.setCode(request.code().trim().toUpperCase(Locale.ROOT));
        asset.setDescription(request.description() == null || request.description().isBlank() ? request.name().trim() : request.description().trim());
        asset.setCategory(assetCategoryRepository.findById(UUID.fromString(request.categoryId()))
            .orElseThrow(() -> new ResourceNotFoundException("Category not found")));
        asset.setDepartment(departmentRepository.findById(UUID.fromString(request.departmentId()))
            .orElseThrow(() -> new ResourceNotFoundException("Department not found")));
        if (request.locationId() == null || request.locationId().isBlank()) {
            throw new BadRequestException("Location is required");
        }
        asset.setLocation(locationRepository.findById(UUID.fromString(request.locationId()))
            .orElseThrow(() -> new ResourceNotFoundException("Location not found")));
        asset.setBrand(request.brand());
        asset.setModel(request.model());
        asset.setSerialNumber(request.serialNumber());
        asset.setPurchaseDate(request.purchaseDate() == null || request.purchaseDate().isBlank() ? null : java.time.LocalDate.parse(request.purchaseDate()));
        asset.setPurchasePrice(request.purchasePrice() == null ? null : java.math.BigDecimal.valueOf(request.purchasePrice()));
        asset.setWarrantyExpiry(request.warrantyExpiry() == null || request.warrantyExpiry().isBlank() ? null : java.time.LocalDate.parse(request.warrantyExpiry()));
        asset.setBorrowable(Boolean.TRUE.equals(request.borrowable()));
        asset.setNotes(request.notes());
        asset.setCondition(AssetCondition.fromValue(request.condition()));
        if (asset.getLifecycleStatus() == null) {
            asset.setLifecycleStatus(LifecycleStatus.IN_STORAGE);
        }
        if (asset.getCreatedBy() == null) {
            asset.setCreatedBy(actor);
        }
        asset.setUpdatedBy(actor);
    }
}
