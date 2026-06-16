import styles from "./TextInput.module.css";

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "password";
  multiline?: boolean;
  disabled?: boolean;
  maxLength?: number;
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  multiline = false,
  disabled = false,
  maxLength,
}: TextInputProps) {
  if (multiline) {
    return (
      <textarea
        className={`${styles.root} ${styles.textarea}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
      />
    );
  }

  return (
    <input
      className={styles.root}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
    />
  );
}
