package com.codingplatform.backend.config;

import java.util.Arrays;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cross-Origin Resource Sharing (CORS) configuration for the application.
 *
 * <p>Enables external frontend origins (such as Vercel deployments and local Vite dev servers) to
 * interact securely with the backend API endpoints.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(CorsConfig.class);

    private final String[] allowedOrigins;

    public CorsConfig(
            @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
                    String allowedOriginsProperty) {
        String[] parsed =
                Arrays.stream(allowedOriginsProperty.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toArray(String[]::new);

        this.allowedOrigins =
                parsed.length > 0
                        ? parsed
                        : new String[] {"http://localhost:5173", "http://localhost:3000"};

        logger.info("Configured CORS allowed origins: {}", Arrays.toString(this.allowedOrigins));
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .maxAge(3600);
    }

    public String[] getAllowedOrigins() {
        return allowedOrigins.clone();
    }
}
