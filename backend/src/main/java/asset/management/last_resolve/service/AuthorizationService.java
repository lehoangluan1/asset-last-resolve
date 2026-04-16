package asset.management.last_resolve.service;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.entity.AuditLog;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.DisposalRequest;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.exception.ForbiddenOperationException;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {

    public boolean isOneOf(AppUser user, UserRole... roles) {
        for (UserRole role : roles) {
            if (user.getRole() == role) {
                return true;
            }
        }
        return false;
    }

    public void requireOneOf(AppUser user, UserRole... roles) {
        if (!isOneOf(user, roles)) {
            throw new ForbiddenOperationException("You do not have permission to perform this action");
        }
    }

    public boolean isDepartmentScoped(AppUser user, UUID departmentId) {
        return user.getDepartment().getId().equals(departmentId);
    }

    public boolean canManageUsers(AppUser user) {
        return user.getRole() == UserRole.ADMIN;
    }

    public boolean canManageAssets(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER);
    }

    public boolean canRequestBorrow(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.MANAGER, UserRole.EMPLOYEE);
    }

    public boolean canViewAsset(AppUser user, Asset asset) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.AUDITOR, UserRole.TECHNICIAN)) {
            return true;
        }
        if (user.getRole() == UserRole.MANAGER) {
            return isDepartmentScoped(user, asset.getDepartment().getId());
        }
        return (asset.getAssignedToUser() != null && asset.getAssignedToUser().getId().equals(user.getId()))
            || (asset.isBorrowable() && isDepartmentScoped(user, asset.getDepartment().getId()));
    }

    public boolean canViewAssignment(AppUser user, Assignment assignment) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER)) {
            return true;
        }
        if (user.getRole() == UserRole.MANAGER) {
            return isDepartmentScoped(user, assignment.getToDepartment().getId());
        }
        return assignment.getToUser().getId().equals(user.getId());
    }

    public boolean canViewBorrowRequest(AppUser user, BorrowRequest request) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.AUDITOR)) {
            return true;
        }
        if (user.getRole() == UserRole.MANAGER) {
            return isDepartmentScoped(user, request.getDepartment().getId());
        }
        return request.getRequester().getId().equals(user.getId());
    }

    public boolean canApproveBorrowRequest(AppUser user, BorrowRequest request) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER)) {
            return true;
        }
        return user.getRole() == UserRole.MANAGER && isDepartmentScoped(user, request.getDepartment().getId());
    }

    public boolean canViewMaintenance(AppUser user, MaintenanceRecord record) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER)) {
            return true;
        }
        if (user.getRole() == UserRole.TECHNICIAN) {
            return record.getAssignedToUser().getId().equals(user.getId()) || isDepartmentScoped(user, record.getAsset().getDepartment().getId());
        }
        if (user.getRole() == UserRole.MANAGER) {
            return isDepartmentScoped(user, record.getAsset().getDepartment().getId());
        }
        return record.getAsset().getAssignedToUser() != null && record.getAsset().getAssignedToUser().getId().equals(user.getId());
    }

    public boolean canManageMaintenance(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.TECHNICIAN);
    }

    public boolean canViewDiscrepancy(AppUser user, Discrepancy discrepancy) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.AUDITOR)) {
            return true;
        }
        return user.getRole() == UserRole.MANAGER && isDepartmentScoped(user, discrepancy.getAsset().getDepartment().getId());
    }

    public boolean canManageDiscrepancy(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.AUDITOR);
    }

    public boolean canViewDisposal(AppUser user, DisposalRequest request) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER)) {
            return true;
        }
        return user.getRole() == UserRole.MANAGER && isDepartmentScoped(user, request.getAsset().getDepartment().getId());
    }

    public boolean canManageDisposal(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.MANAGER);
    }

    public boolean canManageVerification(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.AUDITOR);
    }

    public boolean canViewVerificationCampaign(AppUser user, VerificationCampaign campaign) {
        if (canManageVerification(user)) {
            return true;
        }
        return user.getRole() == UserRole.MANAGER
            && campaign.getDepartments().stream().anyMatch(department -> department.getId().equals(user.getDepartment().getId()));
    }

    public boolean canViewReports(AppUser user) {
        return isOneOf(user, UserRole.ADMIN, UserRole.OFFICER, UserRole.AUDITOR, UserRole.MANAGER);
    }

    public boolean canViewAuditLog(AppUser user, AuditLog log, Set<String> visibleEntityIds) {
        if (isOneOf(user, UserRole.ADMIN, UserRole.OFFICER)) {
            return true;
        }
        if ("User".equalsIgnoreCase(log.getEntityType()) && log.getEntityId().equals(user.getId().toString())) {
            return true;
        }
        if (log.getActorUser() != null && log.getActorUser().getId().equals(user.getId())) {
            return true;
        }
        return visibleEntityIds.contains(log.getEntityId());
    }
}
