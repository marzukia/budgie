import { Center, Loader, Paper, SimpleGrid, Stack, Table, Text, Title } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { checkError, client } from "../../api/client";
import type { components } from "../../api/generated";

type AdminSummaryResponse = components["schemas"]["AdminSummaryResponse"];

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "summary"],
    queryFn: async () => {
      const res = await client.GET("/api/admin/summary");
      checkError(res);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Users", value: data.total_users },
    { label: "Buckets", value: data.total_buckets },
    { label: "Transactions", value: data.total_transactions },
    { label: "Total Spent", value: `$${data.total_spent.toFixed(2)}` },
  ];

  return (
    <Stack gap="xl">
      <Title order={2}>Admin Dashboard</Title>

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        {stats.map((s) => (
          <Paper key={s.label} withBorder radius="md" p="xl">
            <Text size="xs" c="dimmed" tt="uppercase">
              {s.label}
            </Text>
            <Text fw={700} size="xl">
              {s.value}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      <Paper withBorder radius="md" p="lg">
        <Title order={4} mb="md">
          Recent Transactions
        </Title>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Bucket</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(data.recent_transactions ?? []).length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text c="dimmed" ta="center" py="md" size="sm">
                    No recent transactions
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              data.recent_transactions.map((tx) => (
                <Table.Tr key={tx.id}>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      #{tx.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{tx.bucket_name ?? `#${tx.bucket_id}`}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text size="sm" fw={600}>
                      ${tx.amount.toFixed(2)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{new Date(tx.spent_at).toLocaleDateString()}</Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
