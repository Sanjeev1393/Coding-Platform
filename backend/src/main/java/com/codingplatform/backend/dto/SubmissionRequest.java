package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request payload for submitting a candidate solution to the judging engine.
 *
 * @param questionId the question identifier being solved (e.g. {@code "two-sum"})
 * @param language programming language of the submission (e.g. {@code "java"})
 * @param sourceCode candidate's source code to evaluate
 */
@Schema(description = "Request payload for submitting a candidate solution to the judging engine")
public record SubmissionRequest(
        @Schema(description = "The question identifier being solved", example = "two-sum")
                @NotBlank(message = "Question ID is required")
                String questionId,
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
                        description = "The candidate's complete source code to evaluate",
                        example =
                                "class Solution { public int[] twoSum(int[] nums, int target) { return new int[]{0,1}; } }")
                @NotBlank(message = "Source code is required")
                String sourceCode) {}
