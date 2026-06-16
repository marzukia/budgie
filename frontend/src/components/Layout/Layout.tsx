import type { ReactNode } from "react";
import { Outlet } from "@tanstack/react-router";
import { useAuthStore } from "../../stores";
import { Link } from "../Link";
import styles from "./Layout.module.css";

interface LayoutProps {
  title: string;
}

export function Layout({ title }: LayoutProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  return (
    <div className={styles.root}>
      <nav className={styles.sidebar}>
        <div className={styles.slotNav}>
          <Link to="/">Dashboard</Link>
          <Link to="/insights">Insights</Link>
          <Link to="/settings">Settings</Link>
          <Link to="/profile">Profile</Link>
        </div>
        {isAdmin && (
          <>
            <div className={styles.divider} />
            <span className={styles.sectionLabel}>Admin</span>
            <div className={styles.slotNav}>
              <Link to="/admin/users">Users</Link>
              <Link to="/admin/buckets">Buckets</Link>
              <Link to="/admin/transactions">Transactions</Link>
            </div>
          </>
        )}
      </nav>
      <div className={styles.main}>
        <header className={styles.topbar}>{title}</header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function LoginLayout({ children }: { children: ReactNode }) {
  return <div className={styles.loginLayout}>{children}</div>;
}
