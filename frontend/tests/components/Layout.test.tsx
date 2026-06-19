import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Layout, LoginLayout } from "../../src/components/Layout";

// Mock @tanstack/react-router Outlet — must be in vi.mock factory (hoisted)
vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}));

// Use vi.hoisted to create a shared mock function that survives hoisting
const { useAuthStore, useThemeStore } = vi.hoisted(() => {
  const mock = vi.fn().mockReturnValue({
    user: { role: "user", name: "Test User" },
    loading: false,
  });
  const useThemeStore = vi.fn().mockReturnValue({
    theme: "light",
    setTheme: vi.fn(),
  });
  return { useAuthStore: mock, useThemeStore };
});

vi.mock("../../src/stores", () => ({
  useAuthStore,
  useThemeStore,
}));

describe("Layout", () => {
  it("renders brand and topbar titles", () => {
    render(<Layout title="Budgie" />);
    expect(screen.getAllByText("Budgie")).toHaveLength(2);
  });

  it("renders nav links for non-admin user", () => {
    render(<Layout title="Budgie" />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
  });

  it("shows hamburger menu button", () => {
    render(<Layout title="Budgie" />);
    expect(screen.getByLabelText("Open menu")).toBeInTheDocument();
  });

  it("toggles sidebar open/closed via overlay click", async () => {
    render(<Layout title="Budgie" />);

    const nav = document.querySelector("nav");
    expect(nav?.className).not.toContain("sidebarOpen");

    await userEvent.click(screen.getByLabelText("Open menu"));
    expect(nav?.className).toContain("sidebarOpen");

    await userEvent.click(screen.getByLabelText("Close menu"));
    expect(nav?.className).not.toContain("sidebarOpen");
  });

  it("renders admin nav links for admin user", () => {
    useAuthStore.mockReturnValue({
      user: { role: "admin", name: "Admin" },
      loading: false,
    });
    render(<Layout title="Budgie" />);
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Buckets")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
  });

  it("does not render admin links for non-admin user", () => {
    useAuthStore.mockReturnValue({
      user: { role: "user", name: "User" },
      loading: false,
    });
    render(<Layout title="Budgie" />);
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Buckets")).not.toBeInTheDocument();
  });

  it("renders close button in sidebar", () => {
    render(<Layout title="Budgie" />);
    expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
  });
});

describe("LoginLayout", () => {
  it("renders children", () => {
    render(<LoginLayout><p>Login form</p></LoginLayout>);
    expect(screen.getByText("Login form")).toBeInTheDocument();
  });

  it("renders empty children", () => {
    render(<LoginLayout>{""}</LoginLayout>);
    expect(document.querySelector("[class*='loginLayout']")).toBeInTheDocument();
  });
});
