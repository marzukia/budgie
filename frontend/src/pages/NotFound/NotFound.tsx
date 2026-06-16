import { Card } from "../../components";
import styles from "./NotFound.module.css";

export default function NotFound() {
  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
      </Card>
    </div>
  );
}
