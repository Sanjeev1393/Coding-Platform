package com.codingplatform.backend.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link OutputComparator} testing exact match, quote-insensitive string match, and
 * unordered array set equivalence.
 */
class OutputComparatorTest {

    private OutputComparator comparator;

    @BeforeEach
    void setUp() {
        comparator = new OutputComparator();
    }

    @Test
    void shouldMatchExactStringsWithWhitespaceNormalization() {
        assertTrue(comparator.compare("hello\n", "hello", "exact"));
        assertTrue(comparator.compare("  42  ", "42", "exact"));
        assertFalse(comparator.compare("hello", "world", "exact"));
    }

    @Test
    void shouldMatchStringsWithQuotes() {
        assertTrue(comparator.compare("\"hello\"", "\"hello\"", "exact"));
        assertTrue(comparator.compare("\"hello\"", "hello", "exact"));
        assertTrue(comparator.compare("hello", "\"hello\"", "exact"));
    }

    @Test
    void shouldMatchUnorderedArraysRegardlessOfOrder() {
        assertTrue(comparator.compare("[0, 1]", "[1, 0]", "unordered_array"));
        assertTrue(comparator.compare("[ 1, 2 ]", "[2, 1]", "unordered_array"));
        assertFalse(comparator.compare("[0, 1]", "[0, 2]", "unordered_array"));
    }

    @Test
    void shouldRespectExactArrayOrderForExactValidator() {
        assertTrue(comparator.compare("[0, 1]", "[0, 1]", "exact"));
        assertFalse(comparator.compare("[0, 1]", "[1, 0]", "exact"));
    }

    @Test
    void shouldHandleNullGracefully() {
        assertTrue(comparator.compare(null, null, "exact"));
        assertFalse(comparator.compare("out", null, "exact"));
        assertFalse(comparator.compare(null, "out", "exact"));
    }
}
