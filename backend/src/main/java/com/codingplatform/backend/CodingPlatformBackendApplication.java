package com.codingplatform.backend;

import com.codingplatform.backend.provider.jdoodle.JdoodleProperties;
import com.codingplatform.backend.provider.piston.PistonProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

/**
 * Main Spring Boot entry point for the Coding Platform backend application.
 *
 * <p>Enables configuration properties for both execution providers:
 *
 * <ul>
 *   <li>{@link PistonProperties}: local container sandbox configuration.
 *   <li>{@link JdoodleProperties}: cloud-based JDoodle compiler configuration.
 * </ul>
 */
@SpringBootApplication
@EnableConfigurationProperties({PistonProperties.class, JdoodleProperties.class})
public class CodingPlatformBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodingPlatformBackendApplication.class, args);
    }
}
