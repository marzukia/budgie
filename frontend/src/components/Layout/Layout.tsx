import { Outlet } from "@tanstack/react-router";
import { useState } from "react";
import type { ReactNode } from "react";
import { useAuthStore } from "../../stores";
import { useTheme } from "../../hooks";
import { IconButton } from "../IconButton";
import { Link } from "../Link";
import styles from "./Layout.module.css";

interface LayoutProps {
  title: string;
}

export function Layout({ title }: LayoutProps) {
  const { user } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const isAdmin = user?.role === "admin";
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.root}>
      {/* Overlay behind sidebar */}
      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <nav className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <span className={styles.brand}>{title}</span>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
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

      {/* Main content */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.burgerBtn}
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span>{title}</span>
          <span className={styles.topbarSpacer} />
          <IconButton
            variant="ghost"
            size="md"
            icon={theme === "dark" ? "☀️" : "🌙"}
            label="Toggle dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          />
        </header>
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
