package com.codingplatform.backend.dto;

import com.codingplatform.backend.model.QuestionDefinition;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

/**
 * Public response DTO exposing question metadata, starter code templates, and visible example test
 * cases. Hidden test cases are strictly filtered out to prevent leaking private evaluation data to
 * clients.
 */
@Schema(
        description =
                "Question metadata, starter code templates, and visible test cases exposed to the candidate."
                        + " Hidden test cases are filtered out.")
public record QuestionResponse(
        @Schema(description = "Unique question identifier", example = "two-sum") String id,
        @Schema(description = "Human-readable question title", example = "Two Sum") String title,
        @Schema(
                        description = "Difficulty level",
                        allowableValues = {"Easy", "Medium", "Hard"},
                        example = "Easy")
                String difficulty,
        @Schema(description = "Full problem description and constraints") String description,
        @Schema(description = "Function signature the candidate must implement")
                FunctionSignature signature,
        @Schema(description = "Sample input string", example = "2\n[2,7,11,15]\n9")
                String sampleInput,
        @Schema(description = "Sample output string", example = "[0, 1]") String sampleOutput,
        @Schema(
                        description = "Map of language identifier to starter code template",
                        example = "{\"java\": \"class Solution { ... }\"}")
                Map<String, String> starterCodes,
        @Schema(description = "Sanitized test cases container (visible only)")
                TestCasesContainer testCases) {

    /**
     * Container holding sanitized, client-safe test cases.
     *
     * @param visible list of public, visible test cases for example demonstration
     */
    @Schema(description = "Container for client-safe (visible-only) test cases")
    public record TestCasesContainer(
            @Schema(description = "List of visible test cases shown to the candidate")
                    List<VisibleTestCaseDto> visible) {}

    /**
     * DTO for a single visible test case exposed to the candidate.
     *
     * @param id unique identifier of the test case
     * @param name human-readable display label
     * @param inputs map of named input parameters
     * @param rawInput unparsed raw input string
     * @param input standard input formatted for client execution
     * @param expectedOutput expected string output
     * @param explanation optional problem explanation
     */
    @Schema(description = "A single visible test case exposed to the candidate")
    public record VisibleTestCaseDto(
            @Schema(description = "Test case identifier", example = "tc-1") String id,
            @Schema(description = "Human-readable display name", example = "Example 1") String name,
            @Schema(description = "Map of named input parameters") Map<String, Object> inputs,
            @Schema(description = "Unparsed raw input string", example = "2\n[2,7,11,15]\n9")
                    String rawInput,
            @Schema(
                            description = "Standard input formatted for client-side execution",
                            example = "2\n[2,7,11,15]\n9")
                    String input,
            @Schema(description = "Expected output string", example = "[0, 1]")
                    String expectedOutput,
            @Schema(description = "Optional explanation of the test case", nullable = true)
                    String explanation) {}

    /**
     * Factory method creating a safe, client-facing {@link QuestionResponse} from a domain
     * definition, ensuring hidden test cases are completely omitted.
     *
     * @param q the server-side question definition
     * @return safe QuestionResponse
     */
    public static QuestionResponse from(QuestionDefinition q) {
        List<VisibleTestCaseDto> visibleList =
                q.testCases() == null
                        ? List.of()
                        : q.testCases().stream()
                                .filter(tc -> !tc.hidden())
                                .map(
                                        tc ->
                                                new VisibleTestCaseDto(
                                                        tc.id(),
                                                        tc.name(),
                                                        tc.inputs(),
                                                        tc.input(),
                                                        tc.input(),
                                                        tc.expectedOutput(),
                                                        tc.explanation()))
                                .toList();

        return new QuestionResponse(
                q.id(),
                q.title(),
                q.difficulty(),
                q.description(),
                q.signature(),
                q.sampleInput(),
                q.sampleOutput(),
                q.starterCodes(),
                new TestCasesContainer(visibleList));
    }
}
