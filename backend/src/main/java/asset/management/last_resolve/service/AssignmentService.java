package asset.management.last_resolve.service;

import asset.management.last_resolve.dto.CommonDtos;
import asset.management.last_resolve.dto.WorkflowDtos;
import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.mapper.WorkflowMapper;
import asset.management.last_resolve.repository.AssignmentRepository;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final WorkflowMapper workflowMapper;
    private final PageResponseFactory pageResponseFactory;
    private final CurrentUserService currentUserService;
    private final AuthorizationService authorizationService;

    @Transactional(readOnly = true)
    public CommonDtos.PageResponse<WorkflowDtos.AssignmentResponse> list(String search, String type, int page, int size) {
        AppUser currentUser = currentUserService.currentUser();
        String normalizedSearch = search == null ? "" : search.toLowerCase(Locale.ROOT);
        List<WorkflowDtos.AssignmentResponse> items = assignmentRepository.findAll().stream()
            .filter(assignment -> authorizationService.canViewAssignment(currentUser, assignment))
            .filter(assignment -> normalizedSearch.isBlank()
                || assignment.getAsset().getName().toLowerCase(Locale.ROOT).contains(normalizedSearch)
                || assignment.getAsset().getCode().toLowerCase(Locale.ROOT).contains(normalizedSearch))
            .filter(assignment -> type == null || type.isBlank() || type.equalsIgnoreCase("all")
                || assignment.getAssignmentType().getValue().equalsIgnoreCase(type))
            .sorted(Comparator.comparing(Assignment::getEffectiveDate).reversed())
            .map(workflowMapper::toAssignmentResponse)
            .toList();
        return pageResponseFactory.create(items, page, size);
    }
}
