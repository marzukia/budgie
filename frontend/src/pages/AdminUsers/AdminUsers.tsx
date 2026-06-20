import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  Paper,
  PasswordInput,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { checkError, client } from "../../api/client";
import type { components } from "../../api/generated";

type UserResponse = components["schemas"]["UserResponse"];
type UserUpdate = components["schemas"]["UserUpdate"];

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

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UserUpdate }) => {
      const res = await client.PATCH("/api/users/{user_id}", {
        params: { path: { user_id: id } },
        body: data,
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editIsStaff, setEditIsStaff] = useState(false);

  const handleCreate = async () => {
    await createUser.mutateAsync({ name: newName, password: newPassword });
    setShowCreate(false);
    setNewName("");
    setNewPassword("");
  };

  const handleEdit = async () => {
    if (editId === null) return;
    const data: UserUpdate = {};
    if (editName) data.name = editName;
    if (editPassword) data.password = editPassword;
    data.is_staff = editIsStaff;
    await updateUser.mutateAsync({ id: editId, data });
    setEditId(null);
  };

  const handleDelete = async () => {
    if (deleteId !== null) {
      await deleteUser.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const openEdit = (u: UserResponse) => {
    setEditId(u.id);
    setEditName(u.name);
    setEditPassword("");
    setEditIsStaff(u.role === "admin");
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
                  <Text c="dimmed" ta="center" py="md" size="sm">
                    No users
                  </Text>
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
                      <Text size="sm" fw={500}>
                        {u.name}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={u.role === "admin" ? "teal" : "blue"} size="sm">
                      {u.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={4} justify="flex-end">
                      <ActionIcon variant="subtle" color="gray" onClick={() => openEdit(u)}>
                        <IconEdit size={15} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" color="red" onClick={() => setDeleteId(u.id)}>
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
            <Button variant="default" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createUser.isPending}>
              Create
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={editId !== null} onClose={() => setEditId(null)} title="Edit User">
        <Stack gap="md">
          <TextInput
            label="Username"
            value={editName}
            onChange={(e) => setEditName(e.currentTarget.value)}
            placeholder="Enter username"
          />
          <PasswordInput
            label="New password (leave blank to keep)"
            value={editPassword}
            onChange={(e) => setEditPassword(e.currentTarget.value)}
            placeholder="Leave blank to keep current"
          />
          <Switch
            label="Admin (staff)"
            checked={editIsStaff}
            onChange={(e) => setEditIsStaff(e.currentTarget.checked)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={updateUser.isPending}>
              Save
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal opened={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete User">
        <Text mb="xl">Are you sure you want to delete this user?</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleDelete} loading={deleteUser.isPending}>
            Delete
          </Button>
        </Group>
      </Modal>
    </Stack>
  );
}
