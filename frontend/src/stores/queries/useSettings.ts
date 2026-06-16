import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, checkError } from "../../api/client";
import type { components } from "../../api/generated";

type UserSettingsResponse = components["schemas"]["UserSettingsResponse"];
type UserSettingsUpdate = components["schemas"]["UserSettingsUpdate"];

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await client.GET("/api/settings/");
      checkError(res);
      return res.data!;
    },
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: UserSettingsUpdate) => {
      const res = await client.PUT("/api/settings/", { body });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
