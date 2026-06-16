# Budgie Frontend — Component Design

## Session Brief

Build a React + TypeScript frontend for Budgie, a personal budget tracking app. Backend is Django Ninja at `~/projects/budgie/backend` — run `DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --port 8000` for codegen and E2E tests. OpenAPI spec at `/api/openapi.json`. Session cookie auth (no JWT).

### What to build
1. **15 shared UI primitives** with CSS modules + barrel exports (Button, Card, Table, Modal, FormField, TextInput, Select, Pill, Toast, Spinner, IconButton, Link, Tooltip, Toggle, Layout)
2. **Layout shell** — sidebar nav with user links (Dashboard, Insights, Settings, Profile) and admin links (Admin Users, Admin Buckets, Admin Transactions) separated by a divider. Login page is full-screen, no sidebar
3. **2 Zustand stores** — auth (user, login, logout, session check) and toast (global notifications). All server state managed by TanStack Query
4. **14 pages** lazy-loaded via **TanStack Router** — type-safe routes, loaders integrate with TanStack Query for data pre-fetching, search param handling for filters
5. **E2E tests** with Playwright against dev backend

### Tooling
- **Package manager**: `bun` — all commands use `bun add`, `bun run`, `bunx` (never `npx`, `npm`, `yarn`)
- **Formatter + linter**: **Biome** (`bun add --dev @biomejs/biome`). Config in `biome.json`. Run `biome check --apply` before commits
- **Pre-commit**: `bun add --dev husky` + `lint-staged` — run `biome check --apply` on staged `.ts`, `.tsx` files
- **CSS modules**: no Tailwind, no CSS-in-JS. Every component gets `Name.module.css`
- **API client**: `openapi-fetch` with `openapi-typescript` codegen from live backend
- **Server state**: `@tanstack/react-query` — caching, refetching, loading/error states built-in. Mutations invalidate queries
- **Client state**: `zustand` — only for auth (user session) and toast (global notifications). Everything else is TanStack Query
- **Router**: `@tanstack/react-router` — type-safe routes with generics, `loader` functions pre-fetch data via TanStack Query, `useParams()` for path params, `useSearch()` for query params (e.g. `include_deleted` filter)
- **Charts**: `recharts` for Insights page

---

## Principles

1. **Everything shared** — no page-specific components. Pages are assemblies of shared primitives. A button is a button everywhere.
2. **CSS modules** — every component gets `ComponentName.module.css`. No inline styles, no global CSS classes.
3. **Barrel exports** — `index.ts` re-exports all components from a directory. Import from the barrel, never from the individual file.
4. **Composition over configuration** — shared components accept props for variation, not config objects.
5. **No design drift** — pages that need a variant of a shared component extend the component via props, not by writing a new one.

---

## Directory Structure

