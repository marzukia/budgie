import { useInsightSummary, useInsightMonthly } from "../../stores";
import { formatCurrency } from "../../api/format";
import {
  Stack,
  SimpleGrid,
  Title,
  Text,
  Paper,
  Table,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Insights() {
  const { data: summary, isLoading: summaryLoading } = useInsightSummary();
  const { data: monthly, isLoading: monthlyLoading } = useInsightMonthly();

  if (summaryLoading || monthlyLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const chartData =
    monthly?.map((m) => ({
      month: `${m.month}/${m.year}`,
      Budget: m.budget,
      Spent: m.spent,
    })) ?? [];

  return (
    <Stack gap="xl">
      <Title order={2}>Insights</Title>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl">
        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="lg">Monthly Summary</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Month</Table.Th>
                <Table.Th>Year</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Budget</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Spent</Table.Th>
                <Table.Th style={{ textAlign: "right" }}>Remaining</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(summary ?? []).length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center" py="md" size="sm">No data yet</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                summary?.map((row, i) => {
                  const remaining = row.remaining;
                  return (
                    <Table.Tr key={i}>
                      <Table.Td>{row.month}</Table.Td>
                      <Table.Td>{row.year}</Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        {formatCurrency(row.total_budget)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        {formatCurrency(row.total_spent)}
                      </Table.Td>
                      <Table.Td style={{ textAlign: "right" }}>
                        <Badge
                          variant="light"
                          color={remaining >= 0 ? "teal" : "red"}
                          size="sm"
                        >
                          {formatCurrency(remaining)}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Paper>

        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="lg">Budget vs Spent</Title>
          {chartData.length === 0 ? (
            <Center h={200}>
              <Text c="dimmed" size="sm">No data yet</Text>
            </Center>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-gray-2)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  contentStyle={{
                    borderRadius: "var(--mantine-radius-md)",
                    border: "1px solid var(--mantine-color-gray-2)",
                  }}
                />
                <Legend />
                <Bar dataKey="Budget" fill="var(--mantine-color-teal-5)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="var(--mantine-color-orange-5)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
