import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig(async () => {
  const reactPlugin = (await import('@vitejs/plugin-react')).default
  return {
    plugins: [reactPlugin()],
  }
})
  // Ensure that the React plugin is used with dynamic import
