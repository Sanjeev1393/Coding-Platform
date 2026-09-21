package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response returned after running code against a single input.
 *
 * @param status outcome status of the execution
 * @param stdout standard output produced by the program
 * @param stderr standard error output produced by the program
 * @param compilationOutput compiler output (populated on compilation errors)
 * @param executionTimeMs wall-clock time taken for execution in milliseconds
 * @param memoryKb memory consumed during execution in kilobytes
 */
@Schema(description = "Result of running user code against a single input")
public record ExecutionResponse(
        @Schema(description = "Outcome status of the execution") ExecutionStatus status,
        @Schema(description = "Standard output produced by the program", example = "[0, 1]")
                String stdout,
        @Schema(
                        description = "Standard error output produced by the program",
                        example = "",
                        nullable = true)
                String stderr,
        @Schema(
                        description =
                                "Compiler output — populated when status is COMPILATION_ERROR",
                        example = "",
                        nullable = true)
                String compilationOutput,
        @Schema(description = "Wall-clock execution time in milliseconds", example = "420")
                long executionTimeMs,
        @Schema(
                        description = "Peak memory consumed during execution in kilobytes",
                        example = "10240")
                long memoryKb) {}
