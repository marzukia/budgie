import { lazy } from "react";
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../stores";

export const queryClient = new QueryClient();

const rootRoute = createRootRoute({
  beforeLoad: async () => {
    const { user } = useAuthStore.getState();
    if (!user) {
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
    await queryClient.ensureQueryData({ queryKey: ["buckets"] });
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
      queryClient.ensureQueryData({ queryKey: ["buckets", id] }),
      queryClient.ensureQueryData({
        queryKey: ["buckets", id, "transactions"],
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
    await queryClient.ensureQueryData({ queryKey: ["buckets", id] });
  },
});

const transactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buckets/$id/transactions",
  component: Transactions,
  loader: async ({ params }) => {
    const id = Number(params.id);
    await queryClient.ensureQueryData({
      queryKey: ["buckets", id, "transactions"],
    });
  },
});

const transactionNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/buckets/$id/transactions/new",
  component: TransactionForm,
  loader: async ({ params }) => {
    const id = Number(params.id);
    await queryClient.ensureQueryData({ queryKey: ["buckets", id] });
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
      queryClient.ensureQueryData({ queryKey: ["insights", "summary"] }),
      queryClient.ensureQueryData({ queryKey: ["insights", "monthly"] }),
    ]);
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
  loader: async () => {
    await queryClient.ensureQueryData({ queryKey: ["settings"] });
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
    await queryClient.ensureQueryData({ queryKey: ["admin", "users"] });
  },
});

const adminBucketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/buckets",
  component: AdminBuckets,
  loader: async () => {
    await queryClient.ensureQueryData({ queryKey: ["buckets", "admin"] });
  },
});

const adminTransactionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/transactions",
  component: AdminTransactions,
  loader: async () => {
    await queryClient.ensureQueryData({
      queryKey: ["buckets", "admin", "transactions"],
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
