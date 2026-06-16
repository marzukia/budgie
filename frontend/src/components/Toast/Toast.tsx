import styles from "./Toast.module.css";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, variant = "info" }: ToastProps) {
  const variantClass = styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  return <div className={`${styles.root} ${variantClass}`}>{message}</div>;
}
