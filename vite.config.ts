import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@components': resolve(__dirname, 'src/components'),
            '@styles': resolve(__dirname, 'src/styles'),
            '@utils': resolve(__dirname, 'src/utils'),
        },
    },
    build: {
        // Output to 'dist' folder for Cloudflare
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: false,
        minify: 'terser',
        rollupOptions: {
            input: {
                // Main site entry point
                main: resolve(__dirname, 'index.html'),
                // Panel subdomain entry point
                panel: resolve(__dirname, 'panel/index.html'),
            },
            output: {
                manualChunks: undefined,
            },
        },
    },
})

