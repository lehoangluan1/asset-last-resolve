package asset.management.last_resolve.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class WorkflowDtos {

    private WorkflowDtos() {
    }

    public record AssignmentResponse(
        String id,
        String assetId,
        String assetCode,
        String assetName,
        String type,
        String fromUserId,
        String fromUserName,
        String fromDepartmentId,
        String fromDepartmentCode,
        String toUserId,
        String toUserName,
        String toDepartmentId,
        String toDepartmentCode,
        String status,
        String effectiveDate,
        String returnDate,
        String notes,
        String createdAt,
        String createdBy
    ) {
    }

    public record BorrowRequestResponse(
        String id,
        String assetId,
        String assetCode,
        String assetName,
        String requesterId,
        String requesterName,
        String departmentId,
        String departmentName,
        String borrowDate,
        String returnDate,
        String purpose,
        String notes,
        String status,
        String approvedBy,
        String approverNotes,
        String checkedOutAt,
        String returnedAt,
        String createdAt
    ) {
    }

    public record BorrowRequestCreateRequest(
        @NotBlank String assetId,
        @NotBlank String borrowDate,
        @NotBlank String returnDate,
        @NotBlank String purpose,
        String notes
    ) {
    }

    public record DecisionRequest(
        String notes
    ) {
    }

    public record MaintenanceRecordResponse(
        String id,
        String assetId,
        String assetCode,
        String assetName,
        String type,
        String description,
        String techCondition,
        String status,
        String priority,
        String assignedToId,
        String assignedTo,
        String scheduledDate,
        String completedDate,
        Double cost,
        String notes,
        String createdAt
    ) {
    }

    public record MaintenanceCreateRequest(
        @NotBlank String assetId,
        @NotBlank String type,
        @NotBlank String description,
        @NotBlank String techCondition,
        @NotBlank String status,
        @NotBlank String priority,
        @NotBlank String assignedToUserId,
        @NotBlank String scheduledDate,
        String completedDate,
        Double cost,
        String notes
    ) {
    }

    public record VerificationCampaignResponse(
        String id,
        String code,
        String name,
        Integer year,
        String scope,
        List<String> departmentIds,
        String status,
        String dueDate,
        String startDate,
        Integer totalTasks,
        Integer completedTasks,
        Integer discrepancyCount,
        String createdAt,
        List<VerificationTaskResponse> tasks
    ) {
    }

    public record VerificationTaskResponse(
        String id,
        String campaignId,
        String assetId,
        String assetCode,
        String assetName,
        String assignedToId,
        String expectedLocation,
        String expectedCondition,
        String expectedAssignee,
        String observedLocation,
        String observedCondition,
        String observedAssignee,
        String result,
        String notes,
        String verifiedAt
    ) {
    }

    public record VerificationCampaignCreateRequest(
        @NotBlank String name,
        @NotBlank String code,
        @NotNull Integer year,
        String description,
        @NotEmpty List<String> departmentIds,
        @NotBlank String status,
        @NotBlank String dueDate,
        @NotBlank String startDate
    ) {
    }

    public record DiscrepancyResponse(
        String id,
        String campaignId,
        String taskId,
        String assetId,
        String assetCode,
        String assetName,
        String type,
        String severity,
        String status,
        String expectedValue,
        String observedValue,
        String rootCause,
        String resolution,
        String resolvedBy,
        String resolvedAt,
        String createdAt
    ) {
    }

    public record DiscrepancyActionRequest(
        String rootCause,
        String resolution,
        String notes
    ) {
    }

    public record DisposalRequestResponse(
        String id,
        String assetId,
        String assetCode,
        String assetName,
        String reason,
        String status,
        String proposedBy,
        String reviewedBy,
        String effectiveDate,
        Double estimatedValue,
        String notes,
        String createdAt
    ) {
    }
}
