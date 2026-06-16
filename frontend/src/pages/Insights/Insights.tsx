import { useInsightSummary, useInsightMonthly } from "../../stores";
import { Card, Spinner, Table } from "../../components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./Insights.module.css";

export default function Insights() {
  const { data: summary, isLoading: summaryLoading } = useInsightSummary();
  const { data: monthly, isLoading: monthlyLoading } = useInsightMonthly();

  if (summaryLoading || monthlyLoading) return <Spinner size="lg" />;

  const chartData =
    monthly?.map((m) => ({
      month: `${m.month}/${m.year}`,
      budget: m.budget,
      spent: m.spent,
    })) ?? [];

  return (
    <div className={styles.root}>
      <h2>Insights</h2>

      <div className={styles.grid}>
        <Card title="Monthly Summary">
          <Table
            columns={[
              { key: "month", header: "Month" },
              { key: "year", header: "Year" },
              {
                key: "total_budget",
                header: "Budget",
                align: "right",
                render: (row) => `$${row.total_budget.toFixed(2)}`,
              },
              {
                key: "total_spent",
                header: "Spent",
                align: "right",
                render: (row) => `$${row.total_spent.toFixed(2)}`,
              },
              {
                key: "remaining",
                header: "Remaining",
                align: "right",
                render: (row) => `$${row.remaining.toFixed(2)}`,
              },
            ]}
            rows={summary ?? []}
            emptyMessage="No summary data"
          />
        </Card>

        <Card title="Monthly Trend">
          <div className={styles.chartWrap}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip />
                <Bar dataKey="budget" fill="var(--color-accent)" />
                <Bar dataKey="spent" fill="var(--color-danger)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