```
frontend/src/
├── components/               # Shared UI primitives (barrel)
│   ├── index.ts              # re-exports everything below
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.module.css
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── Card.module.css
│   ├── FormField/
│   │   ├── FormField.tsx
│   │   └── FormField.module.css
│   ├── IconButton/
│   │   ├── IconButton.tsx
│   │   └── IconButton.module.css
│   ├── Layout/
│   │   ├── Layout.tsx           # sidebar + topnav shell
│   │   └── Layout.module.css
│   ├── Link/
│   │   ├── Link.tsx
│   │   └── Link.module.css
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── Modal.module.css
│   ├── Pill/
│   │   ├── Pill.tsx
│   │   └── Pill.module.css
│   ├── Select/
│   │   ├── Select.tsx
│   │   └── Select.module.css
│   ├── Spinner/
│   │   ├── Spinner.tsx
│   │   └── Spinner.module.css
│   ├── Table/
│   │   ├── Table.tsx
│   │   └── Table.module.css
│   ├── TextInput/
│   │   ├── TextInput.tsx
│   │   └── TextInput.module.css
│   ├── Toast/
│   │   ├── Toast.tsx
│   │   └── Toast.module.css
│   ├── Toggle/
│   │   ├── Toggle.tsx
│   │   └── Toggle.module.css
│   └── Tooltip/
│       ├── Tooltip.tsx
│       └── Tooltip.module.css
├── api/                       # API client (barrel)
│   ├── index.ts               # re-exports client + generated types
│   ├── client.ts              # openapi-fetch client instance
│   └── generated.ts           # openapi-typescript output
├── stores/                    # Zustand client state only
│   ├── index.ts               # barrel
│   ├── authStore.ts           # user, login, logout, checkSession
│   ├── toastStore.ts          # global notifications
│   └── queries/
│       ├── index.ts           # barrel
│       ├── useBuckets.ts      # TanStack Query — buckets CRUD
│       ├── useTransactions.ts # TanStack Query — transactions CRUD
│       ├── useInsights.ts     # TanStack Query — summary + monthly
│       └── useSettings.ts     # TanStack Query — settings GET/PUT
├── router/                    # TanStack Router — route tree + generated types
│   ├── index.ts               # createRouter + export
│   ├── routes.ts              # route tree definition with loaders
│   └── generated.ts           # generated route types (from tsc)
├── pages/                     # Page components — NO components here
│   ├── Login/
│   │   ├── Login.tsx
│   │   └── Login.module.css
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   └── Dashboard.module.css
│   ├── BucketDetail/
│   │   ├── BucketDetail.tsx
│   │   └── BucketDetail.module.css
│   ├── BucketForm/
│   │   ├── BucketForm.tsx
│   │   └── BucketForm.module.css
│   ├── Transactions/
│   │   ├── Transactions.tsx
│   │   └── Transactions.module.css
│   ├── TransactionForm/
│   │   ├── TransactionForm.tsx
│   │   └── TransactionForm.module.css
│   ├── Insights/
│   │   ├── Insights.tsx
│   │   └── Insights.module.css
│   ├── Settings/
│   │   ├── Settings.tsx
│   │   └── Settings.module.css
│   ├── Profile/
│   │   ├── Profile.tsx
│   │   └── Profile.module.css
│   ├── AdminUsers/
│   │   ├── AdminUsers.tsx
│   │   └── AdminUsers.module.css
│   ├── AdminBuckets/
│   │   ├── AdminBuckets.tsx
│   │   └── AdminBuckets.module.css
│   ├── AdminTransactions/
│   │   ├── AdminTransactions.tsx
│   │   └── AdminTransactions.module.css
│   └── NotFound/
│       ├── NotFound.tsx
│       └── NotFound.module.css
├── hooks/                     # Shared hooks (barrel)
│   ├── index.ts               # re-exports
│   └── useTheme.ts
├── App.tsx                    # RouterProvider wrapper
├── main.tsx                   # Entry point — renders <RouterProvider>
└── global.css                 # CSS variables, reset, fonts — ONLY these
```

---

## Component Catalog — Shared Primitives

### Layout
The top-level shell component. Wraps every page via TanStack Router's `Outlet` pattern.

**Props:** `page: ReactNode`, `title: string`

**Structure:**
```
<Layout>
  <Sidebar>
    NavLink (Dashboard)
    NavLink (Insights)
    NavLink (Settings)
    NavLink (Profile)
    <SectionDivider />                — only if role=admin
    <SectionLabel>Admin</SectionLabel> — only if role=admin
    NavLink (Admin Users)             — only if role=admin
    NavLink (Admin Buckets)           — only if role=admin
    NavLink (Admin Transactions)      — only if role=admin
  </Sidebar>
  <Main>
    <Topbar title={title} />
    <Content><Outlet /></Content>    — TanStack Router renders matched route here
  </Main>
</Layout>
```

**Layout renders nothing for Login page** (full-screen centered form, no sidebar).

**Admin nav group:** visually separated with a divider line and an "Admin" section label. Same `NavLink` component as user links. TanStack Router's `<Link>` with type-safe `to` prop.

