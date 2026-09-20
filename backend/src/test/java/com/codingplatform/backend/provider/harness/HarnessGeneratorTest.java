package com.codingplatform.backend.provider.harness;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.FunctionParam;
import com.codingplatform.backend.dto.FunctionSignature;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class HarnessGeneratorTest {

    private HarnessGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new HarnessGenerator();
    }

    @Test
    void shouldGenerateJavaHarnessForTwoSum() {
        FunctionSignature signature =
                new FunctionSignature(
                        "twoSum",
                        List.of(
                                new FunctionParam("nums", "int[]"),
                                new FunctionParam("target", "int")),
                        "int[]");

        String userCode =
                """
                class Solution {
                    public int[] twoSum(int[] nums, int target) {
                        return new int[]{0, 1};
                    }
                }
                """;

        ExecutionRequest request =
                new ExecutionRequest(
                        "java", userCode, null, signature, "numbers = [2, 7, 11, 15], target = 9");

        List<SourceFile> files = generator.generateExecutionFiles(request, "Main");

        assertEquals(1, files.size());
        assertEquals("Main", files.get(0).name());

        String mainContent = files.get(0).content();
        assertTrue(mainContent.contains("public class Main"));
        assertTrue(mainContent.contains("solution.twoSum(arg0, arg1)"));
        assertTrue(mainContent.contains("numbers = [2, 7, 11, 15], target = 9"));
        assertTrue(mainContent.contains("Arrays.toString(result)"));
        assertTrue(mainContent.contains("class Solution"));
    }

    @Test
    void shouldPrioritizeCustomStdinOverSampleInput() {
        FunctionSignature signature =
                new FunctionSignature(
                        "twoSum",
                        List.of(
                                new FunctionParam("nums", "int[]"),
                                new FunctionParam("target", "int")),
                        "int[]");

        String userCode =
                """
                class Solution {
                    public int[] twoSum(int[] nums, int target) {
                        return new int[]{0, 1};
                    }
                }
                """;

        ExecutionRequest request =
                new ExecutionRequest(
                        "java",
                        userCode,
                        "[3, 2, 4]\n6",
                        signature,
                        "numbers = [2, 7, 11, 15], target = 9");

        List<SourceFile> files = generator.generateExecutionFiles(request, "Main");
        String mainContent = files.get(0).content();

        assertTrue(mainContent.contains("[3, 2, 4]\\n6"));
        assertTrue(mainContent.contains("extractIntArray(rawInput, 0)"));
        assertTrue(mainContent.contains("extractInt(rawInput, 0)"));
    }

    @Test
    void shouldSanitizePublicClassSolutionInJava() {
        FunctionSignature signature =
                new FunctionSignature(
                        "reverseString", List.of(new FunctionParam("s", "string")), "string");

        String userCodeWithPublic =
                """
                public class Solution {
                    public String reverseString(String s) {
                        return s;
                    }
                }
                """;

        ExecutionRequest request =
                new ExecutionRequest("java", userCodeWithPublic, null, signature, "s = \"hello\"");

        List<SourceFile> files = generator.generateExecutionFiles(request, "Main");
        String mainContent = files.get(0).content();

        assertTrue(mainContent.contains("class Solution"));
        assertTrue(!mainContent.contains("public class Solution"));
    }

    @Test
    void shouldGenerateJavaHarnessForReverseString() {
        FunctionSignature signature =
                new FunctionSignature(
                        "reverseString", List.of(new FunctionParam("s", "string")), "string");

        String userCode =
                """
                class Solution {
                    public String reverseString(String s) {
                        return new StringBuilder(s).reverse().toString();
                    }
                }
                """;

        ExecutionRequest request =
                new ExecutionRequest("java", userCode, "custom-input", signature, "s = \"hello\"");

        List<SourceFile> files = generator.generateExecutionFiles(request, "Main");

        assertEquals(1, files.size());
        assertEquals("Main", files.get(0).name());

        String mainContent = files.get(0).content();
        assertTrue(mainContent.contains("solution.reverseString(arg0)"));
        assertTrue(mainContent.contains("extractString(rawInput, 0)"));
    }

    @Test
    void shouldFallbackToSingleFileWhenCustomMainIsPresent() {
        FunctionSignature signature =
                new FunctionSignature(
                        "twoSum",
                        List.of(
                                new FunctionParam("nums", "int[]"),
                                new FunctionParam("target", "int")),
                        "int[]");

        String userCodeWithMain =
                """
                public class Main {
                    public static void main(String[] args) {
                        System.out.println("Hello");
                    }
                }
                """;

        ExecutionRequest request =
                new ExecutionRequest("java", userCodeWithMain, null, signature, null);

        List<SourceFile> files = generator.generateExecutionFiles(request, "Main");

        assertEquals(1, files.size());
        assertEquals("Main", files.get(0).name());
        assertEquals(userCodeWithMain, files.get(0).content());
    }

    @Test
    void shouldFallbackToSingleFileWhenNoSignatureProvided() {
        String code = "System.out.println(\"test\");";
        ExecutionRequest request = new ExecutionRequest("java", code, null);

        List<SourceFile> files = generator.generateExecutionFiles(request, "Main");

        assertEquals(1, files.size());
        assertEquals("Main", files.get(0).name());
        assertEquals(code, files.get(0).content());
    }

    @Test
    void shouldGeneratePythonHarness() {
        FunctionSignature signature =
                new FunctionSignature(
                        "twoSum",
                        List.of(
                                new FunctionParam("nums", "int[]"),
                                new FunctionParam("target", "int")),
                        "int[]");

        String userCode =
                "class Solution:\n    def twoSum(self, nums, target):\n        return [0, 1]";
        ExecutionRequest request =
                new ExecutionRequest("python", userCode, null, signature, "[2, 7, 11, 15]\n9");

        List<SourceFile> files = generator.generateExecutionFiles(request, "main");
        assertEquals(1, files.size());
        assertEquals("main", files.get(0).name());
        assertTrue(files.get(0).content().contains("sol.twoSum(arg0, arg1)"));
    }
}
