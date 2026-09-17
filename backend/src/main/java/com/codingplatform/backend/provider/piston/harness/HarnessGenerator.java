package com.codingplatform.backend.provider.piston.harness;

import com.codingplatform.backend.dto.ExecutionRequest;
import com.codingplatform.backend.dto.FunctionParam;
import com.codingplatform.backend.dto.FunctionSignature;
import com.codingplatform.backend.provider.piston.dto.PistonFile;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class HarnessGenerator {

    public List<PistonFile> generateExecutionFiles(
            ExecutionRequest request, String defaultFileName) {
        if (request == null || request.sourceCode() == null) {
            return List.of(new PistonFile(defaultFileName, ""));
        }

        String language = request.language() != null ? request.language().toLowerCase() : "";
        FunctionSignature signature = request.signature();

        // If no function signature or if source code already defines a standard main entry point
        if (signature == null
                || signature.functionName() == null
                || signature.functionName().isBlank()
                || hasCustomMainMethod(request.sourceCode(), language)) {
            return List.of(new PistonFile(defaultFileName, request.sourceCode()));
        }

        String effectiveInput;
        if (request.stdin() != null && !request.stdin().isBlank()) {
            effectiveInput = request.stdin().trim();
        } else if (request.sampleInput() != null && !request.sampleInput().isBlank()) {
            effectiveInput = request.sampleInput().trim();
        } else {
            effectiveInput = "";
        }

        if ("java".equals(language)) {
            String sanitizedUserCode =
                    request.sourceCode()
                            .replaceAll("\\bpublic\\s+class\\s+Solution\\b", "class Solution");
            String driverCode = generateJavaDriver(signature, effectiveInput);
            String fullCode = driverCode + "\n\n" + sanitizedUserCode;
            return List.of(new PistonFile(defaultFileName, fullCode));
        }

        if ("python".equals(language)) {
            String driverCode = generatePythonDriver(signature, effectiveInput);
            String fullCode = request.sourceCode() + "\n\n" + driverCode;
            return List.of(new PistonFile(defaultFileName, fullCode));
        }

        if ("javascript".equals(language)) {
            String driverCode = generateJavaScriptDriver(signature, effectiveInput);
            String fullCode = request.sourceCode() + "\n\n" + driverCode;
            return List.of(new PistonFile(defaultFileName, fullCode));
        }

        return List.of(new PistonFile(defaultFileName, request.sourceCode()));
    }

    private boolean hasCustomMainMethod(String sourceCode, String language) {
        if ("java".equals(language)) {
            return sourceCode.contains("public static void main");
        }
        if ("python".equals(language)) {
            return sourceCode.contains("__name__ == '__main__'")
                    || sourceCode.contains("__name__ == \"__main__\"");
        }
        return false;
    }

    private String generateJavaDriver(FunctionSignature signature, String effectiveInput) {
        StringBuilder sb = new StringBuilder();
        sb.append("import java.util.*;\n");
        sb.append("import java.util.regex.*;\n\n");
        sb.append("public class Main {\n");

        // Helper parsers
        sb.append("    static int[] extractIntArray(String text, int index) {\n");
        sb.append(
                "        Matcher m = Pattern.compile(\"\\\\[([^\\\\]]*)\\\\]\").matcher(text);\n");
        sb.append("        int count = 0;\n");
        sb.append("        while (m.find()) {\n");
        sb.append("            if (count == index) {\n");
        sb.append("                String content = m.group(1).trim();\n");
        sb.append("                if (content.isEmpty()) return new int[0];\n");
        sb.append("                String[] parts = content.split(\",\");\n");
        sb.append("                int[] res = new int[parts.length];\n");
        sb.append("                for (int i = 0; i < parts.length; i++) {\n");
        sb.append("                    res[i] = Integer.parseInt(parts[i].trim());\n");
        sb.append("                }\n");
        sb.append("                return res;\n");
        sb.append("            }\n");
        sb.append("            count++;\n");
        sb.append("        }\n");
        sb.append("        return new int[0];\n");
        sb.append("    }\n\n");

        sb.append("    static int extractInt(String text, int index) {\n");
        sb.append("        String stripped = text.replaceAll(\"\\\\[[^\\\\]]*\\\\]\", \" \");\n");
        sb.append("        Matcher m = Pattern.compile(\"-?\\\\d+\").matcher(stripped);\n");
        sb.append("        int count = 0;\n");
        sb.append("        while (m.find()) {\n");
        sb.append("            if (count == index) {\n");
        sb.append("                return Integer.parseInt(m.group());\n");
        sb.append("            }\n");
        sb.append("            count++;\n");
        sb.append("        }\n");
        sb.append("        return 0;\n");
        sb.append("    }\n\n");

        sb.append("    static String extractString(String text, int index) {\n");
        sb.append(
                "        Matcher m = Pattern.compile(\"\\\"([^\\\"]*)\\\"|'([^']*)'\").matcher(text);\n");
        sb.append("        int count = 0;\n");
        sb.append("        while (m.find()) {\n");
        sb.append("            if (count == index) {\n");
        sb.append("                return m.group(1) != null ? m.group(1) : m.group(2);\n");
        sb.append("            }\n");
        sb.append("            count++;\n");
        sb.append("        }\n");
        sb.append("        if (text.contains(\"=\")) {\n");
        sb.append("            String[] parts = text.split(\"=\");\n");
        sb.append("            if (parts.length > 1) {\n");
        sb.append(
                "                return parts[1].trim().replaceAll(\"^[\\\"']|[\\\"']$\", \"\");\n");
        sb.append("            }\n");
        sb.append("        }\n");
        sb.append("        return text.trim();\n");
        sb.append("    }\n\n");

        sb.append("    static boolean extractBoolean(String text, int index) {\n");
        sb.append(
                "        Matcher m = Pattern.compile(\"\\\\b(true|false)\\\\b\", Pattern.CASE_INSENSITIVE).matcher(text);\n");
        sb.append("        int count = 0;\n");
        sb.append("        while (m.find()) {\n");
        sb.append("            if (count == index) return Boolean.parseBoolean(m.group());\n");
        sb.append("            count++;\n");
        sb.append("        }\n");
        sb.append("        return false;\n");
        sb.append("    }\n\n");

        // Main entry point
        sb.append("    public static void main(String[] args) {\n");
        sb.append("        try {\n");
        sb.append("            String rawInput = \"")
                .append(escapeJava(effectiveInput))
                .append("\";\n");
        sb.append("            Solution solution = new Solution();\n");

        // Prepare arguments
        List<FunctionParam> params = signature.params() != null ? signature.params() : List.of();
        List<String> argNames = new ArrayList<>();
        int arrayIdx = 0;
        int intIdx = 0;
        int strIdx = 0;
        int boolIdx = 0;

        for (int i = 0; i < params.size(); i++) {
            FunctionParam p = params.get(i);
            String type = p.type() != null ? p.type().toLowerCase() : "string";
            String argName = "arg" + i;
            argNames.add(argName);

            if ("int[]".equals(type)) {
                sb.append("            int[] ")
                        .append(argName)
                        .append(" = extractIntArray(rawInput, ")
                        .append(arrayIdx++)
                        .append(");\n");
            } else if ("int".equals(type)) {
                sb.append("            int ")
                        .append(argName)
                        .append(" = extractInt(rawInput, ")
                        .append(intIdx++)
                        .append(");\n");
            } else if ("string".equals(type)) {
                sb.append("            String ")
                        .append(argName)
                        .append(" = extractString(rawInput, ")
                        .append(strIdx++)
                        .append(");\n");
            } else if ("boolean".equals(type)) {
                sb.append("            boolean ")
                        .append(argName)
                        .append(" = extractBoolean(rawInput, ")
                        .append(boolIdx++)
                        .append(");\n");
            } else {
                sb.append("            String ")
                        .append(argName)
                        .append(" = extractString(rawInput, ")
                        .append(strIdx++)
                        .append(");\n");
            }
        }

        // Invoke method
        String returnType =
                signature.returnType() != null ? signature.returnType().toLowerCase() : "void";
        String invokeCall =
                "solution." + signature.functionName() + "(" + String.join(", ", argNames) + ")";

        if ("void".equals(returnType)) {
            sb.append("            ").append(invokeCall).append(";\n");
            sb.append("            System.out.println(\"null\");\n");
        } else if ("int[]".equals(returnType)
                || "string[]".equals(returnType)
                || "boolean[]".equals(returnType)) {
            sb.append("            var result = ").append(invokeCall).append(";\n");
            sb.append("            System.out.println(Arrays.toString(result));\n");
        } else if ("string".equals(returnType)) {
            sb.append("            var result = ").append(invokeCall).append(";\n");
            sb.append("            System.out.println(\"\\\"\" + result + \"\\\"\");\n");
        } else {
            sb.append("            var result = ").append(invokeCall).append(";\n");
            sb.append("            System.out.println(result);\n");
        }

        sb.append("        } catch (Throwable t) {\n");
        sb.append("            t.printStackTrace(System.err);\n");
        sb.append("            System.exit(1);\n");
        sb.append("        }\n");
        sb.append("    }\n");
        sb.append("}\n");

        return sb.toString();
    }

    private String generatePythonDriver(FunctionSignature signature, String effectiveInput) {
        StringBuilder sb = new StringBuilder();
        sb.append("import sys, json, re\n\n");
        sb.append("raw_input = \"\"\"").append(escapePython(effectiveInput)).append("\"\"\"\n\n");

        sb.append("sol = Solution()\n");
        List<FunctionParam> params = signature.params() != null ? signature.params() : List.of();
        List<String> argNames = new ArrayList<>();

        for (int i = 0; i < params.size(); i++) {
            FunctionParam p = params.get(i);
            String type = p.type() != null ? p.type().toLowerCase() : "string";
            String argName = "arg" + i;
            argNames.add(argName);

            if ("int[]".equals(type)) {
                sb.append("arrays = re.findall(r'\\[([^\\]]*)\\]', raw_input)\n");
                sb.append(argName)
                        .append(" = [int(x.strip()) for x in arrays[")
                        .append(i)
                        .append("].split(',') if x.strip()] if len(arrays) > ")
                        .append(i)
                        .append(" else []\n");
            } else if ("int".equals(type)) {
                sb.append("stripped = re.sub(r'\\[[^\\]]*\\]', ' ', raw_input)\n");
                sb.append("nums = re.findall(r'-?\\d+', stripped)\n");
                sb.append(argName).append(" = int(nums[0]) if nums else 0\n");
            } else if ("string".equals(type)) {
                sb.append("quotes = re.findall(r'\"([^\"]*)\"|\\'([^\\']*)\\'', raw_input)\n");
                sb.append(argName)
                        .append(
                                " = (quotes[0][0] or quotes[0][1]) if quotes else raw_input.strip()\n");
            } else {
                sb.append(argName).append(" = raw_input.strip()\n");
            }
        }

        sb.append("res = sol.")
                .append(signature.functionName())
                .append("(")
                .append(String.join(", ", argNames))
                .append(")\n");
        sb.append("print(json.dumps(res))\n");
        return sb.toString();
    }

    private String generateJavaScriptDriver(FunctionSignature signature, String effectiveInput) {
        StringBuilder sb = new StringBuilder();
        sb.append("let rawInput = `").append(escapeJs(effectiveInput)).append("`;\n\n");

        List<FunctionParam> params = signature.params() != null ? signature.params() : List.of();
        List<String> argNames = new ArrayList<>();

        for (int i = 0; i < params.size(); i++) {
            FunctionParam p = params.get(i);
            String type = p.type() != null ? p.type().toLowerCase() : "string";
            String argName = "arg" + i;
            argNames.add(argName);

            if ("int[]".equals(type)) {
                sb.append(
                        "const arrays = (rawInput.match(/\\[([^\\]]*)\\]/g) || []).map(a => JSON.parse(a));\n");
                sb.append("const ")
                        .append(argName)
                        .append(" = arrays[")
                        .append(i)
                        .append("] || [];\n");
            } else if ("int".equals(type)) {
                sb.append("const stripped = rawInput.replace(/\\[[^\\]]*\\]/g, ' ');\n");
                sb.append("const nums = stripped.match(/-?\\d+/g) || [];\n");
                sb.append("const ")
                        .append(argName)
                        .append(" = nums[0] ? parseInt(nums[0], 10) : 0;\n");
            } else if ("string".equals(type)) {
                sb.append("const match = rawInput.match(/\"([^\"]*)\"|'([^']*)'/);\n");
                sb.append("const ")
                        .append(argName)
                        .append(" = match ? (match[1] || match[2]) : rawInput.trim();\n");
            } else {
                sb.append("const ").append(argName).append(" = rawInput.trim();\n");
            }
        }

        sb.append("const res = ")
                .append(signature.functionName())
                .append("(")
                .append(String.join(", ", argNames))
                .append(");\n");
        sb.append("console.log(JSON.stringify(res));\n");
        return sb.toString();
    }

    private String escapeJava(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }

    private String escapePython(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\").replace("\"\"\"", "\\\"\\\"\\\"");
    }

    private String escapeJs(String input) {
        if (input == null) return "";
        return input.replace("`", "\\`").replace("${", "\\${");
    }
}
