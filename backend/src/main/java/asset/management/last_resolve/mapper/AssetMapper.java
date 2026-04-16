package asset.management.last_resolve.mapper;

import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationTask;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AssetMapper {

    private final WorkflowMapper workflowMapper;

    public AssetDtos.AssetResponse toAssetResponse(Asset asset) {
        return new AssetDtos.AssetResponse(
            MapperUtils.uuid(asset.getId()),
            asset.getCode(),
            asset.getName(),
            asset.getDescription(),
            MapperUtils.uuid(asset.getCategory().getId()),
            asset.getCategory().getName(),
            MapperUtils.uuid(asset.getDepartment().getId()),
            asset.getDepartment().getName(),
            asset.getAssignedToUser() == null ? null : MapperUtils.uuid(asset.getAssignedToUser().getId()),
            asset.getAssignedToUser() == null ? null : asset.getAssignedToUser().getFullName(),
            MapperUtils.uuid(asset.getLocation().getId()),
            asset.getLocation().getName(),
            asset.getCondition().getValue(),
            asset.getLifecycleStatus().getValue(),
            asset.getBrand(),
            asset.getModel(),
            asset.getSerialNumber(),
            MapperUtils.date(asset.getPurchaseDate()),
            MapperUtils.decimal(asset.getPurchasePrice()),
            MapperUtils.date(asset.getWarrantyExpiry()),
            asset.isBorrowable(),
            MapperUtils.date(asset.getLastVerifiedDate()),
            MapperUtils.date(asset.getNextVerificationDue()),
            asset.getNotes(),
            MapperUtils.timestamp(asset.getCreatedAt())
        );
    }

    public AssetDtos.AssetDetailResponse toAssetDetailResponse(
        Asset asset,
        List<Assignment> assignments,
        List<BorrowRequest> borrowRequests,
        List<MaintenanceRecord> maintenanceRecords,
        List<VerificationTask> verificationTasks,
        List<Discrepancy> discrepancies,
        List<CommonDtos.AuditLogResponse> auditLogs
    ) {
        List<WorkflowDtos.AssignmentResponse> assignmentResponses = assignments.stream().map(workflowMapper::toAssignmentResponse).toList();
        List<WorkflowDtos.BorrowRequestResponse> borrowResponses = borrowRequests.stream().map(workflowMapper::toBorrowRequestResponse).toList();
        List<WorkflowDtos.MaintenanceRecordResponse> maintenanceResponses = maintenanceRecords.stream().map(workflowMapper::toMaintenanceResponse).toList();
        List<WorkflowDtos.VerificationTaskResponse> taskResponses = verificationTasks.stream().map(workflowMapper::toTaskResponse).toList();
        List<WorkflowDtos.DiscrepancyResponse> discrepancyResponses = discrepancies.stream().map(workflowMapper::toDiscrepancyResponse).toList();
        return new AssetDtos.AssetDetailResponse(
            toAssetResponse(asset),
            assignmentResponses,
            borrowResponses,
            maintenanceResponses,
            taskResponses,
            discrepancyResponses,
            auditLogs
        );
    }
}
