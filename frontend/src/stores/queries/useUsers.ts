import { useQuery } from "@tanstack/react-query";
import { checkError, client } from "../../api/client";
import type { components } from "../../api/generated";

type UserResponse = components["schemas"]["UserResponse"];

export function useUserSearch(query: string) {
  return useQuery({
    queryKey: ["users", "search", query],
    enabled: query.length > 0,
    queryFn: async () => {
      const res = await client.GET("/api/users/search/", {
        params: { query: { q: query } },
      });
      checkError(res);
      return res.data ?? [];
    },
  });
}
