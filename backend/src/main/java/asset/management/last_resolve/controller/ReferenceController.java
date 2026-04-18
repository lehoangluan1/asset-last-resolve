package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.ReferenceDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.service.ReferenceService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reference")
@RequiredArgsConstructor
public class ReferenceController {

    private final ReferenceService referenceService;

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('reference.read')")
    public ResponseEntity<List<ReferenceDtos.DepartmentResponse>> departments() {
        return ResponseEntity.ok(referenceService.departments());
    }

    @PostMapping("/departments")
    @PreAuthorize("hasAuthority('reference.manage')")
    public ResponseEntity<ReferenceDtos.DepartmentResponse> createDepartment(@Valid @RequestBody ReferenceDtos.DepartmentUpsertRequest request) {
        return ResponseEntity.ok(referenceService.createDepartment(request));
    }

    @PutMapping("/departments/{departmentId}")
    @PreAuthorize("hasAuthority('reference.manage')")
    public ResponseEntity<ReferenceDtos.DepartmentResponse> updateDepartment(
        @PathVariable UUID departmentId,
        @Valid @RequestBody ReferenceDtos.DepartmentUpsertRequest request
    ) {
        return ResponseEntity.ok(referenceService.updateDepartment(departmentId, request));
    }

    @DeleteMapping("/departments/{departmentId}")
    @PreAuthorize("hasAuthority('reference.manage')")
    public ResponseEntity<Void> deleteDepartment(@PathVariable UUID departmentId) {
        referenceService.deleteDepartment(departmentId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/locations")
    @PreAuthorize("hasAuthority('reference.read')")
    public ResponseEntity<List<ReferenceDtos.LocationResponse>> locations() {
        return ResponseEntity.ok(referenceService.locations());
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAuthority('reference.read')")
    public ResponseEntity<List<ReferenceDtos.AssetCategoryResponse>> categories() {
        return ResponseEntity.ok(referenceService.categories());
    }

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('reference.read','maintenance.manage')")
    public ResponseEntity<List<UserDtos.UserResponse>> users(@RequestParam List<String> roles) {
        return ResponseEntity.ok(referenceService.usersByRoles(roles));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasAuthority('reference.manage')")
    public ResponseEntity<ReferenceDtos.AssetCategoryResponse> createCategory(@Valid @RequestBody ReferenceDtos.AssetCategoryUpsertRequest request) {
        return ResponseEntity.ok(referenceService.createCategory(request));
    }

    @PutMapping("/categories/{categoryId}")
    @PreAuthorize("hasAuthority('reference.manage')")
    public ResponseEntity<ReferenceDtos.AssetCategoryResponse> updateCategory(
        @PathVariable UUID categoryId,
        @Valid @RequestBody ReferenceDtos.AssetCategoryUpsertRequest request
    ) {
        return ResponseEntity.ok(referenceService.updateCategory(categoryId, request));
    }

    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("hasAuthority('reference.manage')")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID categoryId) {
        referenceService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}
