package com.codingplatform.backend.dto;

import com.codingplatform.backend.model.QuestionDefinition;
import java.util.List;
import java.util.Map;

/**
 * Public response DTO exposing question metadata, starter code templates, and visible example test
 * cases. Hidden test cases are strictly filtered out to prevent leaking private evaluation data to
 * clients.
 */
public record QuestionResponse(
        String id,
        String title,
        String difficulty,
        String description,
        FunctionSignature signature,
        String sampleInput,
        String sampleOutput,
        Map<String, String> starterCodes,
        TestCasesContainer testCases) {

    /**
     * Container holding sanitized, client-safe test cases.
     *
     * @param visible list of public, visible test cases for example demonstration
     */
    public record TestCasesContainer(List<VisibleTestCaseDto> visible) {}

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
    public record VisibleTestCaseDto(
            String id,
            String name,
            Map<String, Object> inputs,
            String rawInput,
            String input,
            String expectedOutput,
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
