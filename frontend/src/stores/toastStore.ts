import { create } from "zustand";

type ToastVariant = "success" | "error" | "info";

interface ToastState {
  message: string | null;
  variant: ToastVariant;
  show: (msg: string, variant?: ToastVariant, duration?: number) => void;
  dismiss: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  variant: "info",
  show: (msg, variant = "info", duration = 3000) => {
    set({ message: msg, variant });
    if (duration > 0) {
      setTimeout(() => set({ message: null }), duration);
    }
  },
  dismiss: () => set({ message: null }),
}));
