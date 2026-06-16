import createClient from "openapi-fetch";
import type { paths } from "./generated";

export const client = createClient<paths>({
  baseUrl: "",
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
