import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "../../src/components/Table";

interface TestRow {
  id: number;
  name: string;
  amount: number;
}

describe("Table", () => {
  const columns = [
    { key: "id", header: "ID" },
    { key: "name", header: "Name" },
    { key: "amount", header: "Amount", align: "right" as const, render: (r: TestRow) => `$${r.amount}` },
  ];
  const rows: TestRow[] = [
    { id: 1, name: "Item A", amount: 100 },
    { id: 2, name: "Item B", amount: 200 },
  ];

  it("renders headers and rows", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
    expect(screen.getByText("Item A")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("renders empty message when no rows and not loading", () => {
    render(<Table columns={columns} rows={[]} emptyMessage="No data" />);
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.queryByText("ID")).not.toBeInTheDocument();
  });

  it("renders skeleton rows when loading even with empty rows", () => {
    render(<Table columns={columns} rows={[]} loading={true} />);
    // Should still render table headers
    expect(screen.getByText("ID")).toBeInTheDocument();
  });

  it("renders loading skeleton when loading has rows", () => {
    render(<Table columns={columns} rows={rows} loading={true} />);
    expect(screen.getByText("ID")).toBeInTheDocument();
  });

  it("renders with sortable columns", () => {
    const cols = [
      { key: "name", header: "Name", sortable: true },
    ];
    render(<Table columns={cols} rows={[{ name: "A" }]} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("renders custom render function", () => {
    render(<Table columns={columns} rows={rows} />);
    expect(screen.getByText("$100")).toBeInTheDocument();
  });

  it("renders with empty columns array", () => {
    render(<Table columns={[]} rows={rows} />);
    expect(screen.queryByText("Item A")).not.toBeInTheDocument();
  });

  it("renders with single row", () => {
    render(<Table columns={columns} rows={[{ id: 1, name: "Solo", amount: 50 }]} />);
    expect(screen.getByText("Solo")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
  });

  it("renders with default empty message", () => {
    render(<Table columns={columns} rows={[]} />);
    expect(screen.getByText("No data")).toBeInTheDocument();
  });

  it("calls onSort when sortable header clicked", () => {
    let sortKey = "";
    const cols = [{ key: "name", header: "Name", sortable: true }];
    render(<Table columns={cols} rows={[{ name: "A" }]} onSort={(k) => { sortKey = k; }} />);
    screen.getByText("Name").click();
    expect(sortKey).toBe("name");
  });
});
