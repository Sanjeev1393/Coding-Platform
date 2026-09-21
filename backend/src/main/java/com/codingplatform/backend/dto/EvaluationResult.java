package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Aggregate evaluation outcome returned by the judging engine after running a candidate submission.
 *
 * @param status overall verdict (e.g. {@code SUCCESS}, {@code WRONG_ANSWER}, {@code
 *     COMPILATION_ERROR})
 * @param passed count of test cases that matched expected output
 * @param total total number of test cases evaluated
 * @param totalExecutionTimeMs cumulative wall-clock execution time across all evaluated cases in
 *     milliseconds
 * @param maxMemoryKb peak memory consumption observed among all evaluated test cases in kilobytes
 * @param errorMessage compiler output or runtime exception details if an error occurred, null
 *     otherwise
 * @param testCases granular outcome for each evaluated test case
 */
@Schema(description = "Aggregate evaluation result after judging a submitted solution")
public record EvaluationResult(
        @Schema(description = "Overall verdict of the submission") ExecutionStatus status,
        @Schema(description = "Number of test cases that passed", example = "5") int passed,
        @Schema(description = "Total number of test cases evaluated", example = "5") int total,
        @Schema(
                        description =
                                "Cumulative wall-clock execution time across all test cases in milliseconds",
                        example = "2100")
                long totalExecutionTimeMs,
        @Schema(
                        description =
                                "Peak memory consumption observed across all evaluated test cases in kilobytes",
                        example = "10240")
                long maxMemoryKb,
        @Schema(
                        description =
                                "Compiler output or runtime error details when an error occurred; null on success",
                        nullable = true)
                String errorMessage,
        @Schema(description = "Granular outcome for each evaluated test case")
                List<TestCaseResult> testCases) {}
