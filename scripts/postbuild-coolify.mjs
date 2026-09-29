import fs from "fs";
import path from "path";
import { execSync } from "child_process";

/**
 * Post-build helper for Coolify / Nixpacks deployments.
 * 1. Writes dist/env-config.json if build-time GEMINI_API_KEY is available.
 * 2. If Coolify/Nixpacks generated /assets/Caddyfile (Static Site mode),
 *    injects a `/api/runtime-env` handler into /assets/Caddyfile so Caddy
 *    exposes the container's runtime GEMINI_API_KEY even when server.ts is not started.
 */
function runPostBuild() {
  const distDir = path.resolve(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) {
    return;
  }

  const buildTimeKey = (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.API_KEY ||
    ""
  )
    .replace(/^["']+|["']+$/g, "")
    .trim();

  // Create fallback static JSON file in dist/
  const envConfigPath = path.join(distDir, "env-config.json");
  fs.writeFileSync(
    envConfigPath,
    JSON.stringify({
      geminiApiKey:
        buildTimeKey && buildTimeKey !== "MY_GEMINI_API_KEY"
          ? buildTimeKey
          : "",
    }),
    "utf8"
  );

  // Check if running inside a Coolify / Nixpacks Caddy container build
  const caddyfilePath = "/assets/Caddyfile";
  if (fs.existsSync(caddyfilePath)) {
    try {
      const original = fs.readFileSync(caddyfilePath, "utf8");
      if (!original.includes("/api/runtime-env")) {
        const runtimeHandler = `
\thandle /api/runtime-env {
\t\theader Content-Type "application/json"
\t\trespond \`{"geminiApiKey":"{env.GEMINI_API_KEY}","viteGeminiApiKey":"{env.VITE_GEMINI_API_KEY}","googleApiKey":"{env.GOOGLE_API_KEY}","apiKey":"{env.API_KEY}"}\` 200
\t}
`;
        let patched = original;
        if (original.includes("root *")) {
          patched = original.replace("root *", `${runtimeHandler}\n\troot *`);
        } else if (original.includes("file_server")) {
          patched = original.replace(
            "file_server",
            `${runtimeHandler}\n\tfile_server`
          );
        }

        if (patched !== original) {
          fs.writeFileSync(caddyfilePath, patched, "utf8");
          try {
            execSync("caddy fmt --overwrite /assets/Caddyfile", {
              stdio: "ignore",
            });
          } catch {
            // Ignore if caddy binary is not in PATH
          }
          console.log(
            "[postbuild-coolify] Injected /api/runtime-env into /assets/Caddyfile"
          );
        }
      }
    } catch (err) {
      console.warn(
        "[postbuild-coolify] Skipping /assets/Caddyfile patch:",
        err
      );
    }
  }
}

runPostBuild();
