import type { ReactNode } from "react";
import styles from "./Card.module.css";

interface CardProps {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, actions, children, className }: CardProps) {
  return (
    <div className={`${styles.root} ${className ?? ""}`}>
      {(title || actions) && (
        <div className={styles.slotHeader}>
          {title && <h3 className={styles.slotTitle}>{title}</h3>}
          {actions && <div className={styles.slotActions}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
