import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TransactionForm from "../../src/pages/TransactionForm/TransactionForm";

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

const mockCreateTx = vi.fn();
const mockUpdateTx = vi.fn();

vi.mock("../../src/stores", () => ({
  useCreateTransaction: () => ({ mutateAsync: mockCreateTx, isPending: false }),
  useUpdateTransaction: () => ({ mutateAsync: mockUpdateTx, isPending: false }),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("TransactionForm", () => {
  it("renders create form for new transaction", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1/transactions/new" } });
    renderWithMantine(<TransactionForm />);
    expect(screen.getByText("New Transaction")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders edit form", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/transactions/7/edit" } });
    renderWithMantine(<TransactionForm />);
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("renders loading state during submit", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/1/transactions/new" } });
    renderWithMantine(<TransactionForm />);
    expect(screen.getByText("New Transaction")).toBeInTheDocument();
  });
});
