package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole implements ApiValueEnum {
    ADMIN("admin"),
    OFFICER("officer"),
    MANAGER("manager"),
    EMPLOYEE("employee"),
    TECHNICIAN("technician"),
    AUDITOR("auditor");

    private final String value;

    UserRole(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static UserRole fromValue(String value) {
        return EnumLookup.fromValue(UserRole.class, value);
    }
}
