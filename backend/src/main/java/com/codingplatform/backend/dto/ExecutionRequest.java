package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request payload for running user code against a single input (the "Run" button).
 *
 * @param language programming language of the submission
 * @param sourceCode the user's source code
 * @param stdin optional raw standard input to pass to the program
 * @param signature optional function signature used by the platform harness for structured
 *     execution
 * @param sampleInput optional pre-formatted sample input string
 */
@Schema(description = "Request payload for running user code against a single input")
public record ExecutionRequest(
        @Schema(
                        description = "Programming language of the submission",
                        allowableValues = {"java", "javascript", "python"},
                        example = "java")
                @NotBlank(message = "Language is required")
                @Pattern(
                        regexp = "java|javascript|python",
                        message = "Supported languages are java, javascript and python")
                String language,
        @Schema(
                        description = "The user's complete source code",
                        example =
                                "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0,1}; } }")
                @NotBlank(message = "Source code is required")
                String sourceCode,
        @Schema(
                        description =
                                "Raw standard input passed to the program (newline-separated)",
                        example = "2\n[2,7,11,15]\n9",
                        nullable = true)
                String stdin,
        @Schema(
                        description =
                                "Optional function signature used by the platform harness for structured execution",
                        nullable = true)
                FunctionSignature signature,
        @Schema(description = "Optional pre-formatted sample input string", nullable = true)
                String sampleInput) {

    public ExecutionRequest(String language, String sourceCode, String stdin) {
        this(language, sourceCode, stdin, null, null);
    }
}
