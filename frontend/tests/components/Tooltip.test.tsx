import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "../../src/components/Tooltip";

describe("Tooltip", () => {
  it("renders children", () => {
    render(<Tooltip content="Help text"><span>Hover me</span></Tooltip>);
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("does not show tooltip content by default", () => {
    render(<Tooltip content="Help text"><span>Hover me</span></Tooltip>);
    expect(screen.queryByText("Help text")).not.toBeInTheDocument();
  });

  it("shows tooltip on mouse enter", async () => {
    render(<Tooltip content="Help text"><span>Hover me</span></Tooltip>);
    await userEvent.hover(screen.getByText("Hover me"));
    expect(screen.getByText("Help text")).toBeInTheDocument();
  });

  it("hides tooltip on mouse leave", async () => {
    render(<Tooltip content="Help text"><span>Hover me</span></Tooltip>);
    await userEvent.hover(screen.getByText("Hover me"));
    expect(screen.getByText("Help text")).toBeInTheDocument();
    await userEvent.unhover(screen.getByText("Hover me"));
    expect(screen.queryByText("Help text")).not.toBeInTheDocument();
  });

  it("renders with all positions", () => {
    const { rerender } = render(<Tooltip content="C" position="top"><span>X</span></Tooltip>);
    expect(screen.getByText("X")).toBeInTheDocument();

    rerender(<Tooltip content="C" position="bottom"><span>X</span></Tooltip>);
    expect(screen.getByText("X")).toBeInTheDocument();

    rerender(<Tooltip content="C" position="left"><span>X</span></Tooltip>);
    expect(screen.getByText("X")).toBeInTheDocument();

    rerender(<Tooltip content="C" position="right"><span>X</span></Tooltip>);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("renders with empty content string", () => {
    render(<Tooltip content=""><span>Empty</span></Tooltip>);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("renders with long content", () => {
    const long = "a".repeat(200);
    render(<Tooltip content={long}><span>Long</span></Tooltip>);
    expect(screen.getByText("Long")).toBeInTheDocument();
  });
});
