import createClient from "openapi-fetch";
import type { paths } from "./generated";

export const client = createClient<paths>({
  baseUrl: "/api",
});

export function checkError(res: { data?: unknown; error?: unknown }): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = res.error as any;
  if (!err) return;
  if (err && typeof err === "object" && "error" in err) {
    throw new Error(err.error as string);
  }
  throw new Error("request failed");
}
