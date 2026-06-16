import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "../../stores";
import { Card, FormField, TextInput, Button } from "../../components";
import { LoginLayout } from "../../components";
import styles from "./Login.module.css";

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
      setError(e instanceof Error ? e.message : "login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <Card title="Budgie" className={styles.card}>
        <div className={styles.form}>
          <FormField label="Username">
            <TextInput
              value={username}
              onChange={setUsername}
              placeholder="username"
            />
          </FormField>
          <FormField label="Password">
            <TextInput
              value={password}
              onChange={setPassword}
              type="password"
              placeholder="password"
            />
          </FormField>
          {error && <p className={styles.error}>{error}</p>}
          <Button onClick={handleSubmit} loading={loading}>
            Sign in
          </Button>
        </div>
      </Card>
    </LoginLayout>
  );
}
