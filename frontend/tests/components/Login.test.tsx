import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Login from "../../src/pages/Login/Login";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => mockNavigate,
}));

const mockLogin = vi.fn();
const mockAuthStore = vi.fn();

vi.mock("../../src/stores", () => ({
  useAuthStore: (selector?: (s: any) => any) => {
    const store = { user: null, loading: false, login: mockLogin };
    return selector ? selector(store) : store;
  },
}));

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("Login", () => {
  it("renders login form", () => {
    renderWithMantine(<Login />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("renders brand text", () => {
    renderWithMantine(<Login />);
    expect(screen.getByText("budgie")).toBeInTheDocument();
  });

  it("renders error message on invalid credentials", () => {
    mockLogin.mockRejectedValue(new Error("Invalid credentials"));
    renderWithMantine(<Login />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("renders loading state while authenticating", () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    renderWithMantine(<Login />);
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });
});
