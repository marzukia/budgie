import { useState } from "react";
import {
  useAdminTransactions,
  useAdminUpdateTransaction,
  useAdminSoftDeleteTransaction,
  useAdminUndoDeleteTransaction,
} from "../../stores";
import {
  Card,
  Table,
  Button,
  Modal,
  FormField,
  TextInput,
  Tooltip,
  Pill,
  Spinner,
} from "../../components";
import styles from "./AdminTransactions.module.css";

export default function AdminTransactions() {
  const { data: transactions, isLoading } = useAdminTransactions();
  const updateTx = useAdminUpdateTransaction();
  const softDelete = useAdminSoftDeleteTransaction();
  const undoDelete = useAdminUndoDeleteTransaction();

  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState("");
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

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className={styles.root}>
      <Card title="All Transactions">
        <Table
          columns={[
            { key: "id", header: "ID" },
            { key: "bucket_id", header: "Bucket" },
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (row) => `$${row.amount.toFixed(2)}`,
            },
            { key: "notes", header: "Notes" },
            { key: "user_id", header: "User" },
            {
              key: "spent_at",
              header: "Date",
              render: (row) =>
                new Date(row.spent_at).toLocaleDateString(),
            },
            {
              key: "deleted_at",
              header: "Status",
              render: (row) =>
                row.deleted_at ? (
                  <Pill label="Deleted" variant="warning" />
                ) : null,
            },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <div style={{ display: "flex", gap: 4 }}>
                  <Tooltip content="Edit">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditId(row.id);
                        setEditAmount(String(row.amount));
                        setEditNotes(row.notes ?? "");
                      }}
                    >
                      ✏️
                    </Button>
                  </Tooltip>
                  {row.deleted_at ? (
                    <Tooltip content="Undo delete">
                      <Button
                        variant="ghost"
                        onClick={() => handleUndo(row.id)}
                      >
                        ↩️
                      </Button>
                    </Tooltip>
                  ) : (
                    <Tooltip content="Soft delete">
                      <Button
                        variant="ghost"
                        onClick={() => setDeleteId(row.id)}
                      >
                        🗑️
                      </Button>
                    </Tooltip>
                  )}
                </div>
              ),
            },
          ]}
          rows={transactions ?? []}
          emptyMessage="No transactions"
        />
      </Card>

      <Modal
        open={editId !== null}
        onClose={() => setEditId(null)}
        title="Edit Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEdit}>
              Update
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <FormField label="Amount">
            <TextInput
              value={editAmount}
              onChange={setEditAmount}
              type="number"
            />
          </FormField>
          <FormField label="Notes">
            <TextInput
              value={editNotes}
              onChange={setEditNotes}
              multiline
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Transaction"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure?</p>
      </Modal>
    </div>
  );
}
