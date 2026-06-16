import type { ReactNode } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className={`${styles.root} ${error ? styles.withError : ""}`}>
      <label className={`${styles.label} ${required ? styles.required : ""}`}>
        {label}
        {children}
      </label>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
