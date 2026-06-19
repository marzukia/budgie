import { useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useCreateTransaction, useUpdateTransaction } from "../../stores";
import {
  Stack,
  Title,
  NumberInput,
  Textarea,
  TextInput,
  Button,
  Group,
  Paper,
} from "@mantine/core";

export default function TransactionForm() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  // /buckets/3/transactions/new  → bucketId=3, transactionId=null
  // /transactions/7/edit         → bucketId=null, transactionId=7
  const newMatch = location.pathname.match(/\/buckets\/(\d+)\/transactions\/new/);
  const editMatch = location.pathname.match(/\/transactions\/(\d+)\/edit/);

  const bucketId = newMatch ? Number(newMatch[1]) : null;
  const transactionId = editMatch ? Number(editMatch[1]) : null;
  const isEdit = transactionId !== null;

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  const [amount, setAmount] = useState<number | string>("");
  const [notes, setNotes] = useState("");
  const [spentAt, setSpentAt] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = async () => {
    const spentAtDate = new Date(spentAt).toISOString();
    if (isEdit && transactionId) {
      await updateTx.mutateAsync({
        id: transactionId,
        data: {
          amount: Number(amount),
          notes: notes || undefined,
          spent_at: spentAtDate,
        },
      });
    } else if (bucketId) {
      await createTx.mutateAsync({
        bucketId,
        data: {
          bucket_id: bucketId,
          amount: Number(amount),
          notes: notes || undefined,
          spent_at: spentAtDate,
        },
      });
    }
    navigate({ to: `/buckets/${bucketId}/transactions` });
  };

  const isPending = createTx.isPending || updateTx.isPending;

  return (
    <Stack gap="xl" maw={480}>
      <Title order={2}>{isEdit ? "Edit Transaction" : "New Transaction"}</Title>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <NumberInput
            label="Amount"
            placeholder="50.00"
            value={amount}
            onChange={setAmount}
            prefix="$"
            decimalScale={2}
            min={0}
            required
          />
          <Textarea
            label="Notes"
            placeholder="What was this for?"
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
            rows={2}
          />
          <TextInput
            label="Date"
            type="datetime-local"
            value={spentAt}
            onChange={(e) => setSpentAt(e.currentTarget.value)}
          />

          <Group justify="flex-end" mt="md">
            <Button
              variant="default"
              onClick={() => navigate({ to: `/buckets/${bucketId}/transactions` })}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isPending}>
              {isEdit ? "Save Changes" : "Add Transaction"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
