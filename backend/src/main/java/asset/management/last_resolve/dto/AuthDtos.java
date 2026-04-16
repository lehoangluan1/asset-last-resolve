package asset.management.last_resolve.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.OffsetDateTime;
import java.util.Set;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
        @NotBlank String username,
        @NotBlank String password
    ) {
    }

    public record AuthResponse(
        String token,
        OffsetDateTime expiresAt,
        AuthenticatedUserResponse user
    ) {
    }

    public record AuthenticatedUserResponse(
        String id,
        String username,
        String name,
        String email,
        String role,
        String departmentId,
        String departmentName,
        String status,
        String phone,
        String avatar,
        String bio,
        String createdAt,
        String lastLoginAt,
        Set<String> grants
    ) {
    }

    public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank String newPassword,
        @NotBlank String confirmPassword
    ) {
    }
}
