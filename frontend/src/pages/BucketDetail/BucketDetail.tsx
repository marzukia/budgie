import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Menu,
  Modal,
  Paper,
  Progress,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconChevronDown,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconShare,
  IconTrash,
} from "@tabler/icons-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { formatCurrency } from "../../api/format";
import {
  useBucket,
  useDeleteBucket,
  useListShares,
  useRemoveShare,
  useResetBucket,
  useShareBucket,
  useTransactions,
} from "../../stores";

export default function BucketDetail() {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const idMatch = location.pathname.match(/\/buckets\/(\d+)/);
  const id = idMatch ? Number(idMatch[1]) : 0;

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

  if (bucketLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }
  if (!bucket) return <Text>Bucket not found</Text>;

  const pct = bucket.amount > 0 ? (bucket.spent / bucket.amount) * 100 : 0;
  const progressColor = pct > 100 ? "red" : pct > 90 ? "orange" : "teal";

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
    <Stack gap="xl">
      <Paper withBorder p="xl" radius="md">
        <Group justify="space-between" align="flex-start" mb="md">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={2}>{bucket.name}</Title>
              <Badge variant="light" color="teal">
                {bucket.currency}
              </Badge>
            </Group>
            <Text c="dimmed" size="sm">
              {bucket.distribute_to_period}
              {bucket.description && ` · ${bucket.description}`}
            </Text>
          </Stack>

          <Group gap="sm">
            <Button
              variant="light"
              leftSection={<IconPlus size={15} />}
              onClick={() => navigate({ to: `/buckets/${id}/transactions/new` })}
            >
              Add Transaction
            </Button>
            <Menu shadow="md" width={180}>
              <Menu.Target>
                <Button variant="default" rightSection={<IconChevronDown size={14} />}>
                  Actions
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={() => navigate({ to: `/buckets/${id}/edit` })}
                >
                  Edit
                </Menu.Item>
                <Menu.Item leftSection={<IconRefresh size={14} />} onClick={handleReset}>
                  Reset
                </Menu.Item>
                <Menu.Item leftSection={<IconShare size={14} />} onClick={() => setShowShare(true)}>
                  Share
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={() => setShowDelete(true)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        <Stack gap={4}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Budget
            </Text>
            <Text size="sm" c="dimmed">
              Spent
            </Text>
          </Group>
          <Group justify="space-between" mb="xs">
            <Text fw={700} size="xl">
              {formatCurrency(bucket.amount)}
            </Text>
            <Text fw={700} size="xl" c="orange">
              {formatCurrency(bucket.spent)}
            </Text>
          </Group>
          <Progress value={Math.min(pct, 100)} color={progressColor} size="md" radius="xl" />
          <Group justify="space-between">
            <Text size="xs" c="dimmed">
              {pct.toFixed(1)}% used
            </Text>
            <Text size="xs" c="dimmed">
              {formatCurrency(Math.max(bucket.amount - bucket.spent, 0))} remaining
            </Text>
          </Group>
        </Stack>
      </Paper>

      {shares && shares.length > 0 && (
        <Paper withBorder p="lg" radius="md">
          <Title order={4} mb="md">
            Shared with
          </Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>User ID</Table.Th>
                <Table.Th>Permission</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {shares.map((s) => (
                <Table.Tr key={s.user_id}>
                  <Table.Td>{s.user_id}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" size="sm">
                      {s.permission}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={() => handleRemoveShare(s.user_id)}
                    >
                      Remove
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}

      <Paper withBorder p="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Title order={4}>Transactions</Title>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconPlus size={14} />}
            onClick={() => navigate({ to: `/buckets/${id}/transactions` })}
          >
            View all
          </Button>
        </Group>

        {txLoading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ textAlign: "right" }}>Amount</Table.Th>
                <Table.Th>Notes</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(transactions ?? []).length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed" ta="center" py="md" size="sm">
                      No transactions yet
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                transactions?.map((tx) => (
                  <Table.Tr key={tx.id}>
                    <Table.Td style={{ textAlign: "right" }}>
                      <Text fw={600}>{formatCurrency(tx.amount)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={tx.notes ? undefined : "dimmed"}>
                        {tx.notes ?? "—"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{new Date(tx.spent_at).toLocaleDateString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      {tx.deleted_at && (
                        <Badge color="orange" variant="light" size="sm">
                          Deleted
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      <Modal opened={showDelete} onClose={() => setShowDelete(false)} title="Delete Bucket">
        <Text mb="xl">
          Are you sure you want to delete <strong>{bucket.name}</strong>? This cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={deleteBucket.isPending}>
            Delete
          </Button>
        </Group>
      </Modal>

      <Modal opened={showShare} onClose={() => setShowShare(false)} title="Share Bucket">
        <Stack gap="md">
          <TextInput
            label="User ID"
            type="number"
            value={shareUserId}
            onChange={(e) => setShareUserId(e.currentTarget.value)}
          />
          <Select
            label="Permission"
            value={sharePermission}
            onChange={(v) => setSharePermission(v ?? "view")}
            data={[
              { value: "view", label: "View" },
              { value: "spend", label: "Spend" },
            ]}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setShowShare(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare} loading={shareBucket.isPending}>
              Share
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
