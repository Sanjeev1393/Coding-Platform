import { SUPPORTED_LANGUAGES } from "../constants";

const TYPE_MAP = {
  java: {
    int: "int",
    "int[]": "int[]",
    string: "String",
    "string[]": "String[]",
    boolean: "boolean",
    "boolean[]": "boolean[]",
    void: "void",
  },
  javascript: {
    int: "number",
    "int[]": "number[]",
    string: "string",
    "string[]": "string[]",
    boolean: "boolean",
    "boolean[]": "boolean[]",
    void: "void",
  },
  python: {
    int: "int",
    "int[]": "list[int]",
    string: "str",
    "string[]": "list[str]",
    boolean: "bool",
    "boolean[]": "list[bool]",
    void: "None",
  },
};

/**
 * Resolves a generic type string into the target language's idiomatic type.
 *
 * @param {string} genericType - Generic type name (e.g. 'int[]', 'string')
 * @param {string} languageId - Target language ID ('java', 'javascript', 'python')
 * @returns {string} Target language type representation
 */
export function resolveType(genericType, languageId) {
  if (!genericType) return "";
  const langMap = TYPE_MAP[languageId];
  if (langMap && langMap[genericType.toLowerCase()]) {
    return langMap[genericType.toLowerCase()];
  }
  return genericType;
}

/**
 * Generates an idiomatic starter code stub from a function signature definition.
 *
 * @param {Object} signature - Function signature metadata
 * @param {string} signature.functionName - Target method/function name
 * @param {Array<{name: string, type: string}>} signature.params - Parameter definitions
 * @param {string} signature.returnType - Return type definition
 * @param {string} languageId - Target language identifier
 * @returns {string|null} Generated code stub or null if invalid signature
 */
export function generateSignatureStub(signature, languageId) {
  if (!signature || !signature.functionName) return null;

  const { functionName, params = [], returnType = "void" } = signature;

  if (languageId === "java") {
    const javaReturnType = resolveType(returnType, "java");
    const javaParams = params
      .map((p) => `${resolveType(p.type, "java")} ${p.name}`)
      .join(", ");

    return `class Solution {
    public ${javaReturnType} ${functionName}(${javaParams}) {
        // code here
    }
}`;
  }

  if (languageId === "javascript") {
    const jsDocParams = params
      .map((p) => ` * @param {${resolveType(p.type, "javascript")}} ${p.name}`)
      .join("\n");
    const jsDocReturn = ` * @return {${resolveType(returnType, "javascript")}}`;
    const jsParams = params.map((p) => p.name).join(", ");

    const docLines = [jsDocParams, jsDocReturn].filter(Boolean).join("\n");

    return `/**
${docLines}
 */
function ${functionName}(${jsParams}) {
    // code here
}`;
  }

  if (languageId === "python") {
    const pyReturnType = resolveType(returnType, "python");
    const paramParts = ["self"];

    for (const p of params) {
      paramParts.push(`${p.name}: ${resolveType(p.type, "python")}`);
    }

    return `class Solution:
    def ${functionName}(${paramParts.join(", ")}) -> ${pyReturnType}:
        # code here
        pass`;
  }

  return null;
}

/**
 * Resolves the file extension corresponding to a given language identifier.
 *
 * @param {string} languageId - Unique language key (e.g. 'java', 'python', 'javascript')
 * @returns {string} File extension (e.g. 'java', 'py', 'js')
 */
export function getLanguageExtension(languageId) {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.id === languageId);
  return lang ? lang.extension : languageId;
}

/**
 * Retrieves the starter code for a specific question and programming language.
 *
 * Checks in order:
 * 1. question.starterCodes[languageId] (explicit override)
 * 2. generateSignatureStub(question.signature, languageId)
 * 3. question.starterCode (if Java and available for backwards-compatibility)
 * 4. Default starter code generator from language configuration
 * 5. Fallback to empty string
 *
 * @param {Object} question - Question definition object
 * @param {string} [languageId="java"] - Language identifier
 * @returns {string} Starter code template string
 */
export function getStarterCode(question, languageId = "java") {
  if (!question) return "";

  if (question.starterCodes && question.starterCodes[languageId]) {
    return question.starterCodes[languageId];
  }

  if (question.signature) {
    const stub = generateSignatureStub(question.signature, languageId);
    if (stub) return stub;
  }

  if (languageId === "java" && question.starterCode) {
    return question.starterCode;
  }

  const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === languageId);
  if (langConfig && typeof langConfig.defaultStarterCode === "function") {
    return langConfig.defaultStarterCode(question.title);
  }

  return question.starterCode ?? "";
}

/**
 * Generates the composite storage key for question-language code persistence.
 *
 * @param {string|number} questionId - Question identifier
 * @param {string} languageId - Language identifier
 * @returns {string} Composite key (e.g. 'two-sum-java')
 */
export function buildQuestionLanguageKey(questionId, languageId) {
  return `${questionId}-${languageId}`;
}
