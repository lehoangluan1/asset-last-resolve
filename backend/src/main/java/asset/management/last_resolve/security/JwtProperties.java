package asset.management.last_resolve.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security.jwt")
public record JwtProperties(
    String secret,
    long expirationSeconds,
    boolean allowDemoSecret
) {
}
