package com.codingplatform.backend.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.codingplatform.backend.dto.FunctionParam;
import com.codingplatform.backend.dto.FunctionSignature;
import com.codingplatform.backend.model.QuestionDefinition;
import com.codingplatform.backend.model.TestCase;
import com.codingplatform.backend.repository.QuestionRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Integration and unit tests for {@link QuestionController} testing endpoint routing,
 * serialization, 404 responses, and strict masking of hidden test cases.
 */
@WebMvcTest(QuestionController.class)
class QuestionControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private QuestionRepository questionRepository;

    /**
     * Creates a mock {@link QuestionDefinition} with both visible and hidden test cases for testing
     * serialization and sanitization filters.
     *
     * @param id problem ID
     * @param title problem title
     * @return populated QuestionDefinition
     */
    private QuestionDefinition createMockQuestion(String id, String title) {
        return new QuestionDefinition(
                id,
                title,
                "Easy",
                "Test description for " + title,
                new FunctionSignature(
                        "solve", List.of(new FunctionParam("nums", "int[]")), "int[]"),
                "[1, 2]",
                "[2, 1]",
                Map.of("java", "// java code", "python", "# py code"),
                "unordered_array",
                List.of(
                        new TestCase(
                                "case-1",
                                "Example 1",
                                "1 2",
                                "2 1",
                                false,
                                Map.of("nums", List.of(1, 2)),
                                "Example 1 explanation"),
                        new TestCase(
                                "case-2",
                                "Hidden Case 1",
                                "9 9",
                                "9 9",
                                true,
                                Map.of("nums", List.of(9, 9)),
                                null)));
    }

    @Test
    void shouldReturnAllQuestionsFilteringOutHiddenTestCases() throws Exception {
        QuestionDefinition q1 = createMockQuestion("q-1", "Question One");
        QuestionDefinition q2 = createMockQuestion("q-2", "Question Two");

        when(questionRepository.findAll()).thenReturn(List.of(q1, q2));

        mockMvc.perform(get("/api/v1/questions").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value("q-1"))
                .andExpect(jsonPath("$[0].title").value("Question One"))
                .andExpect(jsonPath("$[0].description").value("Test description for Question One"))
                .andExpect(jsonPath("$[0].starterCodes.java").value("// java code"))
                .andExpect(jsonPath("$[0].testCases.visible.length()").value(1))
                .andExpect(jsonPath("$[0].testCases.visible[0].id").value("case-1"))
                .andExpect(
                        jsonPath("$[0].testCases.visible[0].explanation")
                                .value("Example 1 explanation"))
                .andExpect(jsonPath("$[0].testCases.hidden").doesNotExist())
                .andExpect(jsonPath("$[1].id").value("q-2"));
    }

    @Test
    void shouldReturnSingleQuestionByIdWhenExists() throws Exception {
        QuestionDefinition q1 = createMockQuestion("two-sum", "Two Sum");

        when(questionRepository.findById("two-sum")).thenReturn(Optional.of(q1));

        mockMvc.perform(get("/api/v1/questions/two-sum").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("two-sum"))
                .andExpect(jsonPath("$.title").value("Two Sum"))
                .andExpect(jsonPath("$.testCases.visible.length()").value(1))
                .andExpect(jsonPath("$..[?(@.id == 'case-2')]").doesNotExist());
    }

    @Test
    void shouldReturn404WhenQuestionNotFound() throws Exception {
        when(questionRepository.findById("non-existent")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/questions/non-existent").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
