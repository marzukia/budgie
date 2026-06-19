import {
  Button,
  Center,
  ColorInput,
  Group,
  Loader,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useBucket, useCreateBucket, useUpdateBucket } from "../../stores";

export default function BucketForm() {
  const navigate = useNavigate();
  const { location } = useRouterState();

  // Extract id from pathname: /buckets/123/edit → 123, /buckets/new → null
  const match = location.pathname.match(/\/buckets\/(\d+)\/edit/);
  const id = match ? Number(match[1]) : null;
  const isEdit = id !== null;

  const { data: existingBucket, isLoading } = useBucket(id ?? 0);
  const createBucket = useCreateBucket();
  const updateBucket = useUpdateBucket();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [description, setDescription] = useState("");
  const [currency, setCurrency] = useState("AUD");
  const [color, setColor] = useState("#20c997");
  const [icon, setIcon] = useState("wallet");
  const [distributeToPeriod, setDistributeToPeriod] = useState("monthly");

  useEffect(() => {
    if (existingBucket && isEdit) {
      setName(existingBucket.name);
      setAmount(existingBucket.amount);
      setDescription(existingBucket.description ?? "");
      setCurrency(existingBucket.currency);
      setColor(existingBucket.color);
      setIcon(existingBucket.icon);
      setDistributeToPeriod(existingBucket.distribute_to_period);
    }
  }, [existingBucket, isEdit]);

  if (isEdit && isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const handleSubmit = async () => {
    const body = {
      name,
      amount: Number(amount),
      description: description || undefined,
      currency,
      color,
      icon,
      distribute_to_period: distributeToPeriod,
    };

    if (isEdit) {
      // biome-ignore lint/style/noNonNullAssertion: isEdit is only true when id is not null
      await updateBucket.mutateAsync({ id: id!, data: body });
    } else {
      await createBucket.mutateAsync(body);
    }
    navigate({ to: "/" });
  };

  const isPending = createBucket.isPending || updateBucket.isPending;

  return (
    <Stack gap="xl" maw={600}>
      <Title order={2}>{isEdit ? "Edit Bucket" : "New Bucket"}</Title>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g. Groceries"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            required
          />
          <SimpleGrid cols={2} spacing="md">
            <NumberInput
              label="Amount"
              placeholder="500.00"
              value={amount}
              onChange={setAmount}
              prefix="$"
              decimalScale={2}
              min={0}
              required
            />
            <Select
              label="Currency"
              value={currency}
              onChange={(v) => setCurrency(v ?? "AUD")}
              data={[
                { value: "AUD", label: "AUD — Australian Dollar" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "EUR", label: "EUR — Euro" },
              ]}
            />
          </SimpleGrid>

          <Textarea
            label="Description"
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.currentTarget.value)}
            rows={2}
          />

          <SimpleGrid cols={2} spacing="md">
            <ColorInput label="Colour" value={color} onChange={setColor} format="hex" />
            <Select
              label="Period"
              value={distributeToPeriod}
              onChange={(v) => setDistributeToPeriod(v ?? "monthly")}
              data={[
                { value: "monthly", label: "Monthly" },
                { value: "weekly", label: "Weekly" },
                { value: "fortnightly", label: "Fortnightly" },
              ]}
            />
          </SimpleGrid>

          <TextInput
            label="Icon"
            placeholder="wallet"
            value={icon}
            onChange={(e) => setIcon(e.currentTarget.value)}
            description="Icon name (e.g. wallet, home, car)"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => navigate({ to: "/" })}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={isPending}>
              {isEdit ? "Save Changes" : "Create Bucket"}
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
