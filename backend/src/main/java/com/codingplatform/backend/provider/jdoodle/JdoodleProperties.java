package com.codingplatform.backend.provider.jdoodle;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Strongly typed configuration properties for the JDoodle execution provider.
 *
 * <p>Values are loaded from {@code jdoodle.*} in application configuration, with secure credentials
 * backed by Windows/host environment variables.
 */
@ConfigurationProperties(prefix = "jdoodle")
public record JdoodleProperties(
        String baseUrl,
        String clientId,
        String clientSecret,
        String defaultLanguage,
        String defaultVersionIndex,
        int connectTimeoutMs,
        int readTimeoutMs) {

    public JdoodleProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "https://api.jdoodle.com";
        }
        if (clientId == null) {
            clientId = "";
        }
        if (clientSecret == null) {
            clientSecret = "";
        }
        if (defaultLanguage == null || defaultLanguage.isBlank()) {
            defaultLanguage = "java";
        }
        if (defaultVersionIndex == null || defaultVersionIndex.isBlank()) {
            defaultVersionIndex = "4";
        }
        if (connectTimeoutMs <= 0) {
            connectTimeoutMs = 5000;
        }
        if (readTimeoutMs <= 0) {
            readTimeoutMs = 15000;
        }
    }
}
