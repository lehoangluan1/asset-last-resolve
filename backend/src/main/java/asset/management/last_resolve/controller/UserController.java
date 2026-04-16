package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.service.UserService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('users.manage')")
    public ResponseEntity<CommonDtos.PageResponse<UserDtos.UserResponse>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String role,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(userService.list(search, role, status, page, size));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('users.manage')")
    public ResponseEntity<UserDtos.UserResponse> create(@Valid @RequestBody UserDtos.UserUpsertRequest request) {
        return ResponseEntity.ok(userService.create(request));
    }

    @PutMapping("/{userId}")
    @PreAuthorize("hasAuthority('users.manage')")
    public ResponseEntity<UserDtos.UserResponse> update(@PathVariable UUID userId, @Valid @RequestBody UserDtos.UserUpsertRequest request) {
        return ResponseEntity.ok(userService.update(userId, request));
    }

    @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasAuthority('users.manage')")
    public ResponseEntity<Void> resetPassword(@PathVariable UUID userId) {
        userService.resetPassword(userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{userId}/toggle-status")
    @PreAuthorize("hasAuthority('users.manage')")
    public ResponseEntity<UserDtos.UserResponse> toggleStatus(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.toggleStatus(userId));
    }
}
