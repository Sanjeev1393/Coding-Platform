package com.codingplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ExecutionRequest(
        @NotBlank(message = "Language is required")
                @Pattern(
                        regexp = "java|javascript|python",
                        message = "Supported languages are java, javascript and python")
                String language,
        @NotBlank(message = "Source code is required") String sourceCode,
        String stdin) {}
