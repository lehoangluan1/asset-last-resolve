package asset.management.last_resolve.mapper;

import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.DisposalRequest;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.entity.VerificationTask;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class WorkflowMapper {

    public WorkflowDtos.AssignmentResponse toAssignmentResponse(Assignment assignment) {
        return new WorkflowDtos.AssignmentResponse(
            MapperUtils.uuid(assignment.getId()),
            MapperUtils.uuid(assignment.getAsset().getId()),
            assignment.getAsset().getCode(),
            assignment.getAsset().getName(),
            assignment.getAssignmentType().getValue(),
            assignment.getFromUser() == null ? null : MapperUtils.uuid(assignment.getFromUser().getId()),
            assignment.getFromUser() == null ? null : assignment.getFromUser().getFullName(),
            assignment.getFromDepartment() == null ? null : MapperUtils.uuid(assignment.getFromDepartment().getId()),
            assignment.getFromDepartment() == null ? null : assignment.getFromDepartment().getCode(),
            MapperUtils.uuid(assignment.getToUser().getId()),
            assignment.getToUser().getFullName(),
            MapperUtils.uuid(assignment.getToDepartment().getId()),
            assignment.getToDepartment().getCode(),
            assignment.getStatus().getValue(),
            MapperUtils.date(assignment.getEffectiveDate()),
            MapperUtils.date(assignment.getReturnDate()),
            assignment.getNotes(),
            MapperUtils.timestamp(assignment.getCreatedAt()),
            assignment.getCreatedBy().getFullName()
        );
    }

    public WorkflowDtos.BorrowRequestResponse toBorrowRequestResponse(BorrowRequest request) {
        return new WorkflowDtos.BorrowRequestResponse(
            MapperUtils.uuid(request.getId()),
            MapperUtils.uuid(request.getAsset().getId()),
            request.getAsset().getCode(),
            request.getAsset().getName(),
            MapperUtils.uuid(request.getRequester().getId()),
            request.getRequester().getFullName(),
            MapperUtils.uuid(request.getDepartment().getId()),
            request.getDepartment().getName(),
            MapperUtils.date(request.getBorrowDate()),
            MapperUtils.date(request.getReturnDate()),
            request.getPurpose(),
            request.getNotes(),
            request.getStatus().getValue(),
            request.getApprovedBy() == null ? null : request.getApprovedBy().getFullName(),
            request.getApproverNotes(),
            MapperUtils.timestamp(request.getCheckedOutAt()),
            MapperUtils.timestamp(request.getReturnedAt()),
            MapperUtils.timestamp(request.getCreatedAt())
        );
    }

    public WorkflowDtos.MaintenanceRecordResponse toMaintenanceResponse(MaintenanceRecord record) {
        return new WorkflowDtos.MaintenanceRecordResponse(
            MapperUtils.uuid(record.getId()),
            MapperUtils.uuid(record.getAsset().getId()),
            record.getAsset().getCode(),
            record.getAsset().getName(),
            record.getMaintenanceType(),
            record.getDescription(),
            record.getTechCondition().getValue(),
            record.getStatus().getValue(),
            record.getPriority().getValue(),
            MapperUtils.uuid(record.getAssignedToUser().getId()),
            record.getAssignedToUser().getFullName(),
            MapperUtils.date(record.getScheduledDate()),
            MapperUtils.date(record.getCompletedDate()),
            MapperUtils.decimal(record.getCost()),
            record.getNotes(),
            MapperUtils.timestamp(record.getCreatedAt())
        );
    }

    public WorkflowDtos.VerificationTaskResponse toTaskResponse(VerificationTask task) {
        return new WorkflowDtos.VerificationTaskResponse(
            MapperUtils.uuid(task.getId()),
            MapperUtils.uuid(task.getCampaign().getId()),
            MapperUtils.uuid(task.getAsset().getId()),
            task.getAsset().getCode(),
            task.getAsset().getName(),
            MapperUtils.uuid(task.getAssignedToUser().getId()),
            task.getExpectedLocation().getName(),
            task.getExpectedCondition().getValue(),
            task.getExpectedAssignee() == null ? null : task.getExpectedAssignee().getFullName(),
            task.getObservedLocation() == null ? null : task.getObservedLocation().getName(),
            task.getObservedCondition() == null ? null : task.getObservedCondition().getValue(),
            task.getObservedAssignee() == null ? null : task.getObservedAssignee().getFullName(),
            task.getResult().getValue(),
            task.getNotes(),
            MapperUtils.timestamp(task.getVerifiedAt())
        );
    }

    public WorkflowDtos.VerificationCampaignResponse toCampaignResponse(VerificationCampaign campaign, List<VerificationTask> tasks) {
        long completedTasks = tasks.stream().filter(task -> task.getVerifiedAt() != null).count();
        long discrepancies = tasks.stream().filter(task -> task.getResult().getValue().equals("discrepancy")).count();
        return new WorkflowDtos.VerificationCampaignResponse(
            MapperUtils.uuid(campaign.getId()),
            campaign.getCode(),
            campaign.getName(),
            campaign.getYear(),
            campaign.getScope(),
            campaign.getDepartments().stream().map(department -> MapperUtils.uuid(department.getId())).toList(),
            campaign.getStatus().getValue(),
            MapperUtils.date(campaign.getDueDate()),
            MapperUtils.date(campaign.getStartDate()),
            tasks.size(),
            (int) completedTasks,
            (int) discrepancies,
            MapperUtils.timestamp(campaign.getCreatedAt()),
            tasks.stream().map(this::toTaskResponse).toList()
        );
    }

    public WorkflowDtos.DiscrepancyResponse toDiscrepancyResponse(Discrepancy discrepancy) {
        return new WorkflowDtos.DiscrepancyResponse(
            MapperUtils.uuid(discrepancy.getId()),
            MapperUtils.uuid(discrepancy.getCampaign().getId()),
            MapperUtils.uuid(discrepancy.getTask().getId()),
            MapperUtils.uuid(discrepancy.getAsset().getId()),
            discrepancy.getAsset().getCode(),
            discrepancy.getAsset().getName(),
            discrepancy.getType().getValue(),
            discrepancy.getSeverity().getValue(),
            discrepancy.getStatus().getValue(),
            discrepancy.getExpectedValue(),
            discrepancy.getObservedValue(),
            discrepancy.getRootCause(),
            discrepancy.getResolution(),
            discrepancy.getResolvedBy() == null ? null : discrepancy.getResolvedBy().getFullName(),
            MapperUtils.timestamp(discrepancy.getResolvedAt()),
            MapperUtils.timestamp(discrepancy.getCreatedAt())
        );
    }

    public WorkflowDtos.DisposalRequestResponse toDisposalResponse(DisposalRequest request) {
        return new WorkflowDtos.DisposalRequestResponse(
            MapperUtils.uuid(request.getId()),
            MapperUtils.uuid(request.getAsset().getId()),
            request.getAsset().getCode(),
            request.getAsset().getName(),
            request.getReason(),
            request.getStatus().getValue(),
            request.getProposedBy().getFullName(),
            request.getReviewedBy() == null ? null : request.getReviewedBy().getFullName(),
            MapperUtils.date(request.getEffectiveDate()),
            MapperUtils.decimal(request.getEstimatedValue()),
            request.getNotes(),
            MapperUtils.timestamp(request.getCreatedAt())
        );
    }
}
