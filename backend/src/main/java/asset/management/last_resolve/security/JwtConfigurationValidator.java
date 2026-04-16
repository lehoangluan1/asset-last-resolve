package asset.management.last_resolve.security;

import org.springframework.stereotype.Component;

@Component
public class JwtConfigurationValidator {

    private static final String DEMO_SECRET = "change-this-demo-jwt-secret-to-a-long-random-value-1234567890";

    public JwtConfigurationValidator(JwtProperties properties) {
        String secret = properties.secret() == null ? "" : properties.secret().trim();
        if (!properties.allowDemoSecret() && (secret.isBlank() || DEMO_SECRET.equals(secret))) {
            throw new IllegalStateException(
                "JWT_SECRET must be overridden when app.security.jwt.allow-demo-secret is false"
            );
        }
    }
}
