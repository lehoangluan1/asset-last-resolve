package asset.management.last_resolve.mapper;

import asset.management.last_resolve.dto.ReferenceDtos;
import asset.management.last_resolve.entity.AssetCategory;
import asset.management.last_resolve.entity.Department;
import asset.management.last_resolve.entity.Location;
import org.springframework.stereotype.Component;

@Component
public class ReferenceMapper {

    public ReferenceDtos.DepartmentResponse toDepartmentResponse(Department department) {
        return new ReferenceDtos.DepartmentResponse(
            MapperUtils.uuid(department.getId()),
            department.getName(),
            department.getCode(),
            department.getManagerUser() == null ? null : MapperUtils.uuid(department.getManagerUser().getId()),
            department.getManagerUser() == null ? null : department.getManagerUser().getFullName(),
            department.getLocation(),
            department.getEmployeeCount()
        );
    }

    public ReferenceDtos.LocationResponse toLocationResponse(Location location) {
        return new ReferenceDtos.LocationResponse(
            MapperUtils.uuid(location.getId()),
            location.getName(),
            location.getBuilding(),
            location.getFloor(),
            location.getRoom()
        );
    }

    public ReferenceDtos.AssetCategoryResponse toCategoryResponse(AssetCategory category) {
        return new ReferenceDtos.AssetCategoryResponse(
            MapperUtils.uuid(category.getId()),
            category.getName(),
            category.getCode(),
            category.getDescription(),
            category.getParent() == null ? null : MapperUtils.uuid(category.getParent().getId()),
            category.isBorrowableByDefault(),
            category.isRequiresSerial(),
            category.isRequiresVerification(),
            category.getStatus().getValue()
        );
    }
}
