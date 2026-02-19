import type { NextConfig } from "next";
import { resolve } from "path";
import { readFileSync } from "fs";

// Fix: shell environment may have empty ANTHROPIC_API_KEY (set by Claude Code).
// dotenv won't override existing env vars, so we manually load from .env.local
// when the shell value is empty.
try {
  const envLocal = readFileSync(resolve(__dirname, '.env.local'), 'utf-8');
  for (const line of envLocal.split('\n')) {
    if (!line.trim() || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const value = line.slice(eqIdx + 1).trim();
    // Only override if the current env value is empty/missing
    if (value && !process.env[key]) {
      process.env[key] = value;
    }
  }
} catch {
  // .env.local doesn't exist — that's fine
}

const nextConfig: NextConfig = {
  turbopack: {
    root: resolve(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
};

export default nextConfig;
