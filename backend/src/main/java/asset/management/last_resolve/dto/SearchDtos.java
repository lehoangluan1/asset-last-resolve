package asset.management.last_resolve.dto;

import java.util.List;

public final class SearchDtos {

    private SearchDtos() {
    }

    public record SearchResponse(
        String query,
        long totalResults,
        List<SearchSectionResponse> sections
    ) {
    }

    public record SearchSectionResponse(
        String key,
        String label,
        String href,
        long totalItems,
        List<SearchItemResponse> items
    ) {
    }

    public record SearchItemResponse(
        String id,
        String title,
        String subtitle,
        String description,
        String status,
        String href
    ) {
    }
}
