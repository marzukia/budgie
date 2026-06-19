import { Button, Center, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconArrowLeft, IconError404 } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Center h="calc(100vh - 120px)">
      <Stack align="center" gap="lg">
        <ThemeIcon size={80} radius="xl" variant="light" color="teal">
          <IconError404 size={44} />
        </ThemeIcon>
        <div style={{ textAlign: "center" }}>
          <Title order={2} mb="xs">
            Page not found
          </Title>
          <Text c="dimmed">The page you're looking for doesn't exist.</Text>
        </div>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          variant="light"
          onClick={() => navigate({ to: "/" })}
        >
          Back to Dashboard
        </Button>
      </Stack>
    </Center>
  );
}
