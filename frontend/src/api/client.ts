import createClient from "openapi-fetch";
import type { paths } from "./generated";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

/** Wrap fetch to add CSRF token header for mutating requests */
async function csrfFetch(request: Request): Promise<Response> {
  const method = request.method;
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const token = getCookie("csrftoken");
    if (token) {
      const headers = new Headers(request.headers);
      headers.set("X-CSRFToken", token);
      request = new Request(request, { headers });
    }
  }
  return fetch(request);
}

export const client = createClient<paths>({
  baseUrl: "",
  fetch: csrfFetch,
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
