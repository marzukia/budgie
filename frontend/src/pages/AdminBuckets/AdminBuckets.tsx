import { useState } from "react";
import { formatCurrency } from "../../api/format";
import type { components } from "../../api/generated";
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
import { useAdminBuckets, useCreateBucket, useDeleteBucket, useUpdateBucket } from "../../stores";

type BucketResponse = components["schemas"]["BucketResponse"];
import styles from "./AdminBuckets.module.css";

export default function AdminBuckets() {
  const { data: buckets, isLoading } = useAdminBuckets();
  const createBucket = useCreateBucket();
  const updateBucket = useUpdateBucket();
  const deleteBucket = useDeleteBucket();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("wallet");
  const [distributeToPeriod, setDistributeToPeriod] = useState("monthly");

  const resetForm = () => {
    setName("");
    setAmount("");
    setCurrency("AUD");
    setColor("#3B82F6");
    setIcon("wallet");
    setDistributeToPeriod("monthly");
  };

  const handleCreate = async () => {
    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) return;
    await createBucket.mutateAsync({
      name,
      amount: parsedAmount,
      currency,
      color,
      icon,
      distribute_to_period: distributeToPeriod,
    });
    setShowCreate(false);
    resetForm();
  };

  const handleEdit = async () => {
    if (editId === null) return;
    const parsedAmount = Number(amount);
    await updateBucket.mutateAsync({
      id: editId,
      data: {
        name: name || undefined,
        amount: Number.isNaN(parsedAmount) ? undefined : parsedAmount,
        currency: currency || undefined,
        color: color || undefined,
        icon: icon || undefined,
        distribute_to_period: distributeToPeriod || undefined,
      },
    });
    setEditId(null);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteBucket.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Button onClick={() => setShowCreate(true)}>Create Bucket</Button>
      </div>

      <Card title="All Buckets">
        <Table
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Name" },
            { key: "owner_id", header: "Owner" },
            {
              key: "amount",
              header: "Amount",
              align: "right",
              render: (row) => formatCurrency(row.amount, row.currency),
            },
            {
              key: "spent",
              header: "Spent",
              align: "right",
              render: (row) => formatCurrency(row.spent, row.currency),
            },
            {
              key: "currency",
              header: "Currency",
              render: (row) => <Pill label={row.currency} />,
            },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditId(row.id);
                      setName(row.name);
                      setAmount(String(row.amount));
                      setCurrency(row.currency);
                      setColor(row.color);
                      setIcon(row.icon);
                      setDistributeToPeriod(row.distribute_to_period);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => setDeleteId(row.id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          rows={(buckets ?? []) as BucketResponse[]}
          emptyMessage="No buckets"
        />
      </Card>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Bucket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <FormField label="Name">
            <TextInput value={name} onChange={setName} />
          </FormField>
          <FormField label="Amount">
            <TextInput value={amount} onChange={setAmount} type="number" />
          </FormField>
          <FormField label="Currency">
            <Select
              value={currency}
              onChange={setCurrency}
              options={[
                { value: "AUD", label: "AUD" },
                { value: "USD", label: "USD" },
              ]}
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={editId !== null}
        onClose={() => setEditId(null)}
        title="Edit Bucket"
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
          <FormField label="Name">
            <TextInput value={name} onChange={setName} />
          </FormField>
          <FormField label="Amount">
            <TextInput value={amount} onChange={setAmount} type="number" />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Bucket"
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
