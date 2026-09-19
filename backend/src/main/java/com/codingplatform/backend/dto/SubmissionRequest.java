package com.codingplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * Request payload for submitting a candidate solution to the judging engine.
 *
 * @param questionId the question identifier being solved (e.g. {@code "two-sum"})
 * @param language programming language of the submission (e.g. {@code "java"})
 * @param sourceCode candidate's source code to evaluate
 */
public record SubmissionRequest(
        @NotBlank(message = "Question ID is required") String questionId,
        @NotBlank(message = "Language is required")
                @Pattern(
                        regexp = "java|javascript|python",
                        message = "Supported languages are java, javascript and python")
                String language,
        @NotBlank(message = "Source code is required") String sourceCode) {}
