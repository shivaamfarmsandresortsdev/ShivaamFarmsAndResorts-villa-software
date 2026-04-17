import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://shivaamfarmsandresorts-villa-software-1.onrender.com", // 👈 backend port
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
