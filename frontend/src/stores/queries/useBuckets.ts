import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client, checkError } from "../../api/client";
import type { components } from "../../api/generated";

type BucketResponse = components["schemas"]["BucketResponse"];
type BucketCreate = components["schemas"]["BucketCreate"];
type BucketUpdate = components["schemas"]["BucketUpdate"];

export function useBuckets() {
  return useQuery({
    queryKey: ["buckets"],
    queryFn: async () => {
      const res = await client.GET("/api/buckets/");
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useAdminBuckets() {
  return useQuery({
    queryKey: ["buckets", "admin"],
    queryFn: async () => {
      const res = await client.GET("/api/buckets/");
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useBucket(id: number) {
  return useQuery({
    queryKey: ["buckets", id],
    queryFn: async () => {
      const res = await client.GET("/api/buckets/{bucket_id}", {
        params: { path: { bucket_id: id } },
      });
      checkError(res);
      return res.data;
    },
  });
}

export function useCreateBucket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: BucketCreate) => {
      const res = await client.POST("/api/buckets/", { body });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  });
}

export function useUpdateBucket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: BucketUpdate;
    }) => {
      const res = await client.PUT("/api/buckets/{bucket_id}", {
        params: { path: { bucket_id: id } },
        body: data,
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  });
}

export function useDeleteBucket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await client.DELETE("/api/buckets/{bucket_id}", {
        params: { path: { bucket_id: id } },
      });
      checkError(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  });
}

export function useResetBucket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await client.POST("/api/buckets/{bucket_id}/reset", {
        params: { path: { bucket_id: id } },
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  });
}

export function useShareBucket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      userId,
      permission,
    }: {
      id: number;
      userId: number;
      permission: string;
    }) => {
      const res = await client.POST("/api/buckets/{bucket_id}/share", {
        params: {
          path: { bucket_id: id },
          query: { user_id: userId, permission },
        },
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ["buckets", id] }),
  });
}

export function useListShares(bucketId: number) {
  return useQuery({
    queryKey: ["buckets", bucketId, "shares"],
    queryFn: async () => {
      const res = await client.GET("/api/buckets/{bucket_id}/shares", {
        params: { path: { bucket_id: bucketId } },
      });
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useRemoveShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      userId,
    }: {
      id: number;
      userId: number;
    }) => {
      const res = await client.DELETE(
        "/api/buckets/{bucket_id}/share/{user_id}",
        { params: { path: { bucket_id: id, user_id: userId } } },
      );
      checkError(res);
    },
    onSuccess: (_, { id }) =>
      qc.invalidateQueries({ queryKey: ["buckets", id] }),
  });
}

export function useBucketLogs(bucketId: number) {
  return useQuery({
    queryKey: ["buckets", bucketId, "logs"],
    queryFn: async () => {
      const res = await client.GET("/api/buckets/{bucket_id}/logs", {
        params: { path: { bucket_id: bucketId } },
      });
      checkError(res);
      return res.data ?? [];
    },
  });
}
