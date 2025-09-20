import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    server: {
      port: 3000,
      proxy:
        mode === "development"
          ? {
              "/api": "http://localhost:5000",
            }
          : {},
    },
  };
});
