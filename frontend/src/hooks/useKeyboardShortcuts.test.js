import { renderHook } from "@testing-library/react";
import { useKeyboardShortcuts, isMacPlatform } from "./useKeyboardShortcuts";

describe("useKeyboardShortcuts", () => {
  let onRunCodeMock;
  let onSubmitMock;

  beforeEach(() => {
    onRunCodeMock = vi.fn();
    onSubmitMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Windows / Linux shortcuts (Ctrl modifier)", () => {
    test("triggers onRunCode on Ctrl + Enter", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onRunCodeMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    test("triggers onSubmit on Ctrl + Shift + Enter", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        shiftKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onRunCodeMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe("macOS shortcuts (Cmd / Meta modifier)", () => {
    test("triggers onRunCode on ⌘ + Enter (metaKey)", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        metaKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onRunCodeMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    test("triggers onSubmit on ⌘ + Shift + Enter (metaKey + shiftKey)", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        metaKey: true,
        shiftKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onRunCodeMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe("disabled state guards", () => {
    test("does not trigger callbacks when disabled is true", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
          disabled: true,
        })
      );

      const runEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        cancelable: true,
      });
      window.dispatchEvent(runEvent);

      const submitEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        shiftKey: true,
        cancelable: true,
      });
      window.dispatchEvent(submitEvent);

      expect(onRunCodeMock).not.toHaveBeenCalled();
      expect(onSubmitMock).not.toHaveBeenCalled();
      // Still prevents default to avoid unwanted newlines in focused inputs
      expect(runEvent.defaultPrevented).toBe(true);
      expect(submitEvent.defaultPrevented).toBe(true);
    });
  });

  describe("ignored keyboard combinations", () => {
    test("ignores normal Enter without modifier", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onRunCodeMock).not.toHaveBeenCalled();
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    test("ignores Ctrl + other keys (e.g. Ctrl + S, Ctrl + C)", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "s",
        ctrlKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onRunCodeMock).not.toHaveBeenCalled();
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    test("ignores Alt key combinations (e.g. Ctrl + Alt + Enter)", () => {
      renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        altKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onRunCodeMock).not.toHaveBeenCalled();
      expect(onSubmitMock).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe("cleanup on unmount", () => {
    test("removes event listener when unmounted", () => {
      const { unmount } = renderHook(() =>
        useKeyboardShortcuts({
          onRunCode: onRunCodeMock,
          onSubmit: onSubmitMock,
        })
      );

      unmount();

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        ctrlKey: true,
        cancelable: true,
      });
      window.dispatchEvent(event);

      expect(onRunCodeMock).not.toHaveBeenCalled();
    });
  });

  describe("isMacPlatform utility", () => {
    test("identifies Mac platform correctly", () => {
      const originalPlatform = navigator.platform;
      try {
        Object.defineProperty(navigator, "platform", {
          value: "MacIntel",
          configurable: true,
        });
        expect(isMacPlatform()).toBe(true);

        Object.defineProperty(navigator, "platform", {
          value: "Win32",
          configurable: true,
        });
        expect(isMacPlatform()).toBe(false);
      } finally {
        Object.defineProperty(navigator, "platform", {
          value: originalPlatform,
          configurable: true,
        });
      }
    });
  });
});
