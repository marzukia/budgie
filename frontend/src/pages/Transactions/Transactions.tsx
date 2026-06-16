import { useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import {
  useTransactions,
  useSoftDeleteTransaction,
  useUndoDeleteTransaction,
} from "../../stores";
import {
  Card,
  Table,
  Button,
  Pill,
  Modal,
  Tooltip,
  Spinner,
} from "../../components";
import styles from "./Transactions.module.css";

export default function Transactions() {
  const params = useParams({ from: "/buckets/$id/transactions" });
  const id = Number(params.id);
  const navigate = useNavigate();
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

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Button
          variant="primary"
          onClick={() =>
            navigate({ to: `/buckets/${id}/transactions/new` })
          }
        >
          Add Transaction
        </Button>
        <div className={styles.filter}>
          <label>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={() => setIncludeDeleted(!includeDeleted)}
            />{" "}
            Include deleted
          </label>
        </div>
      </div>

      <Card title="Transactions">
        <Table
          columns={[
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (row) => <span>${row.amount.toFixed(2)}</span>,
            },
            { key: "notes", header: "Notes" },
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
                      onClick={() =>
                        navigate({
                          to: `/transactions/${row.id}/edit`,
                        })
                      }
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
          loading={isLoading}
          emptyMessage="No transactions"
        />
      </Card>

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
        <p>Are you sure you want to soft-delete this transaction?</p>
      </Modal>
    </div>
  );
}
