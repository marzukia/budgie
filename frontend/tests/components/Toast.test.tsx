import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Toast } from "../../src/components/Toast";

describe("Toast", () => {
  it("renders message", () => {
    render(<Toast message="Saved!" />);
    expect(screen.getByText("Saved!")).toBeInTheDocument();
  });

  it("renders success variant", () => {
    render(<Toast message="OK" variant="success" />);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("renders error variant", () => {
    render(<Toast message="Error" variant="error" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders info variant (default)", () => {
    render(<Toast message="Info" />);
    expect(screen.getByText("Info")).toBeInTheDocument();
  });

  it("renders with long message", () => {
    const long = "a".repeat(500);
    render(<Toast message={long} />);
    expect(screen.getByText(long)).toBeInTheDocument();
  });

  it("renders with empty message string", () => {
    render(<Toast message="" />);
    expect(document.querySelector("[class*='root']")).toBeInTheDocument();
  });
});
