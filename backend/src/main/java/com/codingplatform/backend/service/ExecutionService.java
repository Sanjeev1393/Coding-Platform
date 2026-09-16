package com.codingplatform.backend.service;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.provider.CodeExecutionProvider;
import org.springframework.stereotype.Service;

@Service
public class ExecutionService {

    private final CodeExecutionProvider codeExecutionProvider;

    public ExecutionService(CodeExecutionProvider codeExecutionProvider) {
        this.codeExecutionProvider = codeExecutionProvider;
    }

    public ExecutionResponse execute(ExecutionRequest request) {
        return codeExecutionProvider.execute(request);
    }
}
