import { create } from "zustand";
import { checkError, client } from "../api/client";
import type { components } from "../api/generated";

type UserResponse = components["schemas"]["UserResponse"];

interface AuthState {
  user: UserResponse | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  login: async (username, password) => {
    const res = await client.POST("/api/auth/login", {
      body: { username, password },
    });
    checkError(res);
    // biome-ignore lint/style/noNonNullAssertion: checkError throws on error so data is always present
    set({ user: res.data!.user, loading: false });
  },
  logout: async () => {
    await client.POST("/api/auth/logout");
    set({ user: null, loading: false });
  },
  checkSession: async () => {
    const res = await client.GET("/api/auth/me");
    const err = res.error;
    if (err) {
      set({ user: null, loading: false });
      return;
    }
    // biome-ignore lint/style/noNonNullAssertion: error case is handled above so data is present
    set({ user: res.data!.user, loading: false });
  },
}));
