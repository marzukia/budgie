import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../stores";
import { LoginLayout } from "../../components";
import {
  Paper,
  Stack,
  TextInput,
  PasswordInput,
  Button,
  Text,
  Title,
  Alert,
  Group,
} from "@mantine/core";
import { IconFeather, IconAlertCircle } from "@tabler/icons-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate({ to: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <Paper w={400} p="xl" shadow="md" withBorder>
        <Stack gap="xl">
          <Stack gap="xs" align="center">
            <Group gap="xs">
              <IconFeather size={32} color="var(--mantine-color-teal-6)" />
              <Title order={2} c="teal.7" style={{ letterSpacing: "-0.5px" }}>
                budgie
              </Title>
            </Group>
            <Text c="dimmed" size="sm" ta="center">
              Track your budget with ease
            </Text>
          </Stack>

          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="your username"
              value={username}
              onChange={(e) => setUsername(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              autoFocus
            />
            <PasswordInput
              label="Password"
              placeholder="your password"
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />

            {error && (
              <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                {error}
              </Alert>
            )}

            <Button
              onClick={handleSubmit}
              loading={loading}
              fullWidth
              size="md"
              mt="xs"
            >
              Sign in
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </LoginLayout>
  );
}
