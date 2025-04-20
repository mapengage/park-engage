import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  server: {
    port: Number(process.env.PORT) || 5173, // Use Heroku's port or fallback to 5173 for local dev
    allowedHosts: [
      "park-engage-frontend-a2ca754abeac.herokuapp.com", // Allowed host
      "localhost", // Allow localhost for development
      ".herokuapp.com", // Allow Heroku's generic domain
    ],
  },
});
