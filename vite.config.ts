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

  const firebaseApiKey = (
    process.env.VITE_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    env.VITE_FIREBASE_API_KEY ||
    env.FIREBASE_API_KEY ||
    ''
  ).trim();
  const firebaseProjectId = (
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    env.VITE_FIREBASE_PROJECT_ID ||
    env.FIREBASE_PROJECT_ID ||
    ''
  ).trim();
  const firebaseAuthDomain = (
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    env.FIREBASE_AUTH_DOMAIN ||
    ''
  ).trim();
  const firebaseAppId = (
    process.env.VITE_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    env.VITE_FIREBASE_APP_ID ||
    env.FIREBASE_APP_ID ||
    ''
  ).trim();
  const firebaseDatabaseId = (
    process.env.VITE_FIREBASE_DATABASE_ID ||
    process.env.FIREBASE_DATABASE_ID ||
    env.VITE_FIREBASE_DATABASE_ID ||
    env.FIREBASE_DATABASE_ID ||
    ''
  ).trim();

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GOOGLE_API_KEY': JSON.stringify(geminiApiKey),
      'process.env.API_KEY': JSON.stringify(geminiApiKey),
      'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
      'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId),
      'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain),
      'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseAppId),
      'process.env.VITE_FIREBASE_DATABASE_ID': JSON.stringify(firebaseDatabaseId),
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
