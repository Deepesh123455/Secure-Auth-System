import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

// Fix for __dirname in TypeScript (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
  },
  
  server: {
    proxy: {
      // ⚡ This forwards requests to your backend
      '/api': {
        target: 'http://56.228.32.157:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    watch:{
      usePolling: true
    },
    host: true,
    port: 5173
  },
});