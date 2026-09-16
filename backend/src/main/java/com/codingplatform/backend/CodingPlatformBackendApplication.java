package com.codingplatform.backend;

import com.codingplatform.backend.provider.piston.PistonProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(PistonProperties.class)
public class CodingPlatformBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(CodingPlatformBackendApplication.class, args);
    }
}
