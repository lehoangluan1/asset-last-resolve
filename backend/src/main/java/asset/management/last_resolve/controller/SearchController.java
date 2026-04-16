package asset.management.last_resolve.controller;

import asset.management.last_resolve.dto.SearchDtos;
import asset.management.last_resolve.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SearchDtos.SearchResponse> search(@RequestParam(name = "q", required = false) String query) {
        return ResponseEntity.ok(searchService.search(query));
    }
}
