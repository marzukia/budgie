import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BucketDetail from "../../src/pages/BucketDetail/BucketDetail";

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

const mockBucket = vi.fn();
const mockTransactions = vi.fn();
const mockShares = vi.fn();

vi.mock("../../src/stores", () => ({
  useBucket: (id: number) => mockBucket(id),
  useTransactions: (id: number) => mockTransactions(id),
  useListShares: (id: number) => mockShares(id),
  useDeleteBucket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useResetBucket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useShareBucket: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRemoveShare: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUserSearch: () => ({ data: [], isLoading: false }),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

const bucketData = {
  id: 1,
  name: "Groceries",
  amount: 200.0,
  spent: 50.0,
  currency: "AUD",
  distribute_to_period: "monthly",
};

const txData = [
  { id: 1, amount: 25.0, notes: "Weekly shop", spent_at: "2025-01-15T00:00:00Z", deleted_at: null },
];

describe("BucketDetail", () => {
  it("renders loading state", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1" } });
    mockBucket.mockReturnValue({ data: null, isLoading: true });
    mockTransactions.mockReturnValue({ data: null, isLoading: false });
    mockShares.mockReturnValue({ data: [] });
    renderWithMantine(<BucketDetail />);
    expect(screen.queryByText("Budget")).not.toBeInTheDocument();
  });

  it("renders bucket info and transaction list", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1" } });
    mockBucket.mockReturnValue({ data: bucketData, isLoading: false });
    mockTransactions.mockReturnValue({ data: txData, isLoading: false });
    mockShares.mockReturnValue({ data: [] });
    renderWithMantine(<BucketDetail />);
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("$200.00")).toBeInTheDocument();
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("renders deleted bucket message", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/999" } });
    mockBucket.mockReturnValue({ data: null, isLoading: false });
    mockTransactions.mockReturnValue({ data: null, isLoading: false });
    mockShares.mockReturnValue({ data: [] });
    renderWithMantine(<BucketDetail />);
    expect(screen.getByText("Bucket not found")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1" } });
    mockBucket.mockReturnValue({ data: null, isLoading: false });
    mockTransactions.mockReturnValue({ data: null, isLoading: false, error: true });
    mockShares.mockReturnValue({ data: [] });
    renderWithMantine(<BucketDetail />);
    expect(screen.getByText("Bucket not found")).toBeInTheDocument();
  });
});
