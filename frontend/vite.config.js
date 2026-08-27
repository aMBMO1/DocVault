import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  preview: {
    allowedHosts: [
      "docvault-production-27ee.up.railway.app",
    ],
  },
});