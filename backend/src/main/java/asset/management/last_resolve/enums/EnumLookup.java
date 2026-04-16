package asset.management.last_resolve.enums;

public final class EnumLookup {

    private EnumLookup() {
    }

    public static <T extends Enum<T> & ApiValueEnum> T fromValue(Class<T> enumType, String value) {
        for (T candidate : enumType.getEnumConstants()) {
            if (candidate.getValue().equalsIgnoreCase(value)) {
                return candidate;
            }
        }
        throw new IllegalArgumentException("Unsupported value '%s' for %s".formatted(value, enumType.getSimpleName()));
    }
}
