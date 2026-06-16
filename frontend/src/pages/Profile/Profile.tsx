import { useAuthStore } from "../../stores";
import { Card, Pill } from "../../components";
import styles from "./Profile.module.css";

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className={styles.root}>
      <Card title="Profile">
        <div className={styles.info}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Name</span>
            <span className={styles.fieldValue}>{user.name}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Role</span>
            <Pill
              label={user.role}
              variant={user.role === "admin" ? "success" : "info"}
            />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Login Count</span>
            <span className={styles.fieldValue}>{user.login_count}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Last Login</span>
            <span className={styles.fieldValue}>
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString()
                : "Never"}
            </span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Created</span>
            <span className={styles.fieldValue}>
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