### Button
Primary action element.

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
}
```

- `primary` — solid accent background
- `secondary` — outlined
- `danger` — red solid (delete, reset)
- `ghost` — minimal (inline actions)
- Loading state swaps children for a `Spinner` inline

### IconButton
Square button wrapping a single icon. Same variants as Button. `size` defaults to `md` with square dimensions.

```tsx
interface IconButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon: ReactNode
  label: string             // aria-label
  onClick?: () => void
}
```

### Card
Container for grouped content. No preset sizes — content determines width.

```tsx
interface CardProps {
  title?: string            // optional heading
  actions?: ReactNode       // top-right action slot (IconButton, Link)
  children: ReactNode
  className?: string
}
```

### FormField
Label + input wrapper. Every form input uses this.

```tsx
interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode       // single input element
}
```

### TextInput
Styled `<input type="text">` or `<textarea>`.

```tsx
interface TextInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: 'text' | 'number' | 'password'
  multiline?: boolean       // renders textarea
  disabled?: boolean
  maxLength?: number
}
```

### Select
Styled `<select>` dropdown.

```tsx
interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}
```

### Table
Generic data table. Renders `<table>` from an array of rows.

```tsx
interface TableColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode   // custom cell render
  sortable?: boolean
  align?: 'left' | 'right'
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  rows: T[]
  loading?: boolean
  emptyMessage?: string
  onSort?: (key: string) => void
}
```

Loading state renders skeleton rows. Empty state renders `emptyMessage` centered.

### Pill
Small badge for status, category, or permission level.

```tsx
interface PillProps {
  label: string
  variant?: 'info' | 'success' | 'warning' | 'danger'
}
```

### Modal
Overlay dialog. Blocks interaction with content behind it.

```tsx
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode         // Button(s) for confirm/cancel
}
```

Closes on backdrop click or Escape key.

### Toast
Notification bar. Global toast managed by `toastStore`.

```tsx
interface ToastProps {
  message: string
  variant?: 'success' | 'error' | 'info'
  duration?: number          // ms, default 3000
}
```

### Spinner
Loading indicator. Centered, no text.

```tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
}
```

### Link
Navigation link using TanStack Router's `<Link>` — type-safe `to` prop with route path params.

```tsx
interface LinkProps {
  to: string
  active?: boolean           // sidebar variant highlights itself
  children: ReactNode
}
```

### Tooltip
Hover/persistent tooltip.

```tsx
interface TooltipProps {
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  children: ReactNode        // trigger element
}
```

### Toggle
On/off switch for boolean settings.

```tsx
interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  label?: string
  disabled?: boolean
}
```

---

## Page Assemblies

Pages import shared components from `components/` and state hooks from `stores/`. Pages own their `.module.css` for layout-specific spacing. No page has its own button style, card style, or input style — all come from shared primitives.

| Page | Shared components used | State source |
|---|---|---|
| Login | TextInput, Button, Card | authStore (Zustand) |
| Dashboard | Card, Table, Button, Pill, Spinner | `useBuckets()` (TanStack Query) |
| BucketDetail | Card, Table, Button, Pill, Modal, FormField, TextInput, Select | `useBuckets()` + `useTransactions()` |
| BucketForm | Card, FormField, TextInput, Select, Button | `useCreateBucket()` / `useUpdateBucket()` mutation |
| Transactions | Table, Button, Pill, Modal, Tooltip | `useTransactions()` |
| TransactionForm | Card, FormField, TextInput, Button | `useCreateTransaction()` / `useUpdateTransaction()` mutation |
| Insights | Card, Spinner, Table | `useInsightSummary()` + `useInsightMonthly()` |
| Settings | Card, FormField, Select, Toggle, Button | `useSettings()` |
| Profile | Card, Pill | authStore (Zustand) |
| AdminUsers | Table, Button, Modal, FormField, TextInput | authStore (admin check) + `useAdminBuckets()` |
| AdminBuckets | Table, Button, Modal, FormField, TextInput, Select, Pill, Spinner | `useAdminBuckets()` + mutations |
| AdminTransactions | Table, Button, Modal, FormField, TextInput, Tooltip, Pill | `useAdminTransactions()` + mutations |
| NotFound | Card | — |

---

## State Management Interfaces

### Zustand Stores (client state)

#### authStore
```ts
interface AuthState {
  user: components["schemas"]["UserResponse"] | null
  loading: boolean
  login(username: string, password: string): Promise<void>
  logout(): Promise<void>
  checkSession(): Promise<void>
}
```

#### toastStore
```ts
interface ToastState {
  message: string | null
  variant: 'success' | 'error' | 'info'
  show(msg: string, variant?: 'success' | 'error' | 'info', duration?: number): void
  dismiss(): void
}
```

### TanStack Query Hooks (server state)

#### useBuckets
```ts
// Queries
function useBuckets(): UseQueryResult<BucketResponse[]>
function useAdminBuckets(): UseQueryResult<BucketResponse[]>
function useBucket(id: number): UseQueryResult<BucketResponse | null>

// Mutations
function useCreateBucket(): UseMutationResult<BucketResponse, Error, BucketCreate>
function useUpdateBucket(): UseMutationResult<BucketResponse, Error, {id: number; data: BucketUpdate}>
function useDeleteBucket(): UseMutationResult<void, Error, number>
function useResetBucket(): UseMutationResult<BucketResponse, Error, number>
function useShareBucket(): UseMutationResult<BucketShareResponse, Error, {id: number; userId: number; permission: string}>
function useRemoveShare(): UseMutationResult<void, Error, {id: number; userId: number}>
```

#### useTransactions
```ts
// Queries
function useTransactions(bucketId: number, includeDeleted?: boolean): UseQueryResult<TransactionResponse[]>
function useAdminTransactions(): UseQueryResult<TransactionResponse[]>

