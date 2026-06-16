import { useState, type ReactNode } from "react";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
}

export function Tooltip({
  content,
  position = "top",
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={styles.root}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span className={`${styles.content} ${styles[position]}`}>
          {content}
        </span>
      )}
    </span>
  );
}
