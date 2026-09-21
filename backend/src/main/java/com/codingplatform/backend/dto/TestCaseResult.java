package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Represents the evaluation outcome of an individual test case.
 *
 * <p>Anti-Cheating Design: If {@code hidden == true}, fields {@code input}, {@code expectedOutput},
 * and {@code actualOutput} are explicitly set to null by the evaluation engine before serializing
 * over the network.
 *
 * @param id test case identifier (e.g. {@code "case-1"})
 * @param name display name (e.g. {@code "Example 1"})
 * @param status outcome status (e.g. {@code "PASSED"}, {@code "FAILED"}, {@code "RUNTIME_ERROR"})
 * @param hidden whether this is a hidden server-only test case
 * @param input raw input (null if hidden)
 * @param expectedOutput expected output (null if hidden)
 * @param actualOutput stdout returned by candidate's solution (null if hidden)
 * @param executionTimeMs time taken to run this single test case in milliseconds
 */
@Schema(description = "Evaluation outcome of a single test case")
public record TestCaseResult(
        @Schema(description = "Test case identifier", example = "tc-1") String id,
        @Schema(description = "Human-readable display name", example = "Basic case") String name,
        @Schema(
                        description = "Outcome of this test case",
                        allowableValues = {
                            "PASSED",
                            "FAILED",
                            "RUNTIME_ERROR",
                            "TIME_LIMIT_EXCEEDED"
                        },
                        example = "PASSED")
                String status,
        @Schema(
                        description =
                                "Whether this is a hidden test case. When true, input/expectedOutput/actualOutput are null.")
                boolean hidden,
        @Schema(
                        description = "Raw input for this test case — null when hidden=true",
                        example = "[2,7,11,15], 9",
                        nullable = true)
                String input,
        @Schema(
                        description = "Expected output — null when hidden=true",
                        example = "[0,1]",
                        nullable = true)
                String expectedOutput,
        @Schema(
                        description =
                                "Actual stdout from the candidate's solution — null when hidden=true",
                        example = "[0,1]",
                        nullable = true)
                String actualOutput,
        @Schema(
                        description =
                                "Time taken to execute this individual test case in milliseconds",
                        example = "420")
                long executionTimeMs) {}
