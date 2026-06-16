import type { ReactNode } from "react";
import styles from "./IconButton.module.css";

interface IconButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}

export function IconButton({
  variant = "ghost",
  size = "md",
  icon,
  label,
  onClick,
}: IconButtonProps) {
  const variantClass = styles[`variant${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <button
      className={`${styles.root} ${variantClass} ${sizeClass}`}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
