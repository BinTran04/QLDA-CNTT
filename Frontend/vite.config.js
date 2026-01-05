import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Chạy Frontend ở cổng 3000
    proxy: {
      "/api": {
        target: "http://localhost:5000", // Trỏ về Backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
