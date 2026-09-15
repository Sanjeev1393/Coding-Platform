package com.codingplatform.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import org.junit.jupiter.api.Test;

class ExecutionServiceTest {

    private final ExecutionService executionService = new ExecutionService();

    @Test
    void shouldReturnMockSuccessResponse() {
        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", "1 2");

        ExecutionResponse response = executionService.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertTrue(response.stdout().contains("Mock execution completed"));
        assertTrue(response.stdout().contains("1 2"));
        assertEquals("", response.stderr());
        assertEquals("", response.compilationOutput());
    }

    @Test
    void shouldHandleMissingStandardInput() {
        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", null);

        ExecutionResponse response = executionService.execute(request);

        assertEquals(ExecutionStatus.SUCCESS, response.status());
        assertEquals("Mock execution completed", response.stdout());
    }
}
