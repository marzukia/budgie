import type { ReactNode } from "react";
import styles from "./Table.module.css";

interface TableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onSort?: (key: string) => void;
}

export function Table<T>({
  columns,
  rows,
  loading = false,
  emptyMessage = "No data",
  onSort,
}: TableProps<T>) {
  if (!loading && rows.length === 0) {
    return <div className={styles.empty}>{emptyMessage}</div>;
  }

  return (
    <table className={`${styles.root} ${loading ? styles.withLoading : ""}`}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`${col.sortable ? styles.sortable : ""} ${col.align === "right" ? styles.alignRight : ""}`}
              onClick={() => col.sortable && onSort?.(col.key)}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key}>{/* skeleton — CSS handles opacity */}</td>
                ))}
              </tr>
            ))
          : rows.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === "right" ? styles.alignRight : ""}
                    data-label={col.header || undefined}
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
      </tbody>
    </table>
  );
}
