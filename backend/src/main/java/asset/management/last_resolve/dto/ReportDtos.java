package asset.management.last_resolve.dto;

public final class ReportDtos {

    private ReportDtos() {
    }

    public record ReportSummaryResponse(
        long totalAssets,
        long openDiscrepancies,
        long activeMaintenance,
        long activeBorrows
    ) {
    }
}
