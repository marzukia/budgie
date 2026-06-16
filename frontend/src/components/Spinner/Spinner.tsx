import styles from "./Spinner.module.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md" }: SpinnerProps) {
  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];
  return (
    <span className={`${styles.root} ${sizeClass}`}>
      <span className={styles.spinner} />
    </span>
  );
}
