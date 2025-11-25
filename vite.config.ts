import { fileURLToPath, URL } from 'node:url'

import { defineConfig, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins: PluginOption[] = [vue(), vueJsx(), tailwindcss()]

  if (mode !== 'production') {
    const mod = await import('vite-plugin-vue-devtools')
    const vueDevTools = mod.default
    if (vueDevTools) {
      plugins.push(vueDevTools() as PluginOption)
    }
  }

  return {
    base: '/scanner',
    plugins,
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  }
})
