package asset.management.last_resolve.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class AssetDtos {

    private AssetDtos() {
    }

    public record AssetResponse(
        String id,
        String code,
        String name,
        String description,
        String categoryId,
        String categoryName,
        String departmentId,
        String departmentName,
        String assignedToId,
        String assignedToName,
        String locationId,
        String locationName,
        String condition,
        String lifecycle,
        String brand,
        String model,
        String serialNumber,
        String purchaseDate,
        Double purchasePrice,
        String warrantyExpiry,
        Boolean borrowable,
        String lastVerifiedDate,
        String nextVerificationDue,
        String notes,
        String createdAt
    ) {
    }

    public record AssetDetailResponse(
        AssetResponse asset,
        List<WorkflowDtos.AssignmentResponse> assignments,
        List<WorkflowDtos.BorrowRequestResponse> borrowRequests,
        List<WorkflowDtos.MaintenanceRecordResponse> maintenanceRecords,
        List<WorkflowDtos.VerificationTaskResponse> verificationTasks,
        List<WorkflowDtos.DiscrepancyResponse> discrepancies,
        List<CommonDtos.AuditLogResponse> auditLogs
    ) {
    }

    public record AssetUpsertRequest(
        @NotBlank String name,
        @NotBlank String code,
        @NotBlank String categoryId,
        @NotBlank String departmentId,
        String locationId,
        String brand,
        String model,
        String serialNumber,
        String purchaseDate,
        Double purchasePrice,
        String warrantyExpiry,
        @NotNull Boolean borrowable,
        String notes,
        @NotBlank String condition,
        String description
    ) {
    }
}
