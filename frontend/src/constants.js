export const ASSESSMENT_DURATION_SECONDS = 30 * 60;

export const questions = [
  {
    id: "two-sum",
    title: "Two Sum",
    description:
      "Given an array of integers and a target, return the indices of two numbers whose sum is equal to the target.",
    sampleInput: "numbers = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    starterCode: `public class Main {
    public static void main(String[] args) {
        // Write your solution for Two Sum here
    }
}`,
  },
  {
    id: "reverse-string",
    title: "Reverse String",
    description:
      "Given a string, return a new string with the characters reversed.",
    sampleInput: 's = "hello"',
    sampleOutput: '"olleh"',
    starterCode: `public class Main {
    public static void main(String[] args) {
        // Write your solution for Reverse String here
    }
}`,
  },
];
