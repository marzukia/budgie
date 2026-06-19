import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Transactions from "../../src/pages/Transactions/Transactions";

const mockNavigate = vi.fn();
const mockRouterState = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
  useRouterState: () => mockRouterState(),
}));

const mockTransactions = vi.fn();
const mockSoftDelete = vi.fn();
const mockUndoDelete = vi.fn();

vi.mock("../../src/stores", () => ({
  useTransactions: (id: number, includeDeleted: boolean) => mockTransactions(id, includeDeleted),
  useSoftDeleteTransaction: () => ({ mutateAsync: mockSoftDelete, isPending: false }),
  useUndoDeleteTransaction: () => ({ mutateAsync: mockUndoDelete, isPending: false }),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

const txData = [
  { id: 1, amount: 25.0, notes: "Weekly shop", spent_at: "2025-01-15T00:00:00Z", deleted_at: null },
  { id: 2, amount: 50.0, notes: "Restaurant", spent_at: "2025-01-16T00:00:00Z", deleted_at: "2025-01-20T00:00:00Z" },
];

describe("Transactions", () => {
  it("renders loading state", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1/transactions" } });
    mockTransactions.mockReturnValue({ data: null, isLoading: true });
    renderWithMantine(<Transactions />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("renders transaction list", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1/transactions" } });
    mockTransactions.mockReturnValue({ data: txData, isLoading: false });
    renderWithMantine(<Transactions />);
    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("Weekly shop")).toBeInTheDocument();
  });

  it("renders empty state", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1/transactions" } });
    mockTransactions.mockReturnValue({ data: [], isLoading: false });
    renderWithMantine(<Transactions />);
    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1/transactions" } });
    mockTransactions.mockReturnValue({ data: null, isLoading: false, error: true });
    renderWithMantine(<Transactions />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });
});
