package com.codingplatform.backend.provider.harness;

/**
 * Represents a source code file generated or prepared for code execution.
 *
 * @param name the file name (e.g., "Main.java", "Main", "solution.py")
 * @param content the source code text content
 */
public record SourceFile(String name, String content) {}
