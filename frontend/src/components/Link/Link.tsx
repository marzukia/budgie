import type { ReactNode } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import styles from "./Link.module.css";

interface LinkProps {
  to: string;
  active?: boolean;
  children: ReactNode;
}

export function Link({ to, active = false, children }: LinkProps) {
  return (
    <RouterLink
      to={to}
      className={`${styles.root} ${active ? styles.active : ""}`}
    >
      {children}
    </RouterLink>
  );
}
