package com.codingplatform.backend.dto;

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
public record EvaluationResult(
        ExecutionStatus status,
        int passed,
        int total,
        long totalExecutionTimeMs,
        long maxMemoryKb,
        String errorMessage,
        List<TestCaseResult> testCases) {}
