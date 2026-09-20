package com.codingplatform.backend.provider.jdoodle.dto;

/**
 * Response payload received from the JDoodle Compiler API endpoint {@code POST /v1/execute}.
 *
 * @param output the standard output or error message from compilation/execution
 * @param statusCode the HTTP status code indicator reported by JDoodle (e.g., 200, 401, 429)
 * @param memory peak memory used in kilobytes
 * @param cpuTime total CPU execution time in seconds
 * @param error optional error message provided when an API request fails
 */
public record JdoodleExecuteResponse(
        String output, Integer statusCode, String memory, String cpuTime, String error) {}
