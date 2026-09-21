package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "A single named parameter of a function signature")
public record FunctionParam(
        @Schema(description = "Parameter name", example = "nums") String name,
        @Schema(description = "Parameter type", example = "int[]") String type) {}
