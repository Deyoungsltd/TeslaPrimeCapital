#!/usr/bin/env node
/**
 * Env-Layered Command Runner (`node scripts/with-env.mjs <cmd> [args…]`).
 *
 * The Prisma CLI (and any non-Next process) only auto-loads `.env` — it never
 * sees Next.js layered files like `.env.local`. Running `npx prisma db push`
 * against a Next-style env layout therefore dies with
 * "Environment variable not found: DATABASE_URL" even though the dev server
 * works fine. This runner closes the gap:
 *
 *   1. Parses `.env` then `.env.local` (local wins, matching Next.js layering)
 *   2. Injects them into the child process WITHOUT overriding variables that
 *      already exist in the real environment (CI/deploy secrets stay supreme)
 *   3. Spawns the requested command with inherited stdio and propagates its
 *      exit code
 *
 * Wired through package.json as `npm run db:push` / `npm run db:seed` so the
 * onboarding flow works identically on Windows PowerShell and POSIX shells.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[line.slice(0, eq).trim()] = value;
  }
  return out;
}

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/with-env.mjs <command> [args…]');
  process.exit(1);
}

const layered = {
  ...loadEnvFile(path.join(process.cwd(), '.env')),
  ...loadEnvFile(path.join(process.cwd(), '.env.local')),
};
const env = { ...process.env };
let injected = 0;
for (const [key, value] of Object.entries(layered)) {
  if (!(key in env)) {
    env[key] = value;
    injected++;
  }
}

const child = spawn(command, args, { stdio: 'inherit', env, shell: true, cwd: process.cwd() });
child.on('error', (err) => {
  console.error(`Failed to launch "${command}": ${err.message}`);
  process.exit(1);
});
child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`"${command}" terminated by signal ${signal}.`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});
