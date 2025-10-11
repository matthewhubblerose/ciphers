import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/preact";
import userEvent from "@testing-library/user-event";
import CaesarShiftTool from "./CaesarShiftTool";

describe("CaesarShiftTool Component", () => {
  describe("initial render", () => {
    it("should render the component with title", () => {
      render(<CaesarShiftTool />);
      expect(screen.getByText("Caesar Shift Tool")).toBeInTheDocument();
    });

    it("should render encrypt and decrypt mode buttons", () => {
      render(<CaesarShiftTool />);
      expect(screen.getByRole("button", { name: /encrypt/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /decrypt/i })).toBeInTheDocument();
    });

    it("should start in encrypt mode", () => {
      render(<CaesarShiftTool />);
      const encryptButton = screen.getByRole("button", { name: /encrypt/i });
      expect(encryptButton).toHaveClass("btn-primary");
    });

    it("should render shift value control", () => {
      render(<CaesarShiftTool />);
      expect(screen.getByText(/Shift Value:/i)).toBeInTheDocument();
    });

    it("should render input and output textareas", () => {
      render(<CaesarShiftTool />);
      const textareas = screen.getAllByRole("textbox");
      expect(textareas).toHaveLength(2);
    });
  });

  describe("mode switching", () => {
    it("should switch to decrypt mode when decrypt button is clicked", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const decryptButton = screen.getByRole("button", { name: /decrypt/i });
      await user.click(decryptButton);

      expect(decryptButton).toHaveClass("btn-primary");
    });

    it("should update placeholder text when switching modes", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];

      // Initially in encrypt mode
      expect(inputTextarea).toHaveAttribute("placeholder", "Enter plain text");

      // Switch to decrypt mode
      const decryptButton = screen.getByRole("button", { name: /decrypt/i });
      await user.click(decryptButton);

      expect(inputTextarea).toHaveAttribute("placeholder", "Enter cipher text");
    });
  });

  describe("shift control", () => {
    it("should update shift value with number input", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const numberInputs = screen.getAllByRole("spinbutton");
      const shiftNumberInput = numberInputs[0]; // First one is the shift control
      await user.clear(shiftNumberInput);
      await user.type(shiftNumberInput, "13");

      expect(screen.getByText(/Shift Value: 13/i)).toBeInTheDocument();
    });

    it("should render rotate left and right buttons", () => {
      render(<CaesarShiftTool />);
      const buttons = screen.getAllByRole("button");
      const rotateButtons = buttons.filter(
        (btn) => btn.textContent === "←" || btn.textContent === "→",
      );
      expect(rotateButtons).toHaveLength(2);
    });
  });

  describe("encryption", () => {
    it("should encrypt text with default shift (3)", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      const outputTextarea = textareas[1];

      await user.type(inputTextarea, "HELLO");

      expect(outputTextarea).toHaveValue("KHOOR");
    });

    it("should encrypt text with custom shift", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      const outputTextarea = textareas[1];
      const shiftInputs = screen.getAllByRole("spinbutton");
      const shiftInput = shiftInputs[0]; // First one is the shift control

      await user.clear(shiftInput);
      await user.type(shiftInput, "13");
      await user.type(inputTextarea, "HELLO");

      expect(outputTextarea).toHaveValue("URYYB");
    });

    it("should update output in real-time as user types", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      const outputTextarea = textareas[1];

      await user.type(inputTextarea, "A");
      expect(outputTextarea).toHaveValue("D");

      await user.type(inputTextarea, "B");
      expect(outputTextarea).toHaveValue("DE");

      await user.type(inputTextarea, "C");
      expect(outputTextarea).toHaveValue("DEF");
    });
  });

  describe("decryption", () => {
    it("should decrypt text", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const decryptButton = screen.getByRole("button", { name: /decrypt/i });
      await user.click(decryptButton);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      const outputTextarea = textareas[1];

      await user.type(inputTextarea, "khoor");

      expect(outputTextarea).toHaveValue("hello");
    });
  });

  describe("options", () => {
    it("should show options collapse section", () => {
      render(<CaesarShiftTool />);
      expect(screen.getByText(/Options/i)).toBeInTheDocument();
    });

    it("should render copy to clipboard button when there is output", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];

      await user.type(inputTextarea, "TEST");

      expect(screen.getByRole("button", { name: /copy to clipboard/i })).toBeInTheDocument();
    });

    it("should not render copy button when output is empty", () => {
      render(<CaesarShiftTool />);
      expect(screen.queryByRole("button", { name: /copy to clipboard/i })).not.toBeInTheDocument();
    });
  });

  describe("brute force", () => {
    it("should render brute force button", () => {
      render(<CaesarShiftTool />);
      expect(screen.getByRole("button", { name: /show all possible shifts/i })).toBeInTheDocument();
    });

    it("should disable brute force button when no input", () => {
      render(<CaesarShiftTool />);
      const bruteForceButton = screen.getByRole("button", { name: /show all possible shifts/i });
      expect(bruteForceButton).toBeDisabled();
    });

    it("should enable brute force button when there is input", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      await user.type(inputTextarea, "TEST");

      const bruteForceButton = screen.getByRole("button", { name: /show all possible shifts/i });
      expect(bruteForceButton).not.toBeDisabled();
    });

    it("should show all shifts when brute force button is clicked", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      await user.type(inputTextarea, "ABC");

      const bruteForceButton = screen.getByRole("button", { name: /show all possible shifts/i });
      await user.click(bruteForceButton);

      // Should show results for all 26 shifts (0-25)
      expect(screen.getByText(/Shift 0/i)).toBeInTheDocument();
      expect(screen.getByText(/Shift 13/i)).toBeInTheDocument();
      expect(screen.getByText(/Shift 25/i)).toBeInTheDocument();
    });

    it("should toggle brute force results visibility", async () => {
      const user = userEvent.setup();
      render(<CaesarShiftTool />);

      const textareas = screen.getAllByRole("textbox");
      const inputTextarea = textareas[0];
      await user.type(inputTextarea, "ABC");

      const bruteForceButton = screen.getByRole("button", { name: /show all possible shifts/i });

      // Show results
      await user.click(bruteForceButton);
      expect(screen.getByText(/Shift 0/i)).toBeInTheDocument();

      // Hide results
      await user.click(bruteForceButton);
      expect(screen.queryByText(/Shift 0/i)).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have proper input labels", () => {
      render(<CaesarShiftTool />);
      expect(screen.getByText(/Shift Value:/i)).toBeInTheDocument();
    });

    it("should have readonly attribute on output textarea", () => {
      render(<CaesarShiftTool />);
      const textareas = screen.getAllByRole("textbox");
      const outputTextarea = textareas[1];
      expect(outputTextarea).toHaveAttribute("readonly");
    });
  });
});
