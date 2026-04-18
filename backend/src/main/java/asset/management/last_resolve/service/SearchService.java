package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.AssetDtos;
import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.SearchDtos;
import asset.management.last_resolve.dto.UserDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.security.AuthenticatedUser;
import asset.management.last_resolve.security.PermissionGrant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SearchService {

    private static final int SECTION_LIMIT = 5;

    private final AssetService assetService;
    private final AssignmentService assignmentService;
    private final BorrowRequestService borrowRequestService;
    private final MaintenanceService maintenanceService;
    private final VerificationService verificationService;
    private final DiscrepancyService discrepancyService;
    private final DisposalService disposalService;
    private final UserService userService;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public SearchDtos.SearchResponse search(String rawQuery) {
        String query = rawQuery == null ? "" : rawQuery.trim();
        if (query.isBlank()) {
            return new SearchDtos.SearchResponse("", 0, List.of());
        }

        AuthenticatedUser principal = currentUserService.currentPrincipal();
        List<SearchDtos.SearchSectionResponse> sections = new ArrayList<>();

        if (principal.hasGrant(PermissionGrant.ASSETS_READ)) {
            sections.add(assetSection(query));
        }
        if (principal.hasGrant(PermissionGrant.USERS_MANAGE)) {
            sections.add(userSection(query));
        }
        if (principal.hasGrant(PermissionGrant.BORROWS_READ)) {
            sections.add(borrowRequestSection(query));
        }
        if (principal.hasGrant(PermissionGrant.ASSIGNMENTS_READ)) {
            sections.add(assignmentSection(query));
        }
        if (principal.hasGrant(PermissionGrant.MAINTENANCE_READ)) {
            sections.add(maintenanceSection(query));
        }
        if (principal.hasGrant(PermissionGrant.DISCREPANCIES_READ)) {
            sections.add(discrepancySection(query));
        }
        if (principal.hasGrant(PermissionGrant.DISPOSAL_READ)) {
            sections.add(disposalSection(query));
        }
        if (principal.hasGrant(PermissionGrant.VERIFICATION_READ)) {
            sections.add(verificationSection(query));
        }

        List<SearchDtos.SearchSectionResponse> populatedSections = sections.stream()
            .filter(section -> section.totalItems() > 0)
            .toList();

        long totalResults = populatedSections.stream()
            .mapToLong(SearchDtos.SearchSectionResponse::totalItems)
            .sum();

        return new SearchDtos.SearchResponse(query, totalResults, populatedSections);
    }

    private SearchDtos.SearchSectionResponse assetSection(String query) {
        CommonDtos.PageResponse<AssetDtos.AssetResponse> page = assetService.list(query, null, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "assets",
            "Assets",
            "/assets",
            page.totalItems(),
            page.items().stream()
                .map(asset -> new SearchDtos.SearchItemResponse(
                    asset.id(),
                    asset.name(),
                    asset.code(),
                    "%s • %s".formatted(asset.departmentName(), asset.locationName()),
                    asset.lifecycle(),
                    "/assets/" + asset.id()
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse userSection(String query) {
        CommonDtos.PageResponse<UserDtos.UserResponse> page = userService.list(query, null, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "users",
            "Users",
            "/users",
            page.totalItems(),
            page.items().stream()
                .map(user -> new SearchDtos.SearchItemResponse(
                    user.id(),
                    user.name(),
                    user.username(),
                    "%s • %s".formatted(user.departmentName(), user.email()),
                    user.role(),
                    "/users"
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse borrowRequestSection(String query) {
        CommonDtos.PageResponse<WorkflowDtos.BorrowRequestResponse> page = borrowRequestService.list(query, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "borrow-requests",
            "Borrow Requests",
            "/borrow-requests",
            page.totalItems(),
            page.items().stream()
                .map(request -> new SearchDtos.SearchItemResponse(
                    request.id(),
                    request.assetName() == null ? request.categoryName() : request.assetName(),
                    request.requesterName(),
                    "%s • Return %s".formatted(request.purpose(), request.returnDate()),
                    request.status(),
                    "/borrow-requests"
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse assignmentSection(String query) {
        CommonDtos.PageResponse<WorkflowDtos.AssignmentResponse> page = assignmentService.list(query, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "assignments",
            "Assignments",
            "/assignments",
            page.totalItems(),
            page.items().stream()
                .map(assignment -> new SearchDtos.SearchItemResponse(
                    assignment.id(),
                    assignment.assetName(),
                    assignment.assetCode(),
                    "Assigned to %s (%s)".formatted(assignment.toUserName(), assignment.toDepartmentCode()),
                    assignment.status(),
                    "/assignments"
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse maintenanceSection(String query) {
        CommonDtos.PageResponse<WorkflowDtos.MaintenanceRecordResponse> page = maintenanceService.list(query, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "maintenance",
            "Maintenance",
            "/maintenance",
            page.totalItems(),
            page.items().stream()
                .map(record -> new SearchDtos.SearchItemResponse(
                    record.id(),
                    record.assetName(),
                    record.type(),
                    "Assigned to %s • Scheduled %s".formatted(record.assignedTo(), record.scheduledDate()),
                    record.status(),
                    "/maintenance"
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse discrepancySection(String query) {
        CommonDtos.PageResponse<WorkflowDtos.DiscrepancyResponse> page = discrepancyService.list(query, null, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "discrepancies",
            "Discrepancies",
            "/discrepancies",
            page.totalItems(),
            page.items().stream()
                .map(discrepancy -> new SearchDtos.SearchItemResponse(
                    discrepancy.id(),
                    discrepancy.assetName(),
                    "%s discrepancy".formatted(discrepancy.type()),
                    "Expected %s • Observed %s".formatted(discrepancy.expectedValue(), discrepancy.observedValue()),
                    discrepancy.status(),
                    "/discrepancies"
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse disposalSection(String query) {
        CommonDtos.PageResponse<WorkflowDtos.DisposalRequestResponse> page = disposalService.list(query, null, 0, SECTION_LIMIT);
        return new SearchDtos.SearchSectionResponse(
            "disposal",
            "Disposal",
            "/disposal",
            page.totalItems(),
            page.items().stream()
                .map(request -> new SearchDtos.SearchItemResponse(
                    request.id(),
                    request.assetName(),
                    request.proposedBy(),
                    request.reason(),
                    request.status(),
                    "/disposal"
                ))
                .toList()
        );
    }

    private SearchDtos.SearchSectionResponse verificationSection(String query) {
        String normalizedQuery = query.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.VerificationCampaignResponse> campaigns = verificationService.listCampaigns().stream()
            .filter(campaign -> campaign.name().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                || campaign.code().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                || campaign.scope().toLowerCase(Locale.ROOT).contains(normalizedQuery))
            .toList();

        return new SearchDtos.SearchSectionResponse(
            "verification",
            "Verification Campaigns",
            "/verification",
            campaigns.size(),
            campaigns.stream()
                .limit(SECTION_LIMIT)
                .map(campaign -> new SearchDtos.SearchItemResponse(
                    campaign.id(),
                    campaign.name(),
                    campaign.code(),
                    "%s • Due %s".formatted(campaign.scope(), campaign.dueDate()),
                    campaign.status(),
                    "/verification"
                ))
                .toList()
        );
    }
}
