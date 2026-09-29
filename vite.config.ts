import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  let geminiApiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    env.GEMINI_API_KEY ||
    env.VITE_GEMINI_API_KEY ||
    env.GOOGLE_API_KEY ||
    env.API_KEY ||
    env.GEMINI_KEY ||
    env.GOOGLE_GEMINI_API_KEY ||
    ''
  )
    .replace(/^["']+|["']+$/g, '')
    .trim();

  if (!geminiApiKey || geminiApiKey === 'MY_GEMINI_API_KEY') {
    for (const val of [
      ...Object.values(process.env),
      ...Object.values(env),
    ]) {
      if (typeof val === 'string') {
        const candidate = val.replace(/^["']+|["']+$/g, '').trim();
        if (/^AIza[A-Za-z0-9_-]{25,}$/.test(candidate)) {
          geminiApiKey = candidate;
          break;
        }
      }
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GOOGLE_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.API_KEY': JSON.stringify(geminiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
