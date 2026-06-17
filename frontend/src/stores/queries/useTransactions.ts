import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { checkError, client } from "../../api/client";
import type { components } from "../../api/generated";

type TransactionResponse = components["schemas"]["TransactionResponse"];
type TransactionCreate = components["schemas"]["TransactionCreate"];
type TransactionUpdate = components["schemas"]["TransactionUpdate"];

export function useTransactions(bucketId: number, includeDeleted?: boolean) {
  return useQuery({
    queryKey: ["buckets", bucketId, "transactions", { includeDeleted }],
    queryFn: async () => {
      const res = await client.GET("/api/buckets/{bucket_id}/transactions", {
        params: {
          path: { bucket_id: bucketId },
          query: includeDeleted ? { include_deleted: true } : undefined,
        },
      });
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useAdminTransactions() {
  return useQuery({
    queryKey: ["buckets", "admin", "transactions"],
    queryFn: async () => {
      const res = await client.GET("/api/admin/transactions/", { params: {} });
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bucketId,
      data,
    }: {
      bucketId: number;
      data: TransactionCreate;
    }) => {
      const res = await client.POST("/api/buckets/{bucket_id}/transactions", {
        params: { path: { bucket_id: bucketId } },
        body: data,
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: (_, { bucketId }) =>
      qc.invalidateQueries({ queryKey: ["buckets", bucketId, "transactions"] }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      data,
    }: {
      transactionId: number;
      data: TransactionUpdate;
    }) => {
      const res = await client.PUT("/api/transactions/{transaction_id}", {
        params: { path: { transaction_id: transactionId } },
        body: data,
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
    }: {
      transactionId: number;
    }) => {
      const res = await client.DELETE("/api/transactions/{transaction_id}", {
        params: { path: { transaction_id: transactionId } },
      });
      checkError(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets"] }),
  });
}

export function useAdminTransactionsList() {
  return useQuery({
    queryKey: ["buckets", "admin", "transactions"],
    queryFn: async () => {
      const res = await client.GET("/api/admin/transactions/", { params: {} });
      checkError(res);
      return res.data ?? [];
    },
  });
}

export function useAdminUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      transactionId,
      data,
    }: {
      transactionId: number;
      data: TransactionUpdate;
    }) => {
      const res = await client.PUT("/api/transactions/{transaction_id}", {
        params: { path: { transaction_id: transactionId } },
        body: data,
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets", "admin"] }),
  });
}

export function useAdminSoftDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await client.DELETE("/api/transactions/{transaction_id}", {
        params: { path: { transaction_id: id } },
      });
      checkError(res);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets", "admin"] }),
  });
}

export function useAdminUndoDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await client.POST("/api/transactions/{transaction_id}/undo", {
        params: { path: { transaction_id: id } },
      });
      checkError(res);
      return res.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buckets", "admin"] }),
  });
}
