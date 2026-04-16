package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class PageResponseFactory {

    public <T> CommonDtos.PageResponse<T> create(List<T> items, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int totalItems = items.size();
        int fromIndex = Math.min(safePage * safeSize, totalItems);
        int toIndex = Math.min(fromIndex + safeSize, totalItems);
        int totalPages = totalItems == 0 ? 1 : (int) Math.ceil((double) totalItems / safeSize);
        return new CommonDtos.PageResponse<>(
            items.subList(fromIndex, toIndex),
            totalItems,
            safePage,
            safeSize,
            totalPages
        );
    }
}
