import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { useAuthStore, useToastStore } from "./stores";
import { Toast } from "./components";

function App() {
  const checkSession = useAuthStore((s) => s.checkSession);
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const { message, variant, dismiss } = useToastStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!loading && user && window.location.pathname === "/login") {
      router.navigate({ to: "/" });
    }
  }, [user, loading]);

  return (
    <>
      <RouterProvider router={router} />
      {message && (
        <Toast message={message} variant={variant} onClose={dismiss} />
      )}
    </>
  );
}

export default App;
