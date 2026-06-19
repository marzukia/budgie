import { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
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
  const params = useParams({ from: "/buckets/$id/transactions/new" });
  const editParams = useParams({ from: "/transactions/$transactionId/edit" });
  const navigate = useNavigate();

  const bucketId = params.id ? Number(params.id) : null;
  const transactionId = editParams.transactionId ? Number(editParams.transactionId) : null;
  const isEdit = transactionId !== null;

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  const [amount, setAmount] = useState<number | string>("");
  const [notes, setNotes] = useState("");
  const [spentAt, setSpentAt] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    // Pre-fill would go here if fetching existing transaction
  }, [isEdit]);

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
