package com.codingplatform.backend.dto;

import java.util.List;

public record FunctionSignature(
        String functionName, List<FunctionParam> params, String returnType) {}
