package com.codingplatform.backend.provider.jdoodle.dto;

/**
 * Payload sent to the JDoodle Compiler API endpoint {@code POST /v1/execute}.
 *
 * @param clientId the JDoodle client ID
 * @param clientSecret the JDoodle client secret
 * @param script the source code to compile and execute
 * @param stdin standard input provided to the executing process
 * @param language programming language identifier recognized by JDoodle (e.g., 'java')
 * @param versionIndex index of the language compiler version in JDoodle
 */
public record JdoodleExecuteRequest(
        String clientId,
        String clientSecret,
        String script,
        String stdin,
        String language,
        String versionIndex) {}
