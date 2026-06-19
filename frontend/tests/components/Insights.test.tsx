import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Insights from "../../src/pages/Insights/Insights";

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

const mockSummary = vi.fn();
const mockMonthly = vi.fn();

vi.mock("../../src/stores", () => ({
  useInsightSummary: () => mockSummary(),
  useInsightMonthly: () => mockMonthly(),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

const summaryData = [
  { month: 1, year: 2025, total_budget: 1000, total_spent: 400, remaining: 600 },
];

const monthlyData = [
  { month: 1, year: 2025, budget: 100000, spent: 40000 },
];

describe("Insights", () => {
  it("renders loading state", () => {
    mockSummary.mockReturnValue({ data: null, isLoading: true });
    mockMonthly.mockReturnValue({ data: null, isLoading: true });
    renderWithMantine(<Insights />);
    expect(screen.queryByText("Insights")).not.toBeInTheDocument();
  });

  it("renders summary and chart with data", () => {
    mockSummary.mockReturnValue({ data: summaryData, isLoading: false });
    mockMonthly.mockReturnValue({ data: monthlyData, isLoading: false });
    renderWithMantine(<Insights />);
    expect(screen.getByText("Monthly Summary")).toBeInTheDocument();
    expect(screen.getByText("Budget vs Spent")).toBeInTheDocument();
    expect(screen.getByText("$1000.00")).toBeInTheDocument();
  });

  it("renders empty data message", () => {
    mockSummary.mockReturnValue({ data: [], isLoading: false });
    mockMonthly.mockReturnValue({ data: [], isLoading: false });
    renderWithMantine(<Insights />);
    const noDataElements = screen.getAllByText("No data yet");
    expect(noDataElements.length).toBe(2);
  });

  it("renders error state", () => {
    mockSummary.mockReturnValue({ data: null, isLoading: false, error: true });
    mockMonthly.mockReturnValue({ data: null, isLoading: false, error: true });
    renderWithMantine(<Insights />);
    expect(screen.getByText("Insights")).toBeInTheDocument();
  });
});
