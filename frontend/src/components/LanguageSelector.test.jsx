import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSelector from "./LanguageSelector";

const mockLanguages = [
  { id: "java", name: "Java" },
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python" },
];

describe("LanguageSelector", () => {
  test("renders with current language selected and accessible combobox", () => {
    render(
      <LanguageSelector
        selectedLanguage="python"
        languages={mockLanguages}
        onLanguageChange={vi.fn()}
      />
    );

    const select = screen.getByRole("combobox", {
      name: "Select programming language",
    });
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue("python");
    expect(screen.getAllByRole("option")).toHaveLength(3);

    // Custom button displays current language
    expect(screen.getByTestId("language-selector-button")).toHaveTextContent(
      "Python"
    );
  });

  test("calls onLanguageChange when selecting an option via combobox", async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(
      <LanguageSelector
        selectedLanguage="java"
        languages={mockLanguages}
        onLanguageChange={onLanguageChange}
      />
    );

    const select = screen.getByRole("combobox", {
      name: "Select programming language",
    });
    await user.selectOptions(select, "javascript");

    expect(onLanguageChange).toHaveBeenCalledWith("javascript");
  });

  test("opens custom menu on button click and displays tick mark for selected language", async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(
      <LanguageSelector
        selectedLanguage="java"
        languages={mockLanguages}
        onLanguageChange={onLanguageChange}
      />
    );

    const triggerBtn = screen.getByTestId("language-selector-button");
    await user.click(triggerBtn);

    // Menu is visible
    expect(screen.getByRole("menu")).toBeInTheDocument();

    // Selected option has tick mark
    expect(screen.getByTestId("tick-java")).toBeInTheDocument();
    expect(screen.queryByTestId("tick-python")).not.toBeInTheDocument();

    // Click another option in the custom menu
    await user.click(screen.getByRole("menuitem", { name: "Python" }));
    expect(onLanguageChange).toHaveBeenCalledWith("python");

    // Menu closes
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("is disabled when disabled prop is true", () => {
    render(
      <LanguageSelector
        selectedLanguage="java"
        languages={mockLanguages}
        disabled={true}
      />
    );

    const select = screen.getByRole("combobox", {
      name: "Select programming language",
    });
    const triggerBtn = screen.getByTestId("language-selector-button");

    expect(select).toBeDisabled();
    expect(triggerBtn).toBeDisabled();
  });
});
