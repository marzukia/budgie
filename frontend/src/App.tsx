import { useEffect } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { useAuthStore, useToastStore } from "./stores";
import { Toast } from "./components";

function App() {
  const { checkSession } = useAuthStore();
  const { message, variant, dismiss } = useToastStore();

  useEffect(() => {
    checkSession();
  }, []);

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
