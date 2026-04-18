package asset.management.last_resolve.dto;

import jakarta.validation.constraints.NotBlank;

public final class ReferenceDtos {

    private ReferenceDtos() {
    }

    public record DepartmentResponse(
        String id,
        String name,
        String code,
        String managerId,
        String managerName,
        String location,
        Integer employeeCount
    ) {
    }

    public record DepartmentUpsertRequest(
        @NotBlank String name,
        @NotBlank String code,
        @NotBlank String location
    ) {
    }

    public record LocationResponse(
        String id,
        String name,
        String building,
        String floor,
        String room
    ) {
    }

    public record AssetCategoryResponse(
        String id,
        String name,
        String code,
        String description,
        String parentId,
        Boolean borrowableByDefault,
        Boolean requiresSerial,
        Boolean requiresVerification,
        String status
    ) {
    }

    public record AssetCategoryUpsertRequest(
        @NotBlank String name,
        @NotBlank String code,
        @NotBlank String description,
        String parentId,
        Boolean borrowableByDefault,
        Boolean requiresSerial,
        Boolean requiresVerification,
        String status
    ) {
    }
}
