import { useNavigate, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { formatCurrency } from "../../api/format";
import {
  Button,
  Card,
  FormField,
  Modal,
  Pill,
  Select,
  Spinner,
  Table,
  TextInput,
} from "../../components";
import {
  useBucket,
  useDeleteBucket,
  useListShares,
  useRemoveShare,
  useResetBucket,
  useShareBucket,
  useTransactions,
} from "../../stores";
import styles from "./BucketDetail.module.css";

export default function BucketDetail() {
  const params = useParams({ from: "/buckets/$id" });
  const id = Number(params.id);
  const navigate = useNavigate();

  const { data: bucket, isLoading: bucketLoading } = useBucket(id);
  const { data: transactions, isLoading: txLoading } = useTransactions(id);
  const { data: shares } = useListShares(id);

  const deleteBucket = useDeleteBucket();
  const resetBucket = useResetBucket();
  const shareBucket = useShareBucket();
  const removeShare = useRemoveShare();

  const [showDelete, setShowDelete] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [shareUserId, setShareUserId] = useState("");
  const [sharePermission, setSharePermission] = useState("view");

  if (bucketLoading) return <Spinner size="lg" />;
  if (!bucket) return <p>Bucket not found</p>;

  const handleDelete = async () => {
    await deleteBucket.mutateAsync(id);
    navigate({ to: "/" });
  };

  const handleReset = async () => {
    await resetBucket.mutateAsync(id);
  };

  const handleShare = async () => {
    await shareBucket.mutateAsync({
      id,
      userId: Number(shareUserId),
      permission: sharePermission,
    });
    setShowShare(false);
  };

  const handleRemoveShare = async (userId: number) => {
    await removeShare.mutateAsync({ id, userId });
  };

  return (
    <div className={styles.root}>
      <Card title={bucket.name}>
        <div className={styles.info}>
          <div className={styles.balance}>{formatCurrency(bucket.amount, bucket.currency)}</div>
          <div className={styles.meta}>
            Spent {formatCurrency(bucket.spent, bucket.currency)} · {bucket.distribute_to_period} · {bucket.currency}
          </div>
          {bucket.description && <p className={styles.meta}>{bucket.description}</p>}
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => navigate({ to: `/buckets/${id}/transactions` })}
            >
              Transactions
            </Button>
            <Button variant="secondary" onClick={() => navigate({ to: `/buckets/${id}/edit` })}>
              Edit
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="ghost" onClick={() => setShowShare(true)}>
              Share
            </Button>
            <Button variant="danger" onClick={() => setShowDelete(true)}>
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {shares && shares.length > 0 && (
        <Card title="Shared With" className={styles.shareSection}>
          <Table
            columns={[
              { key: "user_id", header: "User ID" },
              { key: "permission", header: "Permission" },
              {
                key: "actions",
                header: "",
                render: (row) => (
                  <Button variant="ghost" onClick={() => handleRemoveShare(row.user_id)}>
                    Remove
                  </Button>
                ),
              },
            ]}
            rows={shares}
          />
        </Card>
      )}

      <Card title="Transactions" className={styles.transactions}>
        <Button
          variant="primary"
          onClick={() => navigate({ to: `/buckets/${id}/transactions/new` })}
        >
          Add Transaction
        </Button>
        <Table
          columns={[
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (row) => <span>{formatCurrency(row.amount)}</span>,
            },
            { key: "notes", header: "Notes" },
            {
              key: "spent_at",
              header: "Date",
              render: (row) => new Date(row.spent_at).toLocaleDateString(),
            },
            {
              key: "deleted_at",
              header: "Status",
              render: (row) => (row.deleted_at ? <Pill label="Deleted" variant="warning" /> : null),
            },
          ]}
          rows={transactions ?? []}
          loading={txLoading}
          emptyMessage="No transactions yet"
        />
      </Card>

      <Modal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        title="Delete Bucket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete this bucket?</p>
      </Modal>

      <Modal
        open={showShare}
        onClose={() => setShowShare(false)}
        title="Share Bucket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowShare(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleShare}>
              Share
            </Button>
          </>
        }
      >
        <div className={styles.shareForm}>
          <FormField label="User ID">
            <TextInput value={shareUserId} onChange={setShareUserId} type="number" />
          </FormField>
          <FormField label="Permission">
            <Select
              value={sharePermission}
              onChange={setSharePermission}
              options={[
                { value: "view", label: "View" },
                { value: "spend", label: "Spend" },
              ]}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
