import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function findGeminiKeyInEnv() {
  const explicit =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    "";

  const cleanedExplicit = explicit.replace(/^["']+|["']+$/g, "").trim();
  if (cleanedExplicit && cleanedExplicit !== "MY_GEMINI_API_KEY") {
    return cleanedExplicit;
  }

  for (const val of Object.values(process.env)) {
    if (typeof val === "string") {
      const trimmed = val.replace(/^["']+|["']+$/g, "").trim();
      if (/^AIza[A-Za-z0-9_-]{25,}$/.test(trimmed)) {
        return trimmed;
      }
    }
  }

  return "";
}

/**
 * Post-build helper for Coolify / Nixpacks deployments.
 *
 * Why this is needed:
 * Nixpacks's Node SPA provider detects Vite and configures the container to start
 * `caddy run --config /assets/Caddyfile` instead of `node server.ts`, which causes
 * `/api/vocabulary/*` POST requests to return HTTP 404.
 *
 * This script:
 * 1. Intercepts the `caddy` binary inside the Nixpacks container so that when the
 *    container runs `caddy run ...` at startup, it launches `node /app/server.ts`
 *    (Full-Stack Express + Gemini AI server) instead of static-only Caddy!
 * 2. Also creates `/app/dist/api/runtime-env` and `/app/dist/env-config.json` as
 *    fallbacks if served statically.
 */
function runPostBuild() {
  const distDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) {
    return;
  }

  const buildTimeKey = findGeminiKeyInEnv();

  // 1. Write static fallback config files into dist/ and dist/api/
  const payload = JSON.stringify({
    geminiApiKey: buildTimeKey,
  });

  fs.writeFileSync(path.join(distDir, "env-config.json"), payload, "utf8");

  const distApiDir = path.join(distDir, "api");
  fs.mkdirSync(distApiDir, { recursive: true });
  fs.writeFileSync(path.join(distApiDir, "runtime-env"), payload, "utf8");

  // 2. If running inside a Nixpacks/Coolify build that installed Caddy,
  //    replace `caddy run` with `node /app/server.ts` so the Express backend runs at runtime!
  try {
    const caddyBin = execSync("which caddy", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();

    if (caddyBin && fs.existsSync(caddyBin)) {
      const realCaddyBin = `${caddyBin}.real`;
      if (!fs.existsSync(realCaddyBin)) {
        fs.copyFileSync(caddyBin, realCaddyBin);
        fs.chmodSync(realCaddyBin, 0o755);
      }

      const appDir = process.cwd();
      const wrapperScript = `#!/bin/sh
if [ "$1" = "run" ]; then
  echo "[HanViet Lexicon] Intercepted 'caddy run' -> Launching Full-Stack Express Server (node ${appDir}/server.ts)..."
  export NODE_ENV=production
  cd "${appDir}"
  exec node "${appDir}/server.ts"
else
  exec "${realCaddyBin}" "$@"
fi
`;
      fs.writeFileSync(caddyBin, wrapperScript, { mode: 0o755 });
      fs.chmodSync(caddyBin, 0o755);
      console.log(
        `[postbuild-coolify] Installed Full-Stack Node Express bridge at ${caddyBin}`
      );
    }
  } catch {
    // caddy is not installed in this environment; nothing to wrap
  }
}

runPostBuild();
