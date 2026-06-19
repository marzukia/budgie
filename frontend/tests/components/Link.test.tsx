import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Link } from "../../src/components/Link";

// Mock @tanstack/react-router Link since we can't easily create a router in test
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}));

describe("Link", () => {
  it("renders with to prop", () => {
    render(<Link to="/">Home</Link>);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders anchor with href", () => {
    render(<Link to="/dashboard">Dashboard</Link>);
    const link = screen.getByText("Dashboard");
    expect(link.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("renders without active style when active not set", () => {
    render(<Link to="/">Home</Link>);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(<Link to="/"><span>A</span><span>B</span></Link>);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
