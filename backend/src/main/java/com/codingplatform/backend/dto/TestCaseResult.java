package com.codingplatform.backend.dto;

/**
 * Represents the evaluation outcome of an individual test case.
 *
 * <p>Anti-Cheating Design: If {@code hidden == true}, fields {@code input}, {@code expectedOutput},
 * and {@code actualOutput} are explicitly set to null by the evaluation engine before serializing
 * over the network.
 *
 * @param id test case identifier (e.g. {@code "case-1"})
 * @param name display name (e.g. {@code "Example 1"})
 * @param status outcome status (e.g. {@code "PASSED"}, {@code "FAILED"}, {@code "RUNTIME_ERROR"})
 * @param hidden whether this is a hidden server-only test case
 * @param input raw input (null if hidden)
 * @param expectedOutput expected output (null if hidden)
 * @param actualOutput stdout returned by candidate's solution (null if hidden)
 * @param executionTimeMs time taken to run this single test case in milliseconds
 */
public record TestCaseResult(
        String id,
        String name,
        String status,
        boolean hidden,
        String input,
        String expectedOutput,
        String actualOutput,
        long executionTimeMs) {}
