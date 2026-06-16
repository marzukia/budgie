import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../src/components/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders all variants", () => {
    const { rerender } = render(<Button variant="primary">P</Button>);
    expect(screen.getByText("P")).toBeInTheDocument();

    rerender(<Button variant="secondary">S</Button>);
    expect(screen.getByText("S")).toBeInTheDocument();

    rerender(<Button variant="danger">D</Button>);
    expect(screen.getByText("D")).toBeInTheDocument();

    rerender(<Button variant="ghost">G</Button>);
    expect(screen.getByText("G")).toBeInTheDocument();
  });

  it("renders all sizes", () => {
    const { rerender } = render(<Button size="sm">S</Button>);
    expect(screen.getByText("S")).toBeInTheDocument();

    rerender(<Button size="md">M</Button>);
    expect(screen.getByText("M")).toBeInTheDocument();

    rerender(<Button size="lg">L</Button>);
    expect(screen.getByText("L")).toBeInTheDocument();
  });

  it("shows spinner and disables button when loading", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
    // Spinner is rendered instead of children
    expect(screen.queryByText("Loading")).not.toBeInTheDocument();
  });

  it("is disabled when disabled prop set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("fires onClick when clicked", async () => {
    let called = false;
    render(<Button onClick={() => { called = true; }}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(called).toBe(true);
  });

  it("does not fire onClick when disabled", async () => {
    let called = false;
    render(<Button disabled onClick={() => { called = true; }}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(called).toBe(false);
  });

  it("does not fire onClick when loading", async () => {
    let called = false;
    render(<Button loading onClick={() => { called = true; }}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(called).toBe(false);
  });

  it("renders with no onClick (optional prop)", () => {
    render(<Button>No handler</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders with empty string children", () => {
    render(<Button>{""}</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
