import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss(), svgr()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },

  server: {
    allowedHosts: [".ngrok-free.app"],
    host: true, // слушать 0.0.0.0, а не только localhost
    port: 5173,

    // proxy: {
    //   "/api": {
    //     target: "https://b3eae851623359.lhr.life", // или IP твоего локального сервера
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ""),
    //   },
    // },
  },
});
