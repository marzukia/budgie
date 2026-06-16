import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "../../src/components/Modal";

describe("Modal", () => {
  it("renders nothing when open is false", () => {
    render(<Modal open={false} onClose={() => {}} title="Modal"><p>Content</p></Modal>);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
    expect(screen.queryByText("Modal")).not.toBeInTheDocument();
  });

  it("renders content when open is true", () => {
    render(<Modal open={true} onClose={() => {}} title="Modal"><p>Content</p></Modal>);
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Modal")).toBeInTheDocument();
  });

  it("renders footer", () => {
    render(<Modal open={true} onClose={() => {}} title="M" footer={<button>OK</button>}>body</Modal>);
    expect(screen.getByText("OK")).toBeInTheDocument();
  });

  it("calls onClose when overlay is clicked", async () => {
    let closed = false;
    render(<Modal open={true} onClose={() => { closed = true; }} title="M">body</Modal>);

    // Click the overlay (outer div) — should trigger onClose
    const overlay = document.querySelector("[class*='overlay']");
    expect(overlay).toBeTruthy();
    if (overlay) await userEvent.click(overlay);
    expect(closed).toBe(true);
  });

  it("does not call onClose when inner content is clicked (stopPropagation)", async () => {
    let closed = false;
    render(<Modal open={true} onClose={() => { closed = true; }} title="M">body</Modal>);

    // Click the inner div (the root) — should NOT trigger onClose due to stopPropagation
    const inner = document.querySelector("[class*='root']");
    expect(inner).toBeTruthy();
    if (inner) await userEvent.click(inner);
    expect(closed).toBe(false);
  });

  it("calls onClose on Escape key", async () => {
    let closed = false;
    render(<Modal open={true} onClose={() => { closed = true; }} title="M">body</Modal>);
    await userEvent.keyboard("{Escape}");
    expect(closed).toBe(true);
  });

  it("does not call onClose on other key presses", async () => {
    let closed = false;
    render(<Modal open={true} onClose={() => { closed = true; }} title="M">body</Modal>);
    await userEvent.keyboard("{Enter}");
    expect(closed).toBe(false);
  });

  it("renders with empty title", () => {
    render(<Modal open={true} onClose={() => {}} title="">body</Modal>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders without footer", () => {
    render(<Modal open={true} onClose={() => {}} title="M">body</Modal>);
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});
