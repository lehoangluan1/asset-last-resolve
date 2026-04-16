package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.AuthDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final asset.management.last_resolve.service.AuthService authService;

    @GetMapping
    @PreAuthorize("hasAuthority('profile.read')")
    public ResponseEntity<AuthDtos.AuthenticatedUserResponse> profile() {
        return ResponseEntity.ok(authService.me());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('profile.write')")
    public ResponseEntity<AuthDtos.AuthenticatedUserResponse> update(@RequestBody UserDtos.ProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }
}
