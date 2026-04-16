package asset.management.last_resolve.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum DisposalStatus implements ApiValueEnum {
    PROPOSED("proposed"),
    UNDER_REVIEW("under-review"),
    APPROVED("approved"),
    REJECTED("rejected"),
    DEFERRED("deferred"),
    COMPLETED("completed");

    private final String value;

    DisposalStatus(String value) {
        this.value = value;
    }

    @Override
    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static DisposalStatus fromValue(String value) {
        return EnumLookup.fromValue(DisposalStatus.class, value);
    }
}
