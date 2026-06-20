import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Layout, LoginLayout } from "../../src/components/Layout";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
  useRouterState: () => ({ location: { pathname: "/" } }),
}));

const { useAuthStore } = vi.hoisted(() => {
  const mock = vi.fn().mockReturnValue({
    user: { role: "user", name: "Test User" },
    loading: false,
  });
  return { useAuthStore: mock };
});

vi.mock("../../src/stores", () => ({
  useAuthStore,
  useBucket: vi.fn().mockReturnValue({ data: null, isLoading: false }),
  useThemeStore: vi.fn().mockReturnValue({ theme: "light", setTheme: vi.fn() }),
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("Layout", () => {
  it("renders brand text", () => {
    renderWithMantine(<Layout />);
    expect(screen.getAllByText("budgie").length).toBeGreaterThanOrEqual(1);
  });

  it("renders nav links for non-admin user", () => {
    renderWithMantine(<Layout />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("renders admin nav links for admin user", () => {
    useAuthStore.mockReturnValue({
      user: { role: "admin", name: "Admin" },
      loading: false,
    });
    renderWithMantine(<Layout />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Buckets")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("does not render admin links for non-admin user", () => {
    useAuthStore.mockReturnValue({
      user: { role: "user", name: "User" },
      loading: false,
    });
    renderWithMantine(<Layout />);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Buckets")).not.toBeInTheDocument();
  });

  it("renders outlet content", () => {
    renderWithMantine(<Layout />);
    expect(screen.getByText("Outlet content")).toBeInTheDocument();
  });
});

describe("LoginLayout", () => {
  it("renders children", () => {
    renderWithMantine(<LoginLayout><p>Login form</p></LoginLayout>);
    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("renders with children present", () => {
    const { container } = renderWithMantine(<LoginLayout><span>content</span></LoginLayout>);
    expect(container.firstChild).toBeTruthy();
  });
});
