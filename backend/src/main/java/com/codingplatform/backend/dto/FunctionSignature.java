package com.codingplatform.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * Describes the signature of the function the candidate must implement.
 *
 * @param functionName name of the function to implement
 * @param params ordered list of function parameters
 * @param returnType return type of the function
 */
@Schema(description = "Describes the function signature the candidate must implement")
public record FunctionSignature(
        @Schema(description = "Name of the function to implement", example = "twoSum")
                String functionName,
        @Schema(description = "Ordered list of function parameters") List<FunctionParam> params,
        @Schema(description = "Return type of the function", example = "int[]")
                String returnType) {}
