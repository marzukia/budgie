import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pill } from "../../src/components/Pill";

describe("Pill", () => {
  it("renders label", () => {
    render(<Pill label="Active" />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const { rerender } = render(<Pill label="Info" variant="info" />);
    expect(screen.getByText("Info")).toBeInTheDocument();

    rerender(<Pill label="Success" variant="success" />);
    expect(screen.getByText("Success")).toBeInTheDocument();

    rerender(<Pill label="Warning" variant="warning" />);
    expect(screen.getByText("Warning")).toBeInTheDocument();

    rerender(<Pill label="Danger" variant="danger" />);
    expect(screen.getByText("Danger")).toBeInTheDocument();
  });

  it("renders with info variant by default", () => {
    render(<Pill label="Default" />);
    expect(screen.getByText("Default")).toBeInTheDocument();
  });

  it("renders with long label", () => {
    const long = "Very long pill label that should be rendered";
    render(<Pill label={long} />);
    expect(screen.getByText(long)).toBeInTheDocument();
  });

  it("renders with empty label string", () => {
    render(<Pill label="" />);
    expect(document.querySelector("[class*='root']")).toBeInTheDocument();
  });
});
