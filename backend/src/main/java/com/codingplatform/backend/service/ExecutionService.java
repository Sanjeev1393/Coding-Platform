package com.codingplatform.backend.service;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;
import com.codingplatform.backend.dto.ExecutionStatus;
import org.springframework.stereotype.Service;

@Service
public class ExecutionService {

    public ExecutionResponse execute(ExecutionRequest request) {
        String output = "Mock execution completed";

        if (request.stdin() != null && !request.stdin().isBlank()) {
            output += System.lineSeparator() + "Input received: " + request.stdin();
        }

        return new ExecutionResponse(ExecutionStatus.SUCCESS, output, "", "", 15, 2048);
    }
}
