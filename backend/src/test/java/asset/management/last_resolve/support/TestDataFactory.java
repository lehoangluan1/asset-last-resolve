package asset.management.last_resolve.support;

import asset.management.last_resolve.entity.AppUser;
import asset.management.last_resolve.entity.Asset;
import asset.management.last_resolve.entity.AssetCategory;
import asset.management.last_resolve.entity.Assignment;
import asset.management.last_resolve.entity.AuditLog;
import asset.management.last_resolve.entity.BaseEntity;
import asset.management.last_resolve.entity.BorrowRequest;
import asset.management.last_resolve.entity.CreatedEntity;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.Discrepancy;
import asset.management.last_resolve.entity.Location;
import asset.management.last_resolve.entity.MaintenanceRecord;
import asset.management.last_resolve.entity.VerificationCampaign;
import asset.management.last_resolve.entity.VerificationTask;
import asset.management.last_resolve.enums.AssetCondition;
import asset.management.last_resolve.enums.AssignmentType;
import asset.management.last_resolve.enums.BorrowStatus;
import asset.management.last_resolve.enums.CampaignStatus;
import asset.management.last_resolve.enums.DiscrepancySeverity;
import asset.management.last_resolve.enums.DiscrepancyStatus;
import asset.management.last_resolve.enums.DiscrepancyType;
import asset.management.last_resolve.enums.LifecycleStatus;
import asset.management.last_resolve.enums.MaintenanceStatus;
import asset.management.last_resolve.enums.Priority;
import asset.management.last_resolve.enums.ReferenceStatus;
import asset.management.last_resolve.enums.TechCondition;
import asset.management.last_resolve.enums.TransferStatus;
import asset.management.last_resolve.enums.UserRole;
import asset.management.last_resolve.enums.UserStatus;
import asset.management.last_resolve.enums.VerificationResult;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

public final class TestDataFactory {

    private TestDataFactory() {
    }

    public static Department department(String code) {
        Department department = stamp(new Department());
        department.setName(code + " Department");
        department.setCode(code);
        department.setLocation(code + " Building");
        department.setEmployeeCount(10);
        return department;
    }

    public static AppUser user(UserRole role, Department department, String username) {
        AppUser user = stamp(new AppUser());
        user.setUsername(username);
        user.setFullName(username + " User");
        user.setEmail(username + "@example.com");
        user.setPasswordHash("encoded-password");
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setDepartment(department);
        user.setActive(true);
        return user;
    }

    public static Asset asset(Department department, AppUser assignee, boolean borrowable, LifecycleStatus lifecycleStatus) {
        Asset asset = stamp(new Asset());
        asset.setCode("AST-" + shortId(asset.getId()));
        asset.setName("Asset " + shortId(asset.getId()));
        asset.setDescription("Test asset");
        asset.setCategory(category("LAP"));
        asset.setDepartment(department);
        asset.setAssignedToUser(assignee);
        asset.setLocation(location("HQ"));
        asset.setCondition(AssetCondition.GOOD);
        asset.setLifecycleStatus(lifecycleStatus);
        asset.setBrand("Brand");
        asset.setModel("Model");
        asset.setSerialNumber("SER-" + shortId(asset.getId()));
        asset.setBorrowable(borrowable);
        return asset;
    }

    public static Assignment assignment(Asset asset, AppUser toUser, Department toDepartment) {
        Assignment assignment = stamp(new Assignment());
        assignment.setAsset(asset);
        assignment.setAssignmentType(AssignmentType.PERMANENT);
        assignment.setToUser(toUser);
        assignment.setToDepartment(toDepartment);
        assignment.setStatus(TransferStatus.COMPLETED);
        assignment.setEffectiveDate(LocalDate.now());
        assignment.setCreatedBy(toUser);
        return assignment;
    }

    public static BorrowRequest borrowRequest(Asset asset, AppUser requester, BorrowStatus status) {
        BorrowRequest request = stamp(new BorrowRequest());
        request.setAsset(asset);
        request.setRequester(requester);
        request.setDepartment(requester.getDepartment());
        request.setBorrowDate(LocalDate.now().plusDays(1));
        request.setReturnDate(LocalDate.now().plusDays(3));
        request.setPurpose("Demo");
        request.setNotes("Notes");
        request.setStatus(status);
        return request;
    }

