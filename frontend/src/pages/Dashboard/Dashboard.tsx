import { useNavigate } from "@tanstack/react-router";
import { formatCurrency } from "../../api/format";
import { Button, Card, Pill, Spinner } from "../../components";
import { useBuckets } from "../../stores";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { data: buckets, isLoading } = useBuckets();
  const navigate = useNavigate();

  if (isLoading) return <Spinner size="lg" />;

  if (!buckets || buckets.length === 0) {
    return (
      <div className={styles.root}>
        <h2>Budget Overview</h2>
        <Card className={styles.emptyState}>
          <p className={styles.emptyStateText}>No buckets yet — create your first bucket</p>
          <Button size="lg" onClick={() => navigate({ to: "/buckets/new" })}>
            Create your first bucket
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <h2>Budget Overview</h2>
      <div className={styles.grid}>
        {buckets?.map((bucket) => {
          const pct = bucket.amount > 0 ? (bucket.spent / bucket.amount) * 100 : 0;
          const fillColor = pct > 90 ? "var(--color-danger)" : "var(--color-accent)";
          return (
            <Card
              key={bucket.id}
              title={bucket.name}
              actions={<Pill label={bucket.currency} variant="info" />}
              className={styles.bucketCard}
            >
              <div
                onClick={() => navigate({ to: `/buckets/${bucket.id}` })}
                onKeyDown={(e) => e.key === "Enter" && navigate({ to: `/buckets/${bucket.id}` })}
                role="presentation"
              >
                <div className={styles.balance}>
                  {formatCurrency(bucket.amount, bucket.currency)}
                </div>
                <div className={styles.bucketMeta}>
                  Spent {formatCurrency(bucket.spent, bucket.currency)} ·{" "}
                  {bucket.distribute_to_period}
                </div>
                <div className={styles.progress}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: fillColor,
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
