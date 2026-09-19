package com.codingplatform.backend.dto;

/** Defines the standard lifecycle and outcome statuses for code execution and evaluation. */
public enum ExecutionStatus {
    /** Execution completed normally and output satisfied all test case requirements. */
    SUCCESS,
    /**
     * Execution completed normally without crashes, but output differed from the expected answer.
     */
    WRONG_ANSWER,
    /** Code failed to compile into bytecode or binary. */
    COMPILATION_ERROR,
    /**
     * Code compiled, but terminated abruptly due to an uncaught exception or non-zero exit code.
     */
    RUNTIME_ERROR,
    /** Code execution exceeded the allowable wall-clock time limit. */
    TIME_LIMIT_EXCEEDED,
    /** An internal platform error occurred (e.g. sandbox daemon unreachable). */
    INTERNAL_ERROR
}
