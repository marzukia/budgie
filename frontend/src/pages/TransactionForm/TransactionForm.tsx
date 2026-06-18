import { useNavigate, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card, FormField, TextInput } from "../../components";
import { useCreateTransaction, useUpdateTransaction } from "../../stores";
import styles from "./TransactionForm.module.css";

export default function TransactionForm() {
  const router = useRouter();
  const routeId = router.state.currentRoute.id as string;

  // useParams throws when the route pattern doesn't match the current route.
  // Only call the pattern that matches the current route.
  const params = routeId.endsWith("buckets/$id/transactions/new")
    ? useParams({ from: "/buckets/$id/transactions/new" })
    : useParams({ from: "/transactions/$transactionId/edit" });

  const bucketId = routeId.endsWith("buckets/$id/transactions/new") && params.id
    ? Number(params.id) : null;
  const transactionId = routeId.endsWith("transactions/$transactionId/edit") && params.transactionId
    ? Number(params.transactionId) : null;
  const isEdit = transactionId !== null;

  const navigate = useNavigate();

  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [spentAt, setSpentAt] = useState(new Date().toISOString().slice(0, 16));

  useEffect(() => {
    if (isEdit) {
      // In a real app, fetch the transaction to pre-fill
    }
  }, [isEdit]);

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) return;
    const spentAtDate = new Date(spentAt).toISOString();
    if (isEdit && transactionId) {
      await updateTx.mutateAsync({
        id: transactionId,
        data: {
          amount: parsedAmount,
          notes: notes || undefined,
          spent_at: spentAtDate,
        },
      });
    } else if (bucketId) {
      await createTx.mutateAsync({
        bucketId,
        data: {
          bucket_id: bucketId,
          amount: parsedAmount,
          notes: notes || undefined,
          spent_at: spentAtDate,
        },
      });
    }
    navigate({ to: `/buckets/${bucketId}/transactions` });
  };

  return (
    <div className={styles.root}>
      <Card title={isEdit ? "Edit Transaction" : "New Transaction"}>
        <div className={styles.form}>
          <FormField label="Amount" required>
            <TextInput value={amount} onChange={setAmount} type="number" placeholder="e.g. 50.00" />
          </FormField>
          <FormField label="Notes">
            <TextInput value={notes} onChange={setNotes} placeholder="Optional notes" multiline />
          </FormField>
          <FormField label="Date">
            <TextInput value={spentAt} onChange={setSpentAt} placeholder="2024-01-01T12:00" />
          </FormField>
          <Button onClick={handleSubmit} loading={createTx.isPending || updateTx.isPending}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </Card>
    </div>
  );
}