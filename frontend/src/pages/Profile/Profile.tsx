import {
  Avatar,
  Badge,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useAuthStore } from "../../stores";

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const stats = [
    { label: "Login Count", value: String(user.login_count) },
    {
      label: "Last Login",
      value: user.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never",
    },
    {
      label: "Member Since",
      value: new Date(user.created_at).toLocaleDateString(),
    },
  ];

  return (
    <Stack gap="xl" maw={560}>
      <Title order={2}>Profile</Title>

      <Paper withBorder p="xl" radius="md">
        <Group mb="xl" gap="lg">
          <Avatar size={60} color="teal" radius="xl">
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Text fw={700} size="xl">
              {user.name}
            </Text>
            <Badge mt={4} variant="light" color={user.role === "admin" ? "teal" : "blue"}>
              {user.role}
            </Badge>
          </div>
        </Group>

        <Divider mb="xl" />

        <SimpleGrid cols={1} spacing="md">
          {stats.map(({ label, value }) => (
            <Group key={label} justify="space-between">
              <Text c="dimmed" size="sm">
                {label}
              </Text>
              <Text fw={500} size="sm">
                {value}
              </Text>
            </Group>
          ))}
        </SimpleGrid>
      </Paper>
    </Stack>
  );
}
