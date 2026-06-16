import type { ReactNode } from "react";
import { Spinner } from "../Spinner";
import styles from "./Button.module.css";

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  const variantClass = styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <button
      className={`${styles.root} ${variantClass} ${sizeClass}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}
