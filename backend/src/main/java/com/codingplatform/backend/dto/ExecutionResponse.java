package com.codingplatform.backend.dto;

public record ExecutionResponse(
        ExecutionStatus status,
        String stdout,
        String stderr,
        String compilationOutput,
        long executionTimeMs,
        long memoryKb) {}
