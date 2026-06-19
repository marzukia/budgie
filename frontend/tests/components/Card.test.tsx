import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "../../src/components/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Card title="My Title"><p>body</p></Card>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders actions", () => {
    render(<Card actions={<button>Action</button>}>body</Card>);
    expect(screen.getByText("Action")).toBeInTheDocument();
  });

  it("renders title and actions together", () => {
    render(<Card title="T" actions={<span>A</span>}>body</Card>);
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders without header when no title or actions", () => {
    render(<Card>body</Card>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Card className="my-class">body</Card>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders complex children (fragments, multiple elements)", () => {
    render(<Card><><span>A</span><span>B</span></></Card>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders with no children", () => {
    render(<Card title="Empty" />);
    expect(screen.getByText("Empty")).toBeInTheDocument();
  });
});
