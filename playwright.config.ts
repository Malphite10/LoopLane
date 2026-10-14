import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:8889",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "/opt/buildhome/node-deps/node_modules/.bin/netlify dev --port 8889",
    url: "http://localhost:8889/api/health",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
