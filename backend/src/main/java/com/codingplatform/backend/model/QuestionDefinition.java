package com.codingplatform.backend.model;

import com.codingplatform.backend.dto.FunctionSignature;
import java.util.List;
import java.util.Map;

/**
 * Encapsulates the domain model of a coding problem, including its driver signature, starter codes,
 * and test suite.
 *
 * @param id unique identifier of the problem (e.g. {@code "two-sum"})
 * @param title human-readable title
 * @param difficulty difficulty level (e.g. {@code "Easy"}, {@code "Medium"}, {@code "Hard"})
 * @param description problem explanation and constraints
 * @param signature method signature details used by harness generators to wrap user code
 * @param sampleInput sample input string representation
 * @param sampleOutput sample output string representation
 * @param starterCodes map of language identifier to initial starter code template
 * @param validatorType validation strategy (e.g. {@code "exact"} or {@code "unordered_array"})
 * @param testCases the full suite of visible and hidden test cases
 */
public record QuestionDefinition(
        String id,
        String title,
        String difficulty,
        String description,
        FunctionSignature signature,
        String sampleInput,
        String sampleOutput,
        Map<String, String> starterCodes,
        String validatorType,
        List<TestCase> testCases) {

    /**
     * Convenience constructor initializing an Easy problem with default empty descriptions and
     * empty starter codes map.
     *
     * @param id problem identifier
     * @param title human-readable problem title
     * @param signature method signature
     * @param sampleInput sample input string
     * @param validatorType validation strategy
     * @param testCases suite of test cases
     */
    public QuestionDefinition(
            String id,
            String title,
            FunctionSignature signature,
            String sampleInput,
            String validatorType,
            List<TestCase> testCases) {
        this(id, title, "Easy", "", signature, sampleInput, "", Map.of(), validatorType, testCases);
    }
}
