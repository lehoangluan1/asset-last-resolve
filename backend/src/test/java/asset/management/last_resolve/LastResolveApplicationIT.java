package asset.management.last_resolve;

import static org.assertj.core.api.Assertions.assertThat;

import asset.management.last_resolve.support.IntegrationTestSupport;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

class LastResolveApplicationIT extends IntegrationTestSupport {

    @Autowired
    private ApplicationContext applicationContext;

    @Test
    void contextLoadsAgainstContainerizedPostgres() {
        assertThat(applicationContext).isNotNull();
        assertThat(applicationContext.getBeanDefinitionCount()).isGreaterThan(0);
    }
}
