import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, Card, FormField, Select, Spinner, TextInput } from "../../components";
import { useBucket, useCreateBucket, useUpdateBucket } from "../../stores";
import styles from "./BucketForm.module.css";

export default function BucketForm() {
  const params = useParams({ from: "/buckets/$id/edit" });
  const id = params.id ? Number(params.id) : null;
  const navigate = useNavigate();
  const isEdit = id !== null;

  const { data: existingBucket, isLoading } = useBucket(id ?? 0);
  const createBucket = useCreateBucket();
  const updateBucket = useUpdateBucket();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [color, setColor] = useState("#3B82F6");
  const [icon, setIcon] = useState("wallet");
  const [distributeToPeriod, setDistributeToPeriod] = useState("monthly");

  useEffect(() => {
    if (existingBucket && isEdit) {
      setName(existingBucket.name);
      setAmount(String(existingBucket.amount));
      setDescription(existingBucket.description ?? "");
      setCurrency(existingBucket.currency);
      setColor(existingBucket.color);
      setIcon(existingBucket.icon);
      setDistributeToPeriod(existingBucket.distribute_to_period);
    }
  }, [existingBucket, isEdit]);

  if (isEdit && isLoading) return <Spinner size="lg" />;

  const handleSubmit = async () => {
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount)) return;
    const body = {
      name,
      amount: parsedAmount,
      description: description || undefined,
      currency,
      color,
      icon,
      distribute_to_period: distributeToPeriod,
    };

    if (isEdit) {
      await updateBucket.mutateAsync({ id: id!, data: body });
    } else {
      await createBucket.mutateAsync(body);
    }
    navigate({ to: "/" });
  };

  return (
    <div className={styles.root}>
      <Card title={isEdit ? "Edit Bucket" : "New Bucket"}>
        <div className={styles.form}>
          <FormField label="Name" required>
            <TextInput value={name} onChange={setName} placeholder="e.g. Groceries" />
          </FormField>
          <FormField label="Amount" required>
            <TextInput
              value={amount}
              onChange={setAmount}
              type="number"
              placeholder="e.g. 500.00"
            />
          </FormField>
          <FormField label="Description">
            <TextInput
              value={description}
              onChange={setDescription}
              placeholder="Optional description"
              multiline
            />
          </FormField>
          <FormField label="Currency">
            <Select
              value={currency}
              onChange={setCurrency}
              options={[
                { value: "AUD", label: "AUD" },
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
              ]}
            />
          </FormField>
          <FormField label="Color">
            <TextInput value={color} onChange={setColor} placeholder="#3B82F6" />
          </FormField>
          <FormField label="Icon">
            <TextInput value={icon} onChange={setIcon} placeholder="wallet" />
          </FormField>
          <FormField label="Distribute To Period">
            <Select
              value={distributeToPeriod}
              onChange={setDistributeToPeriod}
              options={[
                { value: "monthly", label: "Monthly" },
                { value: "weekly", label: "Weekly" },
                { value: "fortnightly", label: "Fortnightly" },
              ]}
            />
          </FormField>
          <Button onClick={handleSubmit} loading={createBucket.isPending || updateBucket.isPending}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