// Mutations
function useCreateTransaction(): UseMutationResult<TransactionResponse, Error, {bucketId: number; data: TransactionCreate}>
function useUpdateTransaction(): UseMutationResult<TransactionResponse, Error, {id: number; data: TransactionUpdate}>
function useSoftDeleteTransaction(): UseMutationResult<void, Error, number>
function useUndoDeleteTransaction(): UseMutationResult<TransactionResponse, Error, number>
function useAdminUpdateTransaction(): UseMutationResult<TransactionResponse, Error, {id: number; data: TransactionUpdate}>
function useAdminSoftDeleteTransaction(): UseMutationResult<void, Error, number>
function useAdminUndoDeleteTransaction(): UseMutationResult<TransactionResponse, Error, number>
```

#### useInsights
```ts
function useInsightSummary(): UseQueryResult<InsightSummary[]>
function useInsightMonthly(): UseQueryResult<MonthlyTrend[]>
```

#### useSettings
```ts
function useSettings(): UseQueryResult<UserSettingsResponse>
function useUpdateSettings(): UseMutationResult<UserSettingsResponse, Error, UserSettingsUpdate>
```

---

## CSS Conventions

### Module files
Every component/page gets `Name.module.css`. Classes are locally scoped by the module system.

```css
/* Button.module.css */
.root {
  font-family: var(--font-sans);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.variantPrimary {
  background: var(--color-accent);
  color: var(--color-accent-text);
}
.variantSecondary {
  border: 1px solid var(--color-border);
  background: transparent;
}
/* ... etc */
```

### Global variables (`global.css`)
```css
:root {
  --color-accent: #3B82F6;
  --color-accent-text: #FFFFFF;
  --color-danger: #EF4444;
  --color-border: #D1D5DB;
  --color-bg: #FFFFFF;
  --color-bg-secondary: #F9FAFB;
  --color-text: #111827;
  --color-text-secondary: #6B7280;
  --font-sans: system-ui, -apple-system, sans-serif;
  --radius-sm: 6px;
  --radius-md: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

### Component CSS rules
- Use `.root` for the top-level element of every component
- Use `.variantX`, `.sizeX` for variant/size modifiers
- Use `.withX` for boolean state modifiers (`.withError`, `.withLoading`)
- Use `.slotX` for named child slots (`.slotTitle`, `.slotActions`)
- No `@media` queries inside component modules — page-level modules handle responsive layout

---

## Build Phases

### Phase 1 — Project Scaffold

```bash
cd ~/projects/budgie
mkdir frontend && cd frontend
bun create vite . --template react-ts
bun add @mantine/core @mantine/hooks @tabler/icons-react recharts zustand @tanstack/react-query
bun add @tanstack/react-router openapi-fetch openapi-typescript @types/node
bun add --dev @biomejs/biome husky lint-staged @testing-library/react @testing-library/jest-dom vitest @playwright/test
```

**Biome config** (`biome.json`):
```json
{
  "$schema": "https://biomejs.dev/schemas/1.9/latest/schema.json",
  "organizeImports": { "enabled": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "style": { "noDefaultExport": "off" },
      "correctness": { "useExhaustiveDependencies": "off" }
    }
  },
  "javascript": { "parser": { "unsafeParameterDecorators": true } },
  "files": { "ignore": ["src/api/generated.ts", "src/router/generated.ts", "dist"] }
}
```

**Husky + lint-staged setup:**
```bash
bunx husky init
echo "bun lint-staged --no-config --allow-empty" > .husky/pre-commit
```

**`package.json` additions:**
```json
{
  "scripts": {
    "lint": "biome check --apply src/",
    "format": "biome format --write src/",
    "check": "biome check src/",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.ts": "biome check --apply",
    "*.tsx": "biome check --apply"
  }
}
```

**Directory structure** (post-scaffold):
```
frontend/
├── biome.json
├── .husky/pre-commit
├── package.json
├── vite.config.ts
├── tsconfig.json
├── playwright.config.ts
├── index.html
├── src/
│   ├── main.tsx
│   ├── global.css
│   ├── App.tsx
│   ├── api/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── generated.ts
│   ├── stores/
│   │   ├── index.ts
│   │   ├── authStore.ts
│   │   ├── toastStore.ts
│   │   └── queries/
│   │       ├── index.ts
│   │       ├── useBuckets.ts
│   │       ├── useTransactions.ts
│   │       ├── useInsights.ts
│   │       └── useSettings.ts
│   ├── router/
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── generated.ts
│   ├── components/
│   │   └── (15 component dirs)
│   ├── pages/
│   │   └── (14 page dirs)
│   ├── hooks/
│   │   ├── index.ts
│   │   └── useTheme.ts
│   └── tests/e2e/
│       ├── fixtures/seed.ts
│       └── (8 spec files)
└── dist/
```

### Phase 2 — Codegen Setup

Generate TypeScript types from the live backend OpenAPI spec:

```bash
# Start backend
cd ~/projects/budgie/backend
DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --port 8000 &

# Generate types — use bunx, never npx
cd ~/projects/budgie/frontend
bunx openapi-typescript http://localhost:8000/api/openapi.json --output src/api/generated.ts

# Kill backend
kill %1
```

**Generated type usage** — all query hooks import from `api/generated.ts`:
```ts
import { components } from "../api/generated"
type BucketResponse = components["schemas"]["BucketResponse"]
type BucketCreate = components["schemas"]["BucketCreate"]
```

### Phase 3 — State Management

Two layers: **Zustand for client state** (auth session, toast notifications) and **TanStack Query for server state** (buckets, transactions, insights, settings).

**Client instance** (`api/client.ts`):
```ts
import createClient from "openapi-fetch"
import type { paths } from "./generated"

export const client = createClient<paths>({
  baseUrl: "/api",
  // Session cookie auth — no Bearer token needed.
  // Django sets sessionid cookie on login; browser sends it automatically.
})
```

**Auth store** (Zustand — client state only):
```ts
import { create } from "zustand"
import { client } from "../api/client"

interface AuthState {
  user: components["schemas"]["UserResponse"] | null
  loading: boolean
  login(username: string, password: string): Promise<void>
  logout(): Promise<void>
  checkSession(): Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (username, password) => { /* calls POST /api/auth/login */ },
  logout: async () => { /* calls POST /api/auth/logout */ },
  checkSession: async () => { /* calls GET /api/auth/me or checks cookie */ },
}))
```

**TanStack Query hooks** — one file per domain. Each exports query hooks and mutation hooks.

```ts
// stores/queries/useBuckets.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "../../api/client"
import type { components } from "../../api/generated"

type BucketResponse = components["schemas"]["BucketResponse"]
type BucketCreate = components["schemas"]["BucketCreate"]

export function useBuckets() {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/buckets")
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useCreateBucket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: BucketCreate) => {
      const { data, error } = await client.POST("/api/buckets", { body })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  })
}

// Admin variants call same endpoints — backend enforces admin check.
export function useAdminBuckets() {
  return useQuery({
    queryKey: ["buckets", "admin"],
    queryFn: async () => {
      const { data, error } = await client.GET("/api/buckets", { params: { user_id: -1 } })
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}
```

Same pattern for `useTransactions.ts`, `useInsights.ts`, `useSettings.ts`.

**Query keys convention:**
- `["buckets"]` — user's own buckets
- `["buckets", "admin"]` — admin view of all buckets
- `["buckets", bucketId, "transactions"]` — transactions for a specific bucket
- `["buckets", bucketId, "transactions", "admin"]` — admin view
- `["insights", "summary"]`, `["insights", "monthly"]`
- `["settings"]`

Mutations always invalidate the relevant query key. No manual cache management.

### Phase 4 — Router + Pages

TanStack Router defines a typed route tree. Routes have `loader` functions that pre-fetch data via TanStack Query before the page renders (no flash of loading state). Pages receive data via `useLoaderData()` or call TanStack Query hooks directly.

**Route tree definition** (`router/routes.ts`):
```ts
import { route } from "@tanstack/react-router"
import { queryClient } from "../stores/queries"
import { useAuthStore } from "../stores"

export const rootRoute = route("/", {
  // Auth guard — redirect to /login if not authenticated
  beforeLoad: async () => {
    const { user } = useAuthStore.getState()
    if (!user) throw redirect({ to: "/login" })
  },
})

export const loginRoute = route("/login", rootRoute, {
  component: lazy(() => import("../pages/Login")),
})

export const dashboardRoute = route("/", rootRoute, {
  component: lazy(() => import("../pages/Dashboard")),
  // Pre-fetch buckets before Dashboard renders
  loader: async () => {
    await queryClient.ensureQueryData(["buckets"])
  },
})

export const bucketDetailRoute = route("/buckets/$id", rootRoute, {
  component: lazy(() => import("../pages/BucketDetail")),
  loader: async ({ params }) => {
    await Promise.all([
      queryClient.ensureQueryData(["buckets", params.id]),
      queryClient.ensureQueryData(["buckets", params.id, "transactions"]),
    ])
  },
})
// ... all 14 routes defined
```

**Route table** (one route per page, type-safe `$id` params):

| Route pattern | Page | Loader pre-fetches |
|---|---|---|
| `/login` | Login | — |
| `/` | Dashboard | `["buckets"]` |
| `/buckets/new` | BucketForm | — |
| `/buckets/$id` | BucketDetail | `["buckets", id]`, `["buckets", id, "transactions"]` |
| `/buckets/$id/edit` | BucketForm | `["buckets", id]` |
| `/buckets/$id/transactions` | Transactions | `["buckets", id, "transactions"]` |
| `/buckets/$id/transactions/new` | TransactionForm | `["buckets", id]` |
| `/transactions/$id/edit` | TransactionForm | `["buckets", tid, "transactions"]` |
| `/insights` | Insights | `["insights", "summary"]`, `["insights", "monthly"]` |
| `/settings` | Settings | `["settings"]` |
| `/profile` | Profile | — |
| `/admin/users` | AdminUsers | `["buckets", "admin"]` |
| `/admin/buckets` | AdminBuckets | `["buckets", "admin"]` |
| `/admin/transactions` | AdminTransactions | `["buckets", admin, "transactions"]` |
| `*` | NotFound | — |

**App.tsx structure:**
```tsx
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"

function App() {
  return <RouterProvider router={router} />
}
```

**main.tsx entry point:**
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { router } from "./router"

const queryClient = new QueryClient()

render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>,
  document.getElementById("root")
)
```

### Phase 5 — E2E Tests

Playwright tests run against a dev backend with a seeded test database.

**Test structure** (`tests/e2e/`):
```
frontend/tests/e2e/
├── auth.spec.ts              # login, logout, session persistence
├── buckets.spec.ts           # create, edit, delete, reset, share
├── transactions.spec.ts      # create, edit, soft delete, undo
├── insights.spec.ts          # summary + monthly charts render
├── settings.spec.ts          # update currency + theme
├── admin-users.spec.ts       # admin CRUD user
├── admin-buckets.spec.ts     # admin cross-user bucket management
└── admin-transactions.spec.ts # admin cross-user transaction management
```

**Backend test DB fixture** (`tests/e2e/fixtures/seed.ts`):
Creates a known set of users, buckets, and transactions so tests can assert against exact values.

**Playwright config** (`playwright.config.ts`):
```ts
import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "cd ../backend && DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --port 8000",
    port: 8000,
  },
  use: { baseURL: "http://localhost:5173" },
})
```

---

## Checklist

- [ ] Project scaffolded with Vite + React + TypeScript + Mantine
- [ ] Biome configured (biome.json) — formatter + linter + import organizer
- [ ] Husky + lint-staged pre-commit hook runs `biome check --apply` on staged .ts/.tsx
- [ ] 15 shared components implemented with CSS modules + barrel exports
- [ ] Layout shell with sidebar nav (user + admin sections)
- [ ] openapi-typescript codegen configured — types in `api/generated.ts`
- [ ] API client wired (`api/client.ts`)
- [ ] 2 Zustand stores implemented (auth, toast)
- [ ] 4 TanStack Query hook files implemented (buckets, transactions, insights, settings) with query + mutation hooks
- [ ] TanStack Router route tree defined with loaders — type-safe routes + generated types
- [ ] 14 pages built and lazy-loaded via TanStack Router
- [ ] Login page — full-screen centered form, redirects to dashboard
- [ ] Dashboard — all buckets overview with balances
- [ ] BucketDetail — bucket info + transactions + sharing panel
- [ ] BucketForm — create/edit bucket (shared component)
- [ ] Transactions — filterable table with soft delete / undo (search param: `include_deleted`)
- [ ] TransactionForm — create/edit transaction
- [ ] Insights — summary + monthly trend charts (recharts)
- [ ] Settings — currency + theme toggle
- [ ] Profile — user info display
- [ ] AdminUsers — user table + create/delete
- [ ] AdminBuckets — cross-user bucket table + CRUD
- [ ] AdminTransactions — cross-user transaction table + edit/delete/undo
- [ ] E2E tests passing (auth, buckets, transactions, insights, settings, admin flows)
