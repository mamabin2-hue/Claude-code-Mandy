import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 需要子路徑 /Claude-code-Mandy/；
  // 部署到 Vercel 時（會自動帶入 VERCEL 環境變數）改用根路徑 /。
  base: process.env.VERCEL ? '/' : '/Claude-code-Mandy/',
})
