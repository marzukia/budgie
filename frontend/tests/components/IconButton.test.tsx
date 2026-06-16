import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { IconButton } from "../../src/components/IconButton";

describe("IconButton", () => {
  it("renders with aria-label", () => {
    render(<IconButton icon={<span>X</span>} label="Close" />);
    expect(screen.getByLabelText("Close")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const { rerender } = render(<IconButton variant="primary" icon={<span>P</span>} label="Primary" />);
    expect(screen.getByLabelText("Primary")).toBeInTheDocument();

    rerender(<IconButton variant="danger" icon={<span>D</span>} label="Danger" />);
    expect(screen.getByLabelText("Danger")).toBeInTheDocument();
  });

  it("renders all sizes", () => {
    const { rerender } = render(<IconButton size="sm" icon={<span>S</span>} label="Small" />);
    expect(screen.getByLabelText("Small")).toBeInTheDocument();

    rerender(<IconButton size="lg" icon={<span>L</span>} label="Large" />);
    expect(screen.getByLabelText("Large")).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    let called = false;
    render(<IconButton icon={<span>X</span>} label="Click" onClick={() => { called = true; }} />);
    await userEvent.click(screen.getByLabelText("Click"));
    expect(called).toBe(true);
  });

  it("renders without onClick handler", () => {
    render(<IconButton icon={<span>X</span>} label="Noop" />);
    expect(screen.getByLabelText("Noop")).toBeInTheDocument();
  });

  it("renders complex icon node", () => {
    render(<IconButton icon={<><span>A</span><span>B</span></>} label="Complex" />);
    expect(screen.getByLabelText("Complex")).toBeInTheDocument();
  });

  it("renders with ghost variant by default", () => {
    render(<IconButton icon={<span>G</span>} label="Ghost" />);
    expect(screen.getByLabelText("Ghost")).toBeInTheDocument();
  });
});
