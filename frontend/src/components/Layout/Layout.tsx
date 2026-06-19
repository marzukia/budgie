import type { ReactNode } from "react";
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  AppShell,
  NavLink,
  Group,
  Text,
  Stack,
  Divider,
  ActionIcon,
  ScrollArea,
  Avatar,
  Box,
  Center,
  Burger,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutDashboard,
  IconChartBar,
  IconSettings,
  IconUser,
  IconUsers,
  IconWallet,
  IconReceipt,
  IconMoon,
  IconSun,
  IconFeather,
} from "@tabler/icons-react";
import { useAuthStore } from "../../stores";

export function Layout() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [opened, { toggle, close }] = useDisclosure();
  const navigate = useNavigate();
  const { location } = useRouterState();
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navLinks = [
    { to: "/", label: "Dashboard", Icon: IconLayoutDashboard },
    { to: "/insights", label: "Insights", Icon: IconChartBar },
    { to: "/settings", label: "Settings", Icon: IconSettings },
    { to: "/profile", label: "Profile", Icon: IconUser },
  ];

  const adminLinks = [
    { to: "/admin/users", label: "Users", Icon: IconUsers },
    { to: "/admin/buckets", label: "Buckets", Icon: IconWallet },
    { to: "/admin/transactions", label: "Transactions", Icon: IconReceipt },
  ];

  const handleNav = (to: string) => {
    navigate({ to });
    close();
  };

  const navContent = (
    <>
      <AppShell.Section>
        <Group mb="xl" px="xs" gap="xs" visibleFrom="sm">
          <IconFeather size={26} color="var(--mantine-color-teal-6)" />
          <Text fw={800} size="xl" c="teal.7" style={{ letterSpacing: "-0.5px" }}>
            budgie
          </Text>
        </Group>
      </AppShell.Section>

      <AppShell.Section grow component={ScrollArea}>
        <Stack gap={2}>
          {navLinks.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              label={label}
              leftSection={<Icon size={17} />}
              active={isActive(to)}
              onClick={() => handleNav(to)}
            />
          ))}

          {isAdmin && (
            <>
              <Divider my="sm" label="Admin" labelPosition="center" />
              {adminLinks.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  label={label}
                  leftSection={<Icon size={17} />}
                  active={isActive(to)}
                  onClick={() => handleNav(to)}
                />
              ))}
            </>
          )}
        </Stack>
      </AppShell.Section>

      <AppShell.Section>
        <Divider mb="md" />
        <Group justify="space-between" px="xs">
          <Group gap="sm">
            <Avatar size="sm" color="teal" radius="xl">
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Text size="sm" fw={500} truncate maw={130}>
              {user?.name}
            </Text>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() =>
              setColorScheme(computedColorScheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle colour scheme"
          >
            {computedColorScheme === "dark" ? (
              <IconSun size={16} />
            ) : (
              <IconMoon size={16} />
            )}
          </ActionIcon>
        </Group>
      </AppShell.Section>
    </>
  );

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="xs">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <IconFeather size={22} color="var(--mantine-color-teal-6)" />
            <Text fw={800} size="lg" c="teal.7" style={{ letterSpacing: "-0.5px" }}>
              budgie
            </Text>
          </Group>
          <ActionIcon
            variant="subtle"
            color="gray"
            hiddenFrom="sm"
            onClick={() =>
              setColorScheme(computedColorScheme === "dark" ? "light" : "dark")
            }
            aria-label="Toggle colour scheme"
          >
            {computedColorScheme === "dark" ? (
              <IconSun size={16} />
            ) : (
              <IconMoon size={16} />
            )}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navContent}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export function LoginLayout({ children }: { children: ReactNode }) {
  return (
    <Box style={{ minHeight: "100vh" }} bg="var(--mantine-color-gray-0)">
      <Center h="100vh">{children}</Center>
    </Box>
  );
}
