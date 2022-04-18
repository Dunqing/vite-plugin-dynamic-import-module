import type { Plugin } from 'vite'

export default function importDynamicModule(): Plugin {
  return {
    name: 'vite-plugin-import-dynamic-module',
  }
}
