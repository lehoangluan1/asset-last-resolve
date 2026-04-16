package asset.management.last_resolve.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class UserDtos {

    private UserDtos() {
    }

    public record UserResponse(
        String id,
        String username,
        String name,
        String email,
        String role,
        String departmentId,
        String departmentName,
        String status,
        String avatar,
        String phone,
        String createdAt
    ) {
    }

    public record UserUpsertRequest(
        @NotBlank String username,
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank String role,
        @NotBlank String departmentId,
        @NotNull Boolean active,
        String phone
    ) {
    }

    public record ProfileUpdateRequest(
        String phone,
        String bio
    ) {
    }
}
