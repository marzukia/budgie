import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "../../src/components/FormField";

describe("FormField", () => {
  it("renders label and children", () => {
    render(<FormField label="Username"><input /></FormField>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("renders error message", () => {
    render(<FormField label="Field" error="This is required"><input /></FormField>);
    expect(screen.getByText("This is required")).toBeInTheDocument();
  });

  it("renders without error when no error prop", () => {
    render(<FormField label="Field"><input /></FormField>);
    expect(screen.queryByText("This is required")).not.toBeInTheDocument();
  });

  it("marks label as required", () => {
    render(<FormField label="Field" required><input /></FormField>);
    expect(screen.getByText("Field")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(<FormField label="Group"><><input /><select /></></FormField>);
    expect(screen.getByText("Group")).toBeInTheDocument();
  });

  it("handles empty label gracefully", () => {
    render(<FormField label=""><input /></FormField>);
    expect(document.querySelector("label")).toBeInTheDocument();
  });

  it("handles long error strings", () => {
    render(<FormField label="Field" error={"a".repeat(200)}><input /></FormField>);
    expect(screen.getByText("a".repeat(200))).toBeInTheDocument();
  });
});
