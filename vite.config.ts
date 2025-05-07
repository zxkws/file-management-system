import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/file-management-system',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
