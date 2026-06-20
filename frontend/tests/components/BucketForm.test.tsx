import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BucketForm from "../../src/pages/BucketForm/BucketForm";

const mockNavigate = vi.fn();
const mockRouterState = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
  useRouterState: () => mockRouterState(),
}));

const mockBucket = vi.fn();
const mockCreateBucket = vi.fn();
const mockUpdateBucket = vi.fn();

vi.mock("../../src/stores", () => ({
  useBucket: () => mockBucket(),
  useCreateBucket: () => ({ mutateAsync: mockCreateBucket, isPending: false }),
  useUpdateBucket: () => ({ mutateAsync: mockUpdateBucket, isPending: false }),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("BucketForm", () => {
  it("renders create form with all fields", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/new" } });
    mockBucket.mockReturnValue({ data: null, isLoading: false });
    renderWithMantine(<BucketForm />);
    expect(screen.getByText("New Bucket")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Colour")).toBeInTheDocument();
    expect(screen.getByText("wallet")).toBeInTheDocument();
  });

  it("renders create and cancel buttons", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/new" } });
    mockBucket.mockReturnValue({ data: null, isLoading: false });
    renderWithMantine(<BucketForm />);
    expect(screen.getByText("Create Bucket")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("renders edit form when id is present", () => {
    mockRouterState.mockReturnValue({
      location: { pathname: "/buckets/1/edit" },
    });
    mockBucket.mockReturnValue({ data: null, isLoading: false });
    renderWithMantine(<BucketForm />);
    expect(screen.getByText("Edit Bucket")).toBeInTheDocument();
  });

  it("renders submit loading state", () => {
    mockRouterState.mockReturnValue({ location: { pathname: "/buckets/new" } });
    mockBucket.mockReturnValue({ data: null, isLoading: false });
    renderWithMantine(<BucketForm />);
    expect(screen.getByText("Create Bucket")).toBeInTheDocument();
  });
});
