import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: resolve(__dirname, 'client'),
  plugins: [react(), tailwindcss()],
  build: {
    outDir: resolve(__dirname, '.vite/renderer/main_window'),
    emptyOutDir: false
  }
});