    public static MaintenanceRecord maintenanceRecord(Asset asset, AppUser technician, MaintenanceStatus status) {
        MaintenanceRecord record = stamp(new MaintenanceRecord());
        record.setAsset(asset);
        record.setAssignedToUser(technician);
        record.setCreatedBy(technician);
        record.setMaintenanceType("Inspection");
        record.setDescription("Inspect asset");
        record.setTechCondition(TechCondition.GOOD);
        record.setStatus(status);
        record.setPriority(Priority.NORMAL);
        record.setScheduledDate(LocalDate.now().plusDays(1));
        record.setCost(BigDecimal.ZERO);
        record.setNotes("Notes");
        return record;
    }

    public static VerificationCampaign campaign(String code, CampaignStatus status, Set<Department> departments, AppUser createdBy) {
        VerificationCampaign campaign = stamp(new VerificationCampaign());
        campaign.setCode(code);
        campaign.setName(code + " Campaign");
        campaign.setYear(2026);
        campaign.setScope("Test Scope");
        campaign.setStatus(status);
        campaign.setStartDate(LocalDate.now().minusDays(2));
        campaign.setDueDate(LocalDate.now().plusDays(5));
        campaign.setCreatedBy(createdBy);
        campaign.setDepartments(departments);
        return campaign;
    }

    public static VerificationTask verificationTask(VerificationCampaign campaign, Asset asset, AppUser assignedTo) {
        VerificationTask task = stamp(new VerificationTask());
        task.setCampaign(campaign);
        task.setAsset(asset);
        task.setAssignedToUser(assignedTo);
        task.setExpectedLocation(asset.getLocation());
        task.setExpectedCondition(asset.getCondition());
        task.setExpectedAssignee(asset.getAssignedToUser());
        task.setResult(VerificationResult.PENDING);
        task.setNotes("Pending verification");
        return task;
    }

    public static Discrepancy discrepancy(VerificationCampaign campaign, Asset asset, AppUser createdBy, DiscrepancyStatus status) {
        Discrepancy discrepancy = stamp(new Discrepancy());
        discrepancy.setCampaign(campaign);
        discrepancy.setTask(verificationTask(campaign, asset, createdBy));
        discrepancy.setAsset(asset);
        discrepancy.setType(DiscrepancyType.LOCATION);
        discrepancy.setSeverity(DiscrepancySeverity.HIGH);
        discrepancy.setStatus(status);
        discrepancy.setExpectedValue("Expected");
        discrepancy.setObservedValue("Observed");
        discrepancy.setCreatedBy(createdBy);
        return discrepancy;
    }

    public static AuditLog auditLog(String entityType, String entityId, AppUser actorUser) {
        AuditLog log = stamp(new AuditLog());
        log.setActorUser(actorUser);
        log.setActorName(actorUser == null ? "System" : actorUser.getFullName());
        log.setAction("Updated");
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setEntityName("Entity");
        log.setDetails("Details");
        log.setCorrelationId("COR-" + shortId(log.getId()));
        return log;
    }

    public static Location location(String name) {
        Location location = stamp(new Location());
        location.setName(name);
        location.setBuilding("Building A");
        location.setFloor("1");
        location.setRoom("101");
        return location;
    }

    public static AssetCategory category(String code) {
        AssetCategory category = stamp(new AssetCategory());
        category.setName(code + " Category");
        category.setCode(code);
        category.setDescription("Category");
        category.setBorrowableByDefault(true);
        category.setRequiresSerial(true);
        category.setRequiresVerification(true);
        category.setStatus(ReferenceStatus.ACTIVE);
        return category;
    }

    private static <T extends CreatedEntity> T stamp(T entity) {
        entity.setId(UUID.randomUUID());
        entity.setCreatedAt(OffsetDateTime.now());
        if (entity instanceof BaseEntity baseEntity) {
            baseEntity.setUpdatedAt(OffsetDateTime.now());
        }
        return entity;
    }

    private static String shortId(UUID id) {
        return id.toString().substring(0, 8).toUpperCase();
    }
}
