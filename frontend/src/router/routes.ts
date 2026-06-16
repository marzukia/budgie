import { QueryClient } from "@tanstack/react-query";
import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";
import { lazy } from "react";
import { checkError, client } from "../api/client";
import { RootLayout } from "../components/Layout/RootLayout";
import { useAuthStore } from "../stores";

export const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  component: RootLayout,
  beforeLoad: async ({ location }) => {
    const { user, loading } = useAuthStore.getState();
    if (loading) {
      // Session check hasn't completed yet — wait for it
      // authStore sets loading=false after checkSession resolves
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
  path: "/buckets/new",
  component: BucketForm,
});

const bucketDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
  path: "/transactions/$transactionId/edit",
  component: TransactionForm,
});

const insightsRoute = createRoute({
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  getParentRoute: () => rootRoute,
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
  notFoundRoute,
]);

export const router = createRouter({ routeTree });
