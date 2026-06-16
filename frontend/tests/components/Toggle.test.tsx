import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "../../src/components/Toggle";

describe("Toggle", () => {
  it("renders with label", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Dark mode" />);
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
  });

  it("renders without label", () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toBeInTheDocument();
  });

  it("renders checked state", () => {
    render(<Toggle checked={true} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("renders unchecked state", () => {
    render(<Toggle checked={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("calls onChange when clicked", async () => {
    let val = false;
    render(<Toggle checked={false} onChange={(v) => { val = v; }} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(val).toBe(true);
  });

  it("is disabled when disabled prop set", () => {
    render(<Toggle checked={false} onChange={() => {}} disabled />);
    expect(screen.getByRole("switch")).toBeDisabled();
  });

  it("does not call onChange when disabled", async () => {
    let called = false;
    render(<Toggle checked={false} onChange={() => { called = true; }} disabled />);
    await userEvent.click(screen.getByRole("switch"));
    expect(called).toBe(false);
  });

  it("toggles from checked to unchecked", async () => {
    let val = true;
    render(<Toggle checked={true} onChange={(v) => { val = v; }} />);
    await userEvent.click(screen.getByRole("switch"));
    expect(val).toBe(false);
  });
});
