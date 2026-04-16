package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TransferStatus implements ApiValueEnum {
    PENDING("pending"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    TransferStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TransferStatus fromValue(String value) {
        return EnumLookup.fromValue(TransferStatus.class, value);
    }
}
