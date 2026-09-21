package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** Defines the standard lifecycle and outcome statuses for code execution and evaluation. */
@Schema(description = "Outcome status of a code execution or evaluation run")
public enum ExecutionStatus {
    /** Execution completed normally and output satisfied all test case requirements. */
    @Schema(description = "Execution completed and output matched all requirements")
    SUCCESS,

    /**
     * Execution completed normally without crashes, but output differed from the expected answer.
     */
    @Schema(description = "Execution completed but output did not match expected answer")
    WRONG_ANSWER,

    /** Code failed to compile into bytecode or binary. */
    @Schema(description = "Code failed to compile")
    COMPILATION_ERROR,

    /**
     * Code compiled, but terminated abruptly due to an uncaught exception or non-zero exit code.
     */
    @Schema(
            description =
                    "Code compiled but terminated with an uncaught exception or non-zero exit")
    RUNTIME_ERROR,

    /** Code execution exceeded the allowable wall-clock time limit. */
    @Schema(description = "Code execution exceeded the allowed time limit")
    TIME_LIMIT_EXCEEDED,

    /** An internal platform error occurred (e.g. sandbox daemon unreachable). */
    @Schema(description = "Internal platform error (e.g. sandbox unreachable)")
    INTERNAL_ERROR
}
