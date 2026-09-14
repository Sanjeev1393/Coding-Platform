import { formatTime } from "./formatTime";

describe("formatTime", () => {
  describe("standard values", () => {
    test("formats 1800 seconds as 30:00", () => {
      expect(formatTime(1800)).toBe("30:00");
    });

    test("formats 1799 seconds as 29:59", () => {
      expect(formatTime(1799)).toBe("29:59");
    });

    test("formats 65 seconds as 01:05", () => {
      expect(formatTime(65)).toBe("01:05");
    });

    test("formats 9 seconds as 00:09", () => {
      expect(formatTime(9)).toBe("00:09");
    });

    test("formats 0 seconds as 00:00", () => {
      expect(formatTime(0)).toBe("00:00");
    });
  });

  describe("edge cases", () => {
    test("clamps negative values to 00:00", () => {
      expect(formatTime(-1)).toBe("00:00");
      expect(formatTime(-3600)).toBe("00:00");
    });
  });
});
