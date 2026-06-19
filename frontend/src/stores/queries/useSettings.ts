import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkError, client } from "../../api/client";
import type { components } from "../../api/generated";

type UserSettingsResponse = components["schemas"]["UserSettingsResponse"];
type UserSettingsUpdate = components["schemas"]["UserSettingsUpdate"];

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await client.GET("/api/settings/");
      checkError(res);
      // biome-ignore lint/style/noNonNullAssertion: checkError throws on error so data is always present
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
      // biome-ignore lint/style/noNonNullAssertion: checkError throws on error so data is always present
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });
}
