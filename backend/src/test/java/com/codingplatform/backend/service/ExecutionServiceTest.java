package com.codingplatform.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import com.codingplatform.backend.provider.CodeExecutionProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ExecutionServiceTest {

    private CodeExecutionProvider codeExecutionProvider;
    private ExecutionService executionService;

    @BeforeEach
    void setUp() {
        codeExecutionProvider = mock(CodeExecutionProvider.class);
        executionService = new ExecutionService(codeExecutionProvider);
    }

    @Test
    void shouldDelegateExecutionToCodeExecutionProvider() {
        ExecutionRequest request = new ExecutionRequest("java", "public class Main {}", "1 2");
        ExecutionResponse expectedResponse =
                new ExecutionResponse(ExecutionStatus.SUCCESS, "output result", "", "", 100, 2048);

        when(codeExecutionProvider.execute(request)).thenReturn(expectedResponse);

        ExecutionResponse actualResponse = executionService.execute(request);

        assertEquals(expectedResponse, actualResponse);
        verify(codeExecutionProvider).execute(request);
    }
}
