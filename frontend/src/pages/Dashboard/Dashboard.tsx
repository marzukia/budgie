import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import { IconPlus, IconTrendingUp, IconWallet } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { formatCurrency } from "../../api/format";
import { BucketIcon } from "../../components/BucketIcon/BucketIcon";
import { useBuckets } from "../../stores";

export default function Dashboard() {
  const { data: buckets, isLoading } = useBuckets();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const totalBudget = buckets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = buckets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const remaining = totalBudget - totalSpent;

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Budget Overview</Title>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => navigate({ to: "/buckets/new" })}
        >
          New Bucket
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Total Budget
            </Text>
            <ThemeIcon variant="light" color="teal" size="sm">
              <IconWallet size={14} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl">
            {formatCurrency(totalBudget)}
          </Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Total Spent
            </Text>
            <ThemeIcon variant="light" color="orange" size="sm">
              <IconTrendingUp size={14} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl" c="orange">
            {formatCurrency(totalSpent)}
          </Text>
        </Paper>
        <Paper withBorder p="md" radius="md">
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Remaining
            </Text>
            <ThemeIcon variant="light" color={remaining >= 0 ? "teal" : "red"} size="sm">
              <IconWallet size={14} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl" c={remaining >= 0 ? "teal" : "red"}>
            {formatCurrency(remaining)}
          </Text>
        </Paper>
      </SimpleGrid>

      {buckets?.length === 0 && (
        <Center py="xl">
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="xl" variant="light" color="teal">
              <IconWallet size={30} />
            </ThemeIcon>
            <Text c="dimmed" size="lg">
              No buckets yet
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => navigate({ to: "/buckets/new" })}
            >
              Create your first bucket
            </Button>
          </Stack>
        </Center>
      )}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {buckets?.map((bucket) => {
          const pct = bucket.amount > 0 ? (bucket.spent / bucket.amount) * 100 : 0;
          const isOver = pct > 90;
          const progressColor = pct > 100 ? "red" : isOver ? "orange" : "teal";

          return (
            <Card
              key={bucket.id}
              withBorder
              padding="lg"
              style={{ cursor: "pointer" }}
              onClick={() => navigate({ to: `/buckets/${bucket.id}` })}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <BucketIcon name={bucket.icon} size={22} color={bucket.color} />
                  <Text fw={600} size="md" truncate>
                    {bucket.name}
                  </Text>
                </Group>
                <Badge variant="light" color="teal" size="sm">
                  {bucket.currency}
                </Badge>
              </Group>

              <Text fw={800} size="xl" mb={4}>
                {formatCurrency(bucket.amount)}
              </Text>
              <Text size="xs" c="dimmed" mb="md">
                Spent {formatCurrency(bucket.spent)} · {bucket.distribute_to_period}
              </Text>

              <Progress value={Math.min(pct, 100)} color={progressColor} size="sm" radius="xl" />
              <Text size="xs" c="dimmed" mt={4} ta="right">
                {pct.toFixed(0)}% used
              </Text>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
