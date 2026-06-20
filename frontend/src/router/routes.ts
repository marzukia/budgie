import { QueryClient } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { checkError, client } from "../api/client";
import { Layout } from "../components/Layout/Layout";
import { useAuthStore } from "../stores";

export const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  beforeLoad: async ({ location }) => {
    const { user, loading } = useAuthStore.getState();
    if (loading) {
      await new Promise<void>((resolve) => {
        const unsub = useAuthStore.subscribe((s) => {
          if (!s.loading) {
            unsub();
            resolve();
          }
        });
      });
    }
    const { user: u } = useAuthStore.getState();
    if (!u && location.pathname !== "/login") {
      throw redirect({ to: "/login" });
    }
  },
});

// Authenticated layout wrapper — all protected pages are children of this route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: Layout,
});

const Login = lazy(() => import("../pages/Login"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const BucketForm = lazy(() => import("../pages/BucketForm"));
const BucketDetail = lazy(() => import("../pages/BucketDetail"));
const Transactions = lazy(() => import("../pages/Transactions"));
const TransactionForm = lazy(() => import("../pages/TransactionForm"));
const Insights = lazy(() => import("../pages/Insights"));
const Settings = lazy(() => import("../pages/Settings"));
const Profile = lazy(() => import("../pages/Profile"));
const AdminUsers = lazy(() => import("../pages/AdminUsers"));
const AdminBuckets = lazy(() => import("../pages/AdminBuckets"));
const AdminTransactions = lazy(() => import("../pages/AdminTransactions"));
const NotFound = lazy(() => import("../pages/NotFound"));

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: Dashboard,
  loader: async () => {
    await queryClient.fetchQuery({
      queryKey: ["buckets"],
      queryFn: async () => {
        const res = await client.GET("/api/buckets/");
        checkError(res);
        return res.data ?? [];
      },
    });
  },
});

const bucketNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/buckets/new",
  component: BucketForm,
});

const bucketDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/buckets/$id",
  component: BucketDetail,
  loader: async ({ params }) => {
    const id = Number(params.id);
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: ["buckets", id],
        queryFn: async () => {
          const res = await client.GET("/api/buckets/{bucket_id}", {
            params: { path: { bucket_id: id } },
          });
          checkError(res);
          return res.data;
        },
      }),
      queryClient.fetchQuery({
        queryKey: ["buckets", id, "transactions"],
        queryFn: async () => {
          const res = await client.GET("/api/buckets/{bucket_id}/transactions", {
            params: { path: { bucket_id: id } },
          });
          checkError(res);
          return res.data ?? [];
        },
      }),
    ]);
  },
});

const bucketEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/buckets/$id/edit",
  component: BucketForm,
  loader: async ({ params }) => {
    const id = Number(params.id);
    await queryClient.fetchQuery({
      queryKey: ["buckets", id],
      queryFn: async () => {
        const res = await client.GET("/api/buckets/{bucket_id}", {
          params: { path: { bucket_id: id } },
        });
        checkError(res);
        return res.data;
      },
    });
  },
});

const transactionsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/buckets/$id/transactions",
  component: Transactions,
  loader: async ({ params }) => {
    const id = Number(params.id);
    await queryClient.fetchQuery({
      queryKey: ["buckets", id, "transactions"],
      queryFn: async () => {
        const res = await client.GET("/api/buckets/{bucket_id}/transactions", {
          params: { path: { bucket_id: id } },
        });
        checkError(res);
        return res.data ?? [];
      },
    });
  },
});

const transactionNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/buckets/$id/transactions/new",
  component: TransactionForm,
  loader: async ({ params }) => {
    const id = Number(params.id);
    await queryClient.fetchQuery({
      queryKey: ["buckets", id],
      queryFn: async () => {
        const res = await client.GET("/api/buckets/{bucket_id}", {
          params: { path: { bucket_id: id } },
        });
        checkError(res);
        return res.data;
      },
    });
  },
});

const transactionEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/transactions/$transactionId/edit",
  component: TransactionForm,
});

const insightsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/insights",
  component: Insights,
  loader: async () => {
    await Promise.all([
      queryClient.fetchQuery({
        queryKey: ["insights", "summary"],
        queryFn: async () => {
          const res = await client.GET("/api/insights/summary");
          checkError(res);
          return res.data ?? [];
        },
      }),
      queryClient.fetchQuery({
        queryKey: ["insights", "monthly"],
        queryFn: async () => {
          const res = await client.GET("/api/insights/monthly");
          checkError(res);
          return res.data ?? [];
        },
      }),
    ]);
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/settings",
  component: Settings,
  loader: async () => {
    await queryClient.fetchQuery({
      queryKey: ["settings"],
      queryFn: async () => {
        const res = await client.GET("/api/settings/");
        checkError(res);
        return res.data!;
      },
    });
  },
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/profile",
  component: Profile,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin/users",
  component: AdminUsers,
  loader: async () => {
    await queryClient.fetchQuery({
      queryKey: ["admin", "users"],
      queryFn: async () => {
        const res = await client.GET("/api/users/");
        checkError(res);
        return res.data ?? [];
      },
    });
  },
});

const adminBucketsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin/buckets",
  component: AdminBuckets,
  loader: async () => {
    await queryClient.fetchQuery({
      queryKey: ["buckets", "admin"],
      queryFn: async () => {
        const res = await client.GET("/api/buckets/");
        checkError(res);
        return res.data ?? [];
      },
    });
  },
});

const adminTransactionsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/admin/transactions",
  component: AdminTransactions,
  loader: async () => {
    await queryClient.fetchQuery({
      queryKey: ["buckets", "admin", "transactions"],
      queryFn: async () => {
        const res = await client.GET("/api/buckets/{bucket_id}/transactions", {
          params: { path: { bucket_id: -1 } },
        });
        checkError(res);
        return res.data ?? [];
      },
    });
  },
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/$",
  component: NotFound,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  notFoundRoute,
  layoutRoute.addChildren([
    indexRoute,
    bucketNewRoute,
    bucketDetailRoute,
    bucketEditRoute,
    transactionsRoute,
    transactionNewRoute,
    transactionEditRoute,
    insightsRoute,
    settingsRoute,
    profileRoute,
    adminUsersRoute,
    adminBucketsRoute,
    adminTransactionsRoute,
  ]),
]);

export const router = createRouter({ routeTree });
