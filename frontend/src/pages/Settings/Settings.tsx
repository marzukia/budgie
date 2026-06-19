import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "../../stores";
import {
  Stack,
  Title,
  Select,
  Button,
  Group,
  Paper,
  Text,
  Divider,
  SegmentedControl,
  Loader,
  Center,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { setColorScheme } = useMantineColorScheme();

  const [baseCurrency, setBaseCurrency] = useState("AUD");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (settings) {
      setBaseCurrency(settings.base_currency);
      setTheme(settings.theme);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  const handleSave = async () => {
    await updateSettings.mutateAsync({ base_currency: baseCurrency, theme });
    setColorScheme(theme as "light" | "dark");
  };

  return (
    <Stack gap="xl" maw={520}>
      <Title order={2}>Settings</Title>

      <Paper withBorder p="xl" radius="md">
        <Stack gap="lg">
          <div>
            <Text fw={600} mb={4}>Base Currency</Text>
            <Text c="dimmed" size="sm" mb="sm">
              Used for summary calculations across all buckets
            </Text>
            <Select
              value={baseCurrency}
              onChange={(v) => setBaseCurrency(v ?? "AUD")}
              data={[
                { value: "AUD", label: "AUD — Australian Dollar" },
                { value: "USD", label: "USD — US Dollar" },
                { value: "EUR", label: "EUR — Euro" },
              ]}
              w={260}
            />
          </div>

          <Divider />

          <div>
            <Text fw={600} mb={4}>Appearance</Text>
            <Text c="dimmed" size="sm" mb="sm">Choose your preferred colour scheme</Text>
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              data={[
                {
                  value: "light",
                  label: (
                    <Group gap="xs" px="xs">
                      <IconSun size={14} />
                      <span>Light</span>
                    </Group>
                  ),
                },
                {
                  value: "dark",
                  label: (
                    <Group gap="xs" px="xs">
                      <IconMoon size={14} />
                      <span>Dark</span>
                    </Group>
                  ),
                },
              ]}
            />
          </div>

          <Divider />

          <Group justify="flex-end">
            <Button onClick={handleSave} loading={updateSettings.isPending}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Stack>
  );
}
