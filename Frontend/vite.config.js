import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    cacheDir: './.vite-cache',
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "react-toastify",
    ],
    force: true,
  },
  server: {
    watch: {
      usePolling: true,
    },
  },
  // 🚀 Added these lines to stop LightningCSS crash on Vercel
  css: {
    transformer: 'postcss',
  },
  build: {
    cssMinify: false, // disable lightningcss to fix linux build issue
  },
});
