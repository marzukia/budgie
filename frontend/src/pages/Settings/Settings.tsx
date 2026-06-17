import { useEffect, useState } from "react";
import { Button, Card, FormField, Select, Spinner, Toggle } from "../../components";
import { useSettings, useUpdateSettings, useThemeStore } from "../../stores";
import styles from "./Settings.module.css";

export default function Settings() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { theme, setTheme } = useThemeStore();

  const [baseCurrency, setBaseCurrency] = useState("AUD");

  useEffect(() => {
    if (settings) {
      setBaseCurrency(settings.base_currency);
    }
  }, [settings]);

  if (isLoading) return <Spinner size="lg" />;

  const handleSave = async () => {
    await updateSettings.mutateAsync({
      base_currency: baseCurrency,
    });
  };

  return (
    <div className={styles.root}>
      <Card title="Settings">
        <div className={styles.form}>
          <FormField label="Base Currency">
            <Select
              value={baseCurrency}
              onChange={setBaseCurrency}
              options={[
                { value: "AUD", label: "AUD" },
                { value: "USD", label: "USD" },
                { value: "EUR", label: "EUR" },
              ]}
            />
          </FormField>
          <FormField label="Theme">
            <Toggle
              checked={theme === "dark"}
              onChange={(v) => setTheme(v ? "dark" : "light")}
              label="Dark mode"
            />
          </FormField>
          <Button onClick={handleSave} loading={updateSettings.isPending}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
