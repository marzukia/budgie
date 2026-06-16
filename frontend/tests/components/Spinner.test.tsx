import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "../../src/components/Spinner";

describe("Spinner", () => {
  it("renders without crashing", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toBeTruthy();
  });

  it("renders sm size", () => {
    render(<Spinner size="sm" />);
    expect(document.querySelector("[class*='spinner']")).toBeInTheDocument();
  });

  it("renders md size (default)", () => {
    render(<Spinner size="md" />);
    expect(document.querySelector("[class*='spinner']")).toBeInTheDocument();
  });

  it("renders lg size", () => {
    render(<Spinner size="lg" />);
    expect(document.querySelector("[class*='spinner']")).toBeInTheDocument();
  });

  it("renders with default md size when no size prop", () => {
    render(<Spinner />);
    expect(document.querySelector("[class*='spinner']")).toBeInTheDocument();
  });
});
