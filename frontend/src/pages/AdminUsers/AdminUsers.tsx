import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, checkError } from "../../api/client";
import {
  Stack,
  Group,
  Title,
  Text,
  Badge,
  Button,
  Modal,
  TextInput,
  PasswordInput,
  Table,
  ActionIcon,
  Paper,
  Avatar,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";

export default function AdminUsers() {
  const qc = useQueryClient();

  const { data: users } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await client.GET("/api/users/");
      checkError(res);
      return res.data ?? [];
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      const res = await client.DELETE("/api/users/{user_id}", {
        params: { path: { user_id: id } },
      });
      checkError(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const createUser = useMutation({
    mutationFn: async (body: { name: string; password: string }) => {
      const res = await client.POST("/api/users/", { body });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleCreate = async () => {
    await createUser.mutateAsync({ name: newName, password: newPassword });
    setShowCreate(false);
    setNewName("");
    setNewPassword("");
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteUser.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="center">
        <Title order={2}>Users</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setShowCreate(true)}>
          Create User
        </Button>
      </Group>

      <Paper withBorder radius="md" p="lg">
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(users ?? []).length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3}>
                  <Text c="dimmed" ta="center" py="md" size="sm">No users</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              users?.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar size="sm" color="teal" radius="xl">
                        {u.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Text size="sm" fw={500}>{u.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={u.role === "admin" ? "teal" : "blue"} size="sm">
                      {u.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={() => setDeleteId(u.id)}
                    >
                      <IconTrash size={15} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal opened={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <Stack gap="md">
          <TextInput
            label="Username"
            value={newName}
            onChange={(e) => setNewName(e.currentTarget.value)}
            placeholder="Enter username"
          />
          <PasswordInput
            label="Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            placeholder="Enter password"
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createUser.isPending}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete User">
        <Text mb="xl">Are you sure you want to delete this user?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="red" onClick={handleDelete} loading={deleteUser.isPending}>Delete</Button>
        </Group>
      </Modal>
    </Stack>
  );
}
