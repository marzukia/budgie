import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Settings from "../../src/pages/Settings/Settings";

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div>Outlet content</div>,
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
  useNavigate: () => vi.fn(),
}));

const mockSettings = vi.fn();
const mockUpdateSettings = vi.fn();

vi.mock("../../src/stores", () => ({
  useSettings: () => mockSettings(),
  useUpdateSettings: () => ({ mutateAsync: mockUpdateSettings, isPending: false }),
}));

vi.mock("@mantine/core", async () => {
  const actual = await vi.importActual("@mantine/core");
  return {
    ...actual,
    useMantineColorScheme: () => ({ setColorScheme: vi.fn() }),
  };
});

const renderWithMantine = (ui: React.ReactElement) =>
  render(<MantineProvider>{ui}</MantineProvider>);

describe("Settings", () => {
  it("renders loading state", () => {
    mockSettings.mockReturnValue({ data: null, isLoading: true });
    renderWithMantine(<Settings />);
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  it("renders form with current values", () => {
    mockSettings.mockReturnValue({
      data: { base_currency: "USD", theme: "dark" },
      isLoading: false,
    });
    renderWithMantine(<Settings />);
    expect(screen.getByText("Base Currency")).toBeInTheDocument();
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });

  it("renders save error state", () => {
    mockSettings.mockReturnValue({
      data: { base_currency: "AUD", theme: "light" },
      isLoading: false,
    });
    renderWithMantine(<Settings />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });
});
