package com.codingplatform.backend.provider.piston.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PistonExecuteResponse(
        String language, String version, PistonStageResult run, PistonStageResult compile) {}
