package com.codingplatform.backend.provider;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.ExecutionResponse;

public interface CodeExecutionProvider {

    ExecutionResponse execute(ExecutionRequest request);
}
