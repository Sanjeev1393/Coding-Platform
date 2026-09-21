package com.codingplatform.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Global OpenAPI 3 metadata configuration for Swagger UI.
 *
 * <p>Swagger UI is accessible at {@code /swagger-ui.html}.<br>
 * The raw OpenAPI JSON spec is available at {@code /v3/api-docs}.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI codingPlatformOpenAPI() {
        return new OpenAPI()
                .info(
                        new Info()
                                .title("Coding Platform API")
                                .description(
                                        """
                                        REST API for the Coding Platform — an online judge that allows \
                                        candidates to write, run, and submit code solutions against \
                                        automated test suites.

                                        **Key capabilities:**
                                        - Run code against a single input (experimentation mode)
                                        - Submit a full solution for judging against visible + hidden tests
                                        """)
                                .version("v1.0")
                                .contact(
                                        new Contact()
                                                .name("Coding Platform")
                                                .url(
                                                        "https://github.com/Sanjeev1393/Coding-Platform"))
                                .license(
                                        new License()
                                                .name("MIT License")
                                                .url("https://opensource.org/licenses/MIT")))
                .servers(
                        List.of(
                                new Server()
                                        .url("http://localhost:8080")
                                        .description("Local development server"),
                                new Server()
                                        .url("https://your-service.onrender.com")
                                        .description("Production server (Render)")));
    }
}
