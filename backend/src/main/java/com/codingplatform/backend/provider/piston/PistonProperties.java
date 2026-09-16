package com.codingplatform.backend.provider.piston;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "execution.piston")
public record PistonProperties(
        String baseUrl,
        String language,
        String version,
        String fileName,
        int connectTimeoutMs,
        int readTimeoutMs,
        int runTimeoutMs) {

    public PistonProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "http://127.0.0.1:2000";
        }
        if (language == null || language.isBlank()) {
            language = "java";
        }
        if (version == null || version.isBlank()) {
            version = "15.0.2";
        }
        if (fileName == null || fileName.isBlank()) {
            fileName = "Main";
        }
        if (connectTimeoutMs <= 0) {
            connectTimeoutMs = 2000;
        }
        if (readTimeoutMs <= 0) {
            readTimeoutMs = 5000;
        }
        if (runTimeoutMs <= 0) {
            runTimeoutMs = 6000;
        }
    }
}
