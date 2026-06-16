import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, checkError } from "../../api/client";
import { Card, Table, Button, Modal, FormField, TextInput } from "../../components";
import styles from "./AdminUsers.module.css";

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
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <Button onClick={() => setShowCreate(true)}>Create User</Button>
      </div>

      <Card title="Users">
        <Table
          columns={[
            { key: "id", header: "ID" },
            { key: "name", header: "Name" },
            { key: "role", header: "Role" },
            {
              key: "actions",
              header: "",
              render: (row) => (
                <Button
                  variant="danger"
                  onClick={() => setDeleteId(row.id)}
                >
                  Delete
                </Button>
              ),
            },
          ]}
          rows={users ?? []}
          emptyMessage="No users"
        />
      </Card>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              Create
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <FormField label="Username">
            <TextInput value={newName} onChange={setNewName} />
          </FormField>
          <FormField label="Password">
            <TextInput
              value={newPassword}
              onChange={setNewPassword}
              type="password"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete User"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure?</p>
      </Modal>
    </div>
  );
}
