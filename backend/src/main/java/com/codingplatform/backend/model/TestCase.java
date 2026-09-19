package com.codingplatform.backend.model;

import java.util.Map;

/**
 * Represents a single test case input and expected output for a programming question.
 *
 * @param id unique identifier of the test case (e.g. {@code "case-1"})
 * @param name human-readable display label (e.g. {@code "Example 1"} or {@code "Hidden Case 1"})
 * @param input standard input formatted for the driver harness
 * @param expectedOutput expected string output produced by standard output
 * @param hidden true if this is a private test case whose input/output must not be leaked to the
 *     client
 * @param inputs optional map of named parameter inputs for display and structured evaluation
 * @param explanation optional reasoning explaining the test case example
 */
public record TestCase(
        String id,
        String name,
        String input,
        String expectedOutput,
        boolean hidden,
        Map<String, Object> inputs,
        String explanation) {

    /**
     * Convenience constructor for test cases that do not provide named input parameter maps or
     * custom explanation strings.
     *
     * @param id unique identifier of the test case
     * @param name human-readable display label
     * @param input standard input formatted for the driver harness
     * @param expectedOutput expected output string
     * @param hidden true if hidden on server-side
     */
    public TestCase(String id, String name, String input, String expectedOutput, boolean hidden) {
        this(id, name, input, expectedOutput, hidden, null, null);
    }
}
