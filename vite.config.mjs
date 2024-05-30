import { defineConfig } from 'vite'
import shopify from 'vite-plugin-shopify'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        shopify({
            themeRoot: 'extensions/embed-popup-frontend',
            sourceCodeDir: 'frontend',
            entrypointsDir: 'frontend/entrypoints',
            snippetFile: 'vite-tag.liquid',

        }),
        react(),
    ]
})
