package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum VerificationResult implements ApiValueEnum {
    MATCHED("matched"),
    DISCREPANCY("discrepancy"),
    PENDING("pending");

    private final String value;

    VerificationResult(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static VerificationResult fromValue(String value) {
        return EnumLookup.fromValue(VerificationResult.class, value);
    }
}
