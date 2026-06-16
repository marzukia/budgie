import { useQuery } from "@tanstack/react-query";
import { client, checkError } from "../../api/client";
import type { components } from "../../api/generated";

type InsightSummary = components["schemas"]["InsightSummary"];
type MonthlyTrend = components["schemas"]["MonthlyTrend"];

export function useInsightSummary() {
  return useQuery({
    queryKey: ["insights", "summary"],
    queryFn: async () => {
      const res = await client.GET("/api/insights/summary");
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useInsightMonthly() {
  return useQuery({
    queryKey: ["insights", "monthly"],
    queryFn: async () => {
      const res = await client.GET("/api/insights/monthly");
      checkError(res);
      return res.data ?? [];
    },
  });
}
