package asset.management.last_resolve.dto;

import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {
    }

    public record DashboardResponse(
        String role,
        List<DashboardStatResponse> stats,
        List<DistributionItemResponse> departmentDistribution,
        List<DistributionItemResponse> statusBreakdown,
        ActiveCampaignResponse activeCampaign,
        List<CommonDtos.AuditLogResponse> recentActivity,
        List<DeadlineItemResponse> upcomingDeadlines
    ) {
    }

    public record DashboardStatResponse(
        String key,
        String label,
        long value,
        String variant,
        String subtitle
    ) {
    }

    public record DistributionItemResponse(
        String name,
        long value
    ) {
    }

    public record ActiveCampaignResponse(
        String id,
        String name,
        String scope,
        String dueDate,
        int totalTasks,
        int completedTasks,
        int discrepancyCount
    ) {
    }

    public record DeadlineItemResponse(
        String label,
        String date,
        String status
    ) {
    }
}
