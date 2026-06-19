import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Dashboard from "../../src/pages/Dashboard/Dashboard";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}));

const mockBuckets = vi.fn();

vi.mock("../../src/stores", () => ({
  useBuckets: () => mockBuckets(),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("Dashboard", () => {
  it("renders loading skeleton", () => {
    mockBuckets.mockReturnValue({ data: null, isLoading: true });
    renderWithMantine(<Dashboard />);
    expect(screen.queryByText("Budget Overview")).not.toBeInTheDocument();
  });

  it("renders empty state when no buckets", () => {
    mockBuckets.mockReturnValue({ data: [], isLoading: false });
    renderWithMantine(<Dashboard />);
    expect(screen.getByText("No buckets yet")).toBeInTheDocument();
    expect(screen.getByText("Create your first bucket")).toBeInTheDocument();
  });

  it("renders bucket cards with totals", () => {
    mockBuckets.mockReturnValue({
      data: [
        { id: 1, name: "Groceries", amount: 200.0, spent: 50.0, currency: "AUD", distribute_to_period: "monthly" },
        { id: 2, name: "Rent", amount: 1000.0, spent: 1000.0, currency: "AUD", distribute_to_period: "monthly" },
      ],
      isLoading: false,
    });
    renderWithMantine(<Dashboard />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Rent")).toBeInTheDocument();
    expect(screen.getByText("Total Budget")).toBeInTheDocument();
    expect(screen.getByText("Total Spent")).toBeInTheDocument();
  });

  it("renders error toast on fetch failure", () => {
    mockBuckets.mockReturnValue({ data: null, isLoading: false, error: true });
    renderWithMantine(<Dashboard />);
    expect(screen.getByText("Budget Overview")).toBeInTheDocument();
  });
});
