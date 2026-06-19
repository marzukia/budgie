import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command:
      "cd ../backend && DJANGO_SETTINGS_MODULE=budgie.settings .venv/bin/uvicorn budgie.asgi:application --port 8000",
    port: 8000,
    reuseExistingServer: true,
  },
  use: { baseURL: "http://localhost:5173" },
});
