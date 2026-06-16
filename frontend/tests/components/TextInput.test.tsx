import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextInput } from "../../src/components/TextInput";

describe("TextInput", () => {
  it("renders input with value", () => {
    render(<TextInput value="hello" onChange={() => {}} />);
    expect(screen.getByDisplayValue("hello")).toBeInTheDocument();
  });

  it("renders as input by default", () => {
    render(<TextInput value="test" onChange={() => {}} />);
    const el = screen.getByDisplayValue("test");
    expect(el.tagName).toBe("INPUT");
  });

  it("renders as textarea when multiline", () => {
    render(<TextInput value="text" onChange={() => {}} multiline />);
    const el = screen.getByDisplayValue("text");
    expect(el.tagName).toBe("TEXTAREA");
  });

  it("renders password type", () => {
    render(<TextInput value="secret" onChange={() => {}} type="password" />);
    const el = screen.getByDisplayValue("secret");
    expect(el).toHaveAttribute("type", "password");
  });

  it("renders number type", () => {
    render(<TextInput value="42" onChange={() => {}} type="number" />);
    const el = screen.getByDisplayValue("42");
    expect(el).toHaveAttribute("type", "number");
  });

  it("calls onChange when typing", async () => {
    let called = false;
    render(<TextInput value="" onChange={() => { called = true; }} />);
    await userEvent.type(screen.getByRole("textbox"), "a");
    expect(called).toBe(true);
  });

  it("is disabled when disabled prop set", () => {
    render(<TextInput value="" onChange={() => {}} disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("renders with placeholder", () => {
    render(<TextInput value="" onChange={() => {}} placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders with maxLength", () => {
    render(<TextInput value="" onChange={() => {}} maxLength={10} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("maxLength", "10");
  });

  it("renders with empty value", () => {
    render(<TextInput value="" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("handles multiline with disabled", () => {
    render(<TextInput value="text" onChange={() => {}} multiline disabled />);
    const el = screen.getByDisplayValue("text");
    expect(el.tagName).toBe("TEXTAREA");
    expect(el).toBeDisabled();
  });
});
