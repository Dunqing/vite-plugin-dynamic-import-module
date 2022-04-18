import { defineConfig } from 'vite'
import importDynamicModule from 'vite-plugin-import-dynamic-module'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), importDynamicModule()],
})
