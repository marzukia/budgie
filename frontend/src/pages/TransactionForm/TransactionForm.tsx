import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card, FormField, TextInput } from "../../components";
import { useCreateTransaction, useUpdateTransaction } from "../../stores";
import styles from "./TransactionForm.module.css";

export default function TransactionForm() {
  const params = useParams({ from: "/buckets/$id/transactions/new" });
  const editParams = useParams({ from: "/transactions/$transactionId/edit" });
  const navigate = useNavigate();

  const bucketId = params.id ? Number(params.id) : null;
  const transactionId = editParams.transactionId ? Number(editParams.transactionId) : null;
  const isEdit = transactionId !== null;

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
        transactionId: transactionId,
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
