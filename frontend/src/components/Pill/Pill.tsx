import styles from "./Pill.module.css";

interface PillProps {
  label: string;
  variant?: "info" | "success" | "warning" | "danger";
}

export function Pill({ label, variant = "info" }: PillProps) {
  const variantClass = styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  return <span className={`${styles.root} ${variantClass}`}>{label}</span>;
}
