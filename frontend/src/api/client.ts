import createClient from "openapi-fetch";
import type { paths } from "./generated";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const client = createClient<paths>({
  baseUrl: "",
  headers({ method }) {
    // Django CSRF: send csrftoken cookie value as header on mutating requests
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") return {};
    const token = getCookie("csrftoken");
    return token ? { "X-CSRFToken": token } : {};
  },
});

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function checkError(res: { data?: unknown; error?: unknown }): void {
  const err = res.error;
  if (!err) return;

  if (err && typeof err === "object" && "error" in err) {
    throw new ApiError(
      String((err as { error: string }).error),
      (err as Record<string, unknown>).status as number | undefined,
      (err as Record<string, unknown>).detail,
    );
  }
  throw new ApiError("request failed");
}
