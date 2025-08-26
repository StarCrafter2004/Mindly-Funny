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
  build: {
    minify: "esbuild", // можно "terser", но esbuild быстрее
    target: "es2018", // уменьшает полифилы, если поддержка старых браузеров не нужна
    cssMinify: true,
    chunkSizeWarningLimit: 600, // чтобы не спамил при больших чанках
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    allowedHosts: [".ngrok-free.app"],
    host: true,
    port: 5173,
  },
});
