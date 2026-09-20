package com.codingplatform.backend.provider;

import static org.assertj.core.api.Assertions.assertThat;

import com.codingplatform.backend.provider.harness.HarnessGenerator;
import com.codingplatform.backend.provider.jdoodle.JdoodleExecutionProvider;
import com.codingplatform.backend.provider.jdoodle.JdoodleProperties;
import com.codingplatform.backend.provider.piston.PistonExecutionProvider;
import com.codingplatform.backend.provider.piston.PistonProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class ExecutionProviderSwitchingTest {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner()
                    .withBean(HarnessGenerator.class)
                    .withBean(
                            PistonProperties.class,
                            () ->
                                    new PistonProperties(
                                            "http://127.0.0.1:2000",
                                            "java",
                                            "15.0.2",
                                            "Main",
                                            2000,
                                            5000,
                                            3000))
                    .withBean(
                            JdoodleProperties.class,
                            () ->
                                    new JdoodleProperties(
                                            "https://api.jdoodle.com",
                                            "test-id",
                                            "test-secret",
                                            "java",
                                            "4",
                                            5000,
                                            15000))
                    .withUserConfiguration(
                            PistonExecutionProvider.class, JdoodleExecutionProvider.class);

    @Test
    void shouldSelectPistonByDefaultWhenPropertyIsMissing() {
        contextRunner.run(
                context -> {
                    assertThat(context).hasSingleBean(CodeExecutionProvider.class);
                    assertThat(context)
                            .getBean(CodeExecutionProvider.class)
                            .isInstanceOf(PistonExecutionProvider.class);
                });
    }

    @Test
    void shouldSelectPistonWhenConfiguredExplicitly() {
        contextRunner
                .withPropertyValues("execution.provider=piston")
                .run(
                        context -> {
                            assertThat(context).hasSingleBean(CodeExecutionProvider.class);
                            assertThat(context)
                                    .getBean(CodeExecutionProvider.class)
                                    .isInstanceOf(PistonExecutionProvider.class);
                        });
    }

    @Test
    void shouldSelectJdoodleWhenConfiguredExplicitly() {
        contextRunner
                .withPropertyValues("execution.provider=jdoodle")
                .run(
                        context -> {
                            assertThat(context).hasSingleBean(CodeExecutionProvider.class);
                            assertThat(context)
                                    .getBean(CodeExecutionProvider.class)
                                    .isInstanceOf(JdoodleExecutionProvider.class);
                        });
    }
}
