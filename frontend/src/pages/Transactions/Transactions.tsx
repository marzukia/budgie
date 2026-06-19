import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Paper,
  Stack,
  Switch,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowBackUp, IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useSoftDeleteTransaction, useTransactions, useUndoDeleteTransaction } from "../../stores";

export default function Transactions() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const idMatch = location.pathname.match(/\/buckets\/(\d+)/);
  const id = idMatch ? Number(idMatch[1]) : 0;
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const { data: transactions, isLoading } = useTransactions(id, includeDeleted);
  const softDelete = useSoftDeleteTransaction();
  const undoDelete = useUndoDeleteTransaction();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (deleteId !== null) {
      await softDelete.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleUndo = async (txId: number) => {
    await undoDelete.mutateAsync(txId);
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Transactions</Title>
        <Group gap="md">
          <Switch
            label="Show deleted"
            checked={includeDeleted}
            onChange={(e) => setIncludeDeleted(e.currentTarget.checked)}
            size="sm"
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate({ to: `/buckets/${id}/transactions/new` })}
          >
            Add Transaction
          </Button>
        </Group>
      </Group>

      <Paper withBorder p="lg" radius="md">
        {isLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(transactions ?? []).length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5}>
                    <Text c="dimmed" ta="center" py="xl" size="sm">
                      No transactions
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                transactions?.map((tx) => (
                  <Table.Tr key={tx.id} style={{ opacity: tx.deleted_at ? 0.6 : 1 }}>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text fw={600} c={tx.deleted_at ? "dimmed" : undefined}>
                        ${tx.amount.toFixed(2)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={tx.notes ? undefined : "dimmed"}>
                        {tx.notes ?? "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{new Date(tx.spent_at).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      {tx.deleted_at && (
                        <Badge color="orange" variant="light" size="sm">
                          Deleted
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap={4} justify="flex-end">
                        <Tooltip label="Edit">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={() => navigate({ to: `/transactions/${tx.id}/edit` })}
                          >
                            <IconEdit size={15} />
                          </ActionIcon>
                        </Tooltip>
                        {tx.deleted_at ? (
                          <Tooltip label="Restore">
                            <ActionIcon
                              variant="subtle"
                              color="teal"
                              onClick={() => handleUndo(tx.id)}
                            >
                              <IconArrowBackUp size={15} />
                            </ActionIcon>
                          </Tooltip>
                        ) : (
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              onClick={() => setDeleteId(tx.id)}
                            >
                              <IconTrash size={15} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Transaction"
      >
        <Text mb="xl">
          Are you sure you want to delete this transaction? It will be soft-deleted and can be
          restored.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={softDelete.isPending}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
