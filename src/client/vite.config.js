import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: resolve(__dirname),
    plugins: [react()],
    server: {
        proxy: {
            '/socket.io': {
                target: 'http://localhost:3004',
                ws: true,
            },
        },
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            output: {
                entryFileNames: 'bundle.js',
                chunkFileNames: 'bundle.js',
                assetFileNames: '[name][extname]',
            },
        },
    },
});
