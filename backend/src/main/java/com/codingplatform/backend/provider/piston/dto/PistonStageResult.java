package com.codingplatform.backend.provider.piston.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PistonStageResult(
        String stdout,
        String stderr,
        String output,
        Integer code,
        String signal,
        String status,
        String message,
        Long memory,
        @JsonProperty("cpu_time") Long cpuTime,
        @JsonProperty("wall_time") Long wallTime) {}
