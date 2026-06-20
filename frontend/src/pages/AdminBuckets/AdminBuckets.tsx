import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { formatCurrency } from "../../api/format";
import type { components } from "../../api/generated";
import { useAdminBuckets, useCreateBucket, useDeleteBucket, useUpdateBucket } from "../../stores";

type BucketResponse = components["schemas"]["BucketResponse"];

export default function AdminBuckets() {
  const { data: buckets, isLoading } = useAdminBuckets();
  const createBucket = useCreateBucket();
  const updateBucket = useUpdateBucket();
  const deleteBucket = useDeleteBucket();

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState<number | string>("");
  const [currency, setCurrency] = useState("AUD");
  const [color, setColor] = useState("#20c997");
  const [icon, setIcon] = useState("wallet");
  const [distributeToPeriod, setDistributeToPeriod] = useState("monthly");

  const resetForm = () => {
    setName("");
    setAmount("");
    setCurrency("AUD");
    setColor("#20c997");
    setIcon("wallet");
    setDistributeToPeriod("monthly");
  };

  const handleCreate = async () => {
    await createBucket.mutateAsync({
      name,
      amount: Number(amount),
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
    await updateBucket.mutateAsync({
      id: editId,
      data: {
        name: name || undefined,
        amount: Number(amount) || undefined,
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

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const formFields = (
    <Stack gap="md">
      <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
      <NumberInput
        label="Amount"
        value={amount}
        onChange={setAmount}
        prefix="$"
        decimalScale={2}
        min={0}
      />
      <Select
        label="Currency"
        value={currency}
        onChange={(v) => setCurrency(v ?? "AUD")}
        data={[
          { value: "AUD", label: "AUD" },
          { value: "USD", label: "USD" },
          { value: "EUR", label: "EUR" },
        ]}
      />
    </Stack>
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>All Buckets</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setShowCreate(true)}>
          Create Bucket
        </Button>
      </Group>

      <Paper withBorder radius="md" p="lg">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Owner</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Budget</Table.Th>
              <Table.Th style={{ textAlign: "right" }}>Spent</Table.Th>
              <Table.Th>Currency</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(buckets ?? []).length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text c="dimmed" ta="center" py="md" size="sm">
                    No buckets
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              ((buckets ?? []) as BucketResponse[]).map((b) => (
                <Table.Tr key={b.id}>
                  <Table.Td>
                    <Text fw={500} size="sm">
                      {b.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{b.owner_name}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text size="sm">{formatCurrency(b.amount)}</Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "right" }}>
                    <Text size="sm" c="orange">
                      {formatCurrency(b.spent)}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color="teal" size="sm">
                      {b.currency}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => {
                          setEditId(b.id);
                          setName(b.name);
                          setAmount(b.amount);
                          setCurrency(b.currency);
                          setColor(b.color);
                          setIcon(b.icon);
                          setDistributeToPeriod(b.distribute_to_period);
                        }}
                      >
                        <IconEdit size={15} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => setDeleteId(b.id)}>
                        <IconTrash size={15} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Create Bucket">
        {formFields}
        <Group justify="flex-end" mt="xl">
          <Button variant="default" onClick={() => setShowCreate(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={createBucket.isPending}>
            Create
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={editId !== null}
        onClose={() => {
          setEditId(null);
          resetForm();
        }}
        title="Edit Bucket"
      >
        {formFields}
        <Group justify="flex-end" mt="xl">
          <Button
            variant="default"
            onClick={() => {
              setEditId(null);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleEdit} loading={updateBucket.isPending}>
            Save
          </Button>
        </Group>
      </Modal>

      <Modal opened={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete Bucket">
        <Text mb="xl">Are you sure you want to delete this bucket?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={deleteBucket.isPending}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
