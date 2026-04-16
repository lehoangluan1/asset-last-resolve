package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.service.AssetService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    @GetMapping
    @PreAuthorize("hasAuthority('assets.read')")
    public ResponseEntity<CommonDtos.PageResponse<AssetDtos.AssetResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String departmentId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(assetService.list(search, status, departmentId, page, size));
    }

    @GetMapping("/{assetId}")
    @PreAuthorize("hasAuthority('assets.read')")
    public ResponseEntity<AssetDtos.AssetDetailResponse> get(@PathVariable UUID assetId) {
        return ResponseEntity.ok(assetService.get(assetId));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('assets.manage')")
    public ResponseEntity<AssetDtos.AssetResponse> create(@Valid @RequestBody AssetDtos.AssetUpsertRequest request) {
        return ResponseEntity.ok(assetService.create(request));
    }

    @PutMapping("/{assetId}")
    @PreAuthorize("hasAuthority('assets.manage')")
    public ResponseEntity<AssetDtos.AssetResponse> update(@PathVariable UUID assetId, @Valid @RequestBody AssetDtos.AssetUpsertRequest request) {
        return ResponseEntity.ok(assetService.update(assetId, request));
    }

    @DeleteMapping("/{assetId}")
    @PreAuthorize("hasAuthority('assets.manage')")
    public ResponseEntity<Void> delete(@PathVariable UUID assetId) {
        assetService.delete(assetId);
        return ResponseEntity.noContent().build();
    }
}
