import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "../../src/components/Select";

describe("Select", () => {
  const options = [
    { value: "AUD", label: "AUD" },
    { value: "USD", label: "USD" },
  ];

  it("renders options", () => {
    render(<Select value="AUD" onChange={() => {}} options={options} />);
    expect(screen.getByText("AUD")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("renders placeholder when provided", () => {
    render(<Select value="" onChange={() => {}} options={options} placeholder="Choose" />);
    expect(screen.getByText("Choose")).toBeInTheDocument();
  });

  it("calls onChange when option selected", async () => {
    let val = "";
    render(<Select value="AUD" onChange={(v) => { val = v; }} options={options} />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "USD");
    expect(val).toBe("USD");
  });

  it("is disabled when disabled prop set", () => {
    render(<Select value="AUD" onChange={() => {}} options={options} disabled />);
    expect(screen.getByRole("combobox")).toBeDisabled();
  });

  it("renders without placeholder", () => {
    render(<Select value="AUD" onChange={() => {}} options={options} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders with empty options array", () => {
    render(<Select value="" onChange={() => {}} options={[]} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("renders with single option", () => {
    render(<Select value="A" onChange={() => {}} options={[{ value: "A", label: "Only" }]} />);
    expect(screen.getByText("Only")).toBeInTheDocument();
  });
});
