package com.codingplatform.backend.repository;

import com.codingplatform.backend.dto.FunctionParam;
import com.codingplatform.backend.dto.FunctionSignature;
import com.codingplatform.backend.model.QuestionDefinition;
import com.codingplatform.backend.model.TestCase;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/**
 * InMemoryQuestionRepository provides thread-safe, in-memory storage for coding question
 * definitions and their associated visible and hidden test suites.
 *
 * <p>Architectural Context: Keeping test cases in-memory isolates and validates the judging engine
 * flow (EvaluationService &lt;-&gt; ExecutionService) without coupling to external databases.
 * Hidden test cases are kept on the server side to protect test integrity and prevent cheating.
 *
 * <p>TODO: Replace with JPA/Hibernate entity repository backed by PostgreSQL.
 */
@Repository
public class InMemoryQuestionRepository implements QuestionRepository {

    private final Map<String, QuestionDefinition> questions =
            Collections.synchronizedMap(new LinkedHashMap<>());

    /** Initializes the in-memory repository and populates starter coding challenges. */
    public InMemoryQuestionRepository() {
        initQuestions();
    }

    /**
     * Seeds initial question catalog including Two Sum and Reverse String with multi-language
     * starter codes and full test suites (visible examples and hidden cases).
     */
    private void initQuestions() {
        // Starter codes for Two Sum
        Map<String, String> twoSumStarters =
                Map.of(
                        "java",
                        """
                        class Solution {
                            public int[] twoSum(int[] nums, int target) {
                                // code here
                            }
                        }""",
                        "python",
                        """
                        class Solution:
                            def twoSum(self, nums: list[int], target: int) -> list[int]:
                                # code here
                                pass""",
                        "javascript",
                        """
                        /**
                         * @param {number[]} nums
                         * @param {number} target
                         * @return {number[]}
                         */
                        function twoSum(nums, target) {
                            // code here
                        }""");

        // Two Sum
        QuestionDefinition twoSum =
                new QuestionDefinition(
                        "two-sum",
                        "Two Sum",
                        "Easy",
                        "Given an array of integers and a target, return the indices of two numbers whose sum is equal to the target.",
                        new FunctionSignature(
                                "twoSum",
                                List.of(
                                        new FunctionParam("nums", "int[]"),
                                        new FunctionParam("target", "int")),
                                "int[]"),
                        "numbers = [2, 7, 11, 15], target = 9",
                        "[0, 1]",
                        twoSumStarters,
                        "unordered_array",
                        List.of(
                                new TestCase(
                                        "case-1",
                                        "Example 1",
                                        "[2, 7, 11, 15]\n9",
                                        "[0, 1]",
                                        false,
                                        Map.of("nums", List.of(2, 7, 11, 15), "target", 9),
                                        "Because nums[0] + nums[1] == 9, we return [0, 1]."),
                                new TestCase(
                                        "case-2",
                                        "Example 2",
                                        "[3, 2, 4]\n6",
                                        "[1, 2]",
                                        false,
                                        Map.of("nums", List.of(3, 2, 4), "target", 6),
                                        "Because nums[1] + nums[2] == 6, we return [1, 2]."),
                                new TestCase(
                                        "case-3",
                                        "Hidden Case 1 (Duplicate numbers)",
                                        "[3, 3]\n6",
                                        "[0, 1]",
                                        true,
                                        Map.of("nums", List.of(3, 3), "target", 6),
                                        null),
                                new TestCase(
                                        "case-4",
                                        "Hidden Case 2 (Negative integers)",
                                        "[-1, -2, -3, -4, -5]\n-8",
                                        "[2, 4]",
                                        true,
                                        Map.of("nums", List.of(-1, -2, -3, -4, -5), "target", -8),
                                        null),
                                new TestCase(
                                        "case-5",
                                        "Hidden Case 3 (Zero target)",
                                        "[0, 4, 3, 0]\n0",
                                        "[0, 3]",
                                        true,
                                        Map.of("nums", List.of(0, 4, 3, 0), "target", 0),
                                        null)));

        // Starter codes for Reverse String
        Map<String, String> reverseStringStarters =
                Map.of(
                        "java",
                        """
                        class Solution {
                            public String reverseString(String s) {
                                // code here
                            }
                        }""",
                        "python",
                        """
                        class Solution:
                            def reverseString(self, s: str) -> str:
                                # code here
                                pass""",
                        "javascript",
                        """
                        /**
                         * @param {string} s
                         * @return {string}
                         */
                        function reverseString(s) {
                            // code here
                        }""");

        // Reverse String
        QuestionDefinition reverseString =
                new QuestionDefinition(
                        "reverse-string",
                        "Reverse String",
                        "Easy",
                        "Given a string, return a new string with the characters reversed.",
                        new FunctionSignature(
                                "reverseString",
                                List.of(new FunctionParam("s", "string")),
                                "string"),
                        "s = \"hello\"",
                        "\"olleh\"",
                        reverseStringStarters,
                        "exact",
                        List.of(
                                new TestCase(
                                        "case-1",
                                        "Example 1",
                                        "\"hello\"",
                                        "\"olleh\"",
                                        false,
                                        Map.of("s", "hello"),
                                        "The characters of \"hello\" reversed in order form \"olleh\"."),
                                new TestCase(
                                        "case-2",
                                        "Example 2",
                                        "\"world\"",
                                        "\"dlrow\"",
                                        false,
                                        Map.of("s", "world"),
                                        "The characters of \"world\" reversed in order form \"dlrow\"."),
                                new TestCase(
                                        "case-3",
                                        "Hidden Case 1 (Single character)",
                                        "\"a\"",
                                        "\"a\"",
                                        true,
                                        Map.of("s", "a"),
                                        null),
                                new TestCase(
                                        "case-4",
                                        "Hidden Case 2 (Palindrome)",
                                        "\"racecar\"",
                                        "\"racecar\"",
                                        true,
                                        Map.of("s", "racecar"),
                                        null),
                                new TestCase(
                                        "case-5",
                                        "Hidden Case 3 (Alphanumeric)",
                                        "\"12345\"",
                                        "\"54321\"",
                                        true,
                                        Map.of("s", "12345"),
                                        null)));

        questions.put(twoSum.id(), twoSum);
        questions.put(reverseString.id(), reverseString);
    }

    @Override
    public Optional<QuestionDefinition> findById(String id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(questions.get(id));
    }

    @Override
    public List<QuestionDefinition> findAll() {
        return new ArrayList<>(questions.values());
    }
}
