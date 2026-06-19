import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconArrowBackUp, IconEdit, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import {
  useAdminSoftDeleteTransaction,
  useAdminTransactions,
  useAdminUndoDeleteTransaction,
  useAdminUpdateTransaction,
} from "../../stores";

export default function AdminTransactions() {
  const { data: transactions, isLoading } = useAdminTransactions();
  const updateTx = useAdminUpdateTransaction();
  const softDelete = useAdminSoftDeleteTransaction();
  const undoDelete = useAdminUndoDeleteTransaction();

  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number | string>("");
  const [editNotes, setEditNotes] = useState("");

  const handleEdit = async () => {
    if (editId === null) return;
    await updateTx.mutateAsync({
      id: editId,
      data: {
        amount: Number(editAmount) || undefined,
        notes: editNotes || undefined,
      },
    });
    setEditId(null);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await softDelete.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleUndo = async (txId: number) => {
    await undoDelete.mutateAsync(txId);
  };

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Stack gap="xl">
      <Title order={2}>All Transactions</Title>

      <Paper withBorder radius="md" p="lg">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Bucket</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
              <Table.Th>Notes</Table.Th>
              <Table.Th>User</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(transactions ?? []).length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text c="dimmed" ta="center" py="md" size="sm">
                    No transactions
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              transactions?.map((tx) => (
                <Table.Tr key={tx.id} style={{ opacity: tx.deleted_at ? 0.6 : 1 }}>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      #{tx.id}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">#{tx.bucket_id}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text size="sm" fw={600}>
                      ${tx.amount.toFixed(2)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={tx.notes ? undefined : "dimmed"}>
                      {tx.notes ?? "—"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c="dimmed">
                      #{tx.user_id}
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
                          onClick={() => {
                            setEditId(tx.id);
                            setEditAmount(tx.amount);
                            setEditNotes(tx.notes ?? "");
                          }}
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
      </Paper>

      <Modal opened={editId !== null} onClose={() => setEditId(null)} title="Edit Transaction">
        <Stack gap="md">
          <NumberInput
            label="Amount"
            value={editAmount}
            onChange={setEditAmount}
            prefix="$"
            decimalScale={2}
            min={0}
          />
          <Textarea
            label="Notes"
            value={editNotes}
            onChange={(e) => setEditNotes(e.currentTarget.value)}
            rows={2}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={updateTx.isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Transaction"
      >
        <Text mb="xl">Are you sure you want to soft-delete this transaction?</Text>
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
