#!/usr/bin/env node
/**
 * Pre-Flight Environment Verifier (`npm run verify:env`).
 *
 * Reads `.env.local` (falling back to `.env`) and proves every external
 * dependency ACTUALLY connects before you waste an hour hunting a silent
 * failure inside the app:
 *
 *   1. Format/presence checks on all 13 required variables
 *   2. LIVE handshake per service:
 *      - PostgreSQL  → `prisma db execute "SELECT 1"` against DATABASE_URL
 *      - Redis       → real PING via the project's own ioredis dependency
 *      - Resend      → GET /domains with the API key (200 = key is valid)
 *      - Cloudinary  → GET /v1_1/{cloud}/ping with Basic auth (200 = creds work)
 *
 * Every check prints a one-line verdict plus the exact remediation hint, and
 * the process exits non-zero if any REQUIRED check fails — wire it into your
 * flow before `prisma db push`, before deploys, and after rotating any key.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(path.join(process.cwd(), 'package.json'));

/* ----------------------------------------------------------- env file load */
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const env = {
  ...loadEnvFile(path.join(process.cwd(), '.env')),
  ...loadEnvFile(path.join(process.cwd(), '.env.local')),
};

/* -------------------------------------------------------------- primitives */
const GREEN = '✅';
const RED = '❌';
const WARN = '⚠️ ';
let requiredFailures = 0;

function pass(label, detail) {
  console.log(`${GREEN} ${label.padEnd(34)} ${detail}`);
}
function fail(label, hint, required = true) {
  console.log(`${RED} ${label.padEnd(34)} ${hint}`);
  if (required) requiredFailures++;
}
function warn(label, hint) {
  console.log(`${WARN} ${label.padEnd(34)} ${hint}`);
}

async function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

/* ------------------------------------------------------------------ checks */
async function checkDatabase() {
  const url = env.DATABASE_URL ?? '';
  if (!url) return fail('DATABASE_URL', 'Missing — create a free Neon project and paste the pooled connection string.');
  if (!/^postgres(ql)?:\/\//.test(url)) return fail('DATABASE_URL', 'Must start with postgresql:// — copy the full string from Neon.');
  // Provider-specific trap: Aiven PostgreSQL terminates non-SSL startup packets
  // at the pg_hba layer, which Prisma reports as an opaque "Can't reach database
  // server" (P1001). Fail fast with the exact remediation instead of a 30s timeout.
  if (url.includes('aivencloud.com') && !/[?&]sslmode=/.test(url)) {
    return fail('DATABASE_URL', 'Aiven endpoint WITHOUT sslmode — Prisma will die with P1001. Re-copy the FULL "Service URI" (it ends in ?sslmode=require) or append it.');
  }
  try {
    const bin = path.join(process.cwd(), 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
    execFileSync(bin, ['db', 'execute', '--url', url, '--stdin'], {
      input: 'SELECT 1;',
      stdio: ['pipe', 'ignore', 'pipe'],
      timeout: 30000,
      env: { ...process.env, CHECKPOINT_DISABLE: '1' },
    });
    pass('DATABASE_URL', 'Connected — SELECT 1 executed cleanly.');
  } catch (err) {
    fail('DATABASE_URL', `Cannot reach/query the database. Verify host, credentials and that your IP is allowed. (${String(err.message).slice(0, 90)}…)`);
  }

  const direct = env.DIRECT_URL ?? '';
  if (!direct) return warn('DIRECT_URL', 'Missing — prisma db push/migrate needs the non-pooled (direct) endpoint.');
  if (direct.includes('aivencloud.com') && !/[?&]sslmode=/.test(direct)) {
    return fail('DIRECT_URL', 'Aiven endpoint WITHOUT sslmode — npm run db:push will die with P1001. Append ?sslmode=require.');
  }
  if (direct === url && direct.includes('-pooler')) {
    warn('DIRECT_URL', 'Equals the POOLED url — strip "-pooler" from the host for schema operations.');
  }
}

async function checkRedis() {
  const url = env.REDIS_URL ?? '';
  if (!url) return fail('REDIS_URL', 'Missing — create a free Upstash database and paste the rediss:// endpoint.');
  if (!/^rediss?:\/\//.test(url)) return fail('REDIS_URL', 'Must start with redis:// or rediss:// — Upstash production should be rediss://');
  if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
    warn('REDIS_URL', 'Points at localhost — fine for dev, broken in production.');
  }
  let client;
  try {
    const { default: Redis } = require('ioredis');
    const isTls = url.startsWith('rediss://');
    const caChain = env.REDIS_CA_CERT ? Buffer.from(env.REDIS_CA_CERT, 'base64').toString('utf8') : undefined;
    const allowUnverified = env.REDIS_TLS_ALLOW_UNVERIFIED === 'true';
    // Mirror the app's client contract exactly: provider CA when supplied,
    // the documented escape hatch when explicitly enabled, otherwise the
    // driver's default CA verification (public chains like Upstash pass,
    // private chains like Aiven correctly fail with guidance).
    const tlsOpts = isTls
      ? caChain
        ? { ca: caChain }
        : allowUnverified
          ? { rejectUnauthorized: false }
          : {}
      : undefined;
    client = new Redis(url, {
      lazyConnect: true,
      connectTimeout: 8000,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
      ...(tlsOpts ? { tls: tlsOpts } : {}),
    });
    client.on('error', () => {}); // verdict is rendered by the PING path, not the driver's stderr
    await withTimeout(client.connect(), 8000, 'Redis connect');
    const pong = await withTimeout(client.ping(), 5000, 'Redis ping');
    if (pong === 'PONG') {
      if (isTls && allowUnverified && !caChain) {
        warn('REDIS_URL', 'Connected via REDIS_TLS_ALLOW_UNVERIFIED (encrypted, unverified) — replace with REDIS_CA_CERT before launch.');
      } else {
        pass('REDIS_URL', 'Connected — PING returned PONG.');
      }
    } else {
      fail('REDIS_URL', `Unexpected PING reply: ${pong}`);
    }
  } catch (err) {
    const msg = String(err.message);
    if (/certificate|self.signed|unable to verify|UNABLE_TO_GET_ISSUER/i.test(msg)) {
      fail('REDIS_URL', 'TLS verification failed (private CA provider). Fix: npm run fetch:aiven-ca -- <project> <token>  → writes REDIS_CA_CERT for you, or temporarily set REDIS_TLS_ALLOW_UNVERIFIED=true.');
    } else {
      fail('REDIS_URL', `Cannot reach Redis. Verify the endpoint/password (use the rediss:// TLS URL on Upstash). (${msg.slice(0, 80)})`);
    }
  } finally {
    client?.disconnect();
  }
}

function checkSecrets() {
  const keys = ['JWT_ACCESS_SECRET', 'SESSION_MASTER_KEY', 'CRON_SECRET'];
  const seen = new Map();
  for (const key of keys) {
    const value = env[key] ?? '';
    if (!value) {
      fail(key, 'Missing — run: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
      continue;
    }
    if (value.length < 32) {
      fail(key, `Too short (${value.length} chars) — generate a 64-char hex secret per the guide.`);
      continue;
    }
    if (seen.has(value)) {
      fail(key, `Duplicates ${seen.get(value)} — each secret must be independently generated.`);
      continue;
    }
    seen.set(value, key);
    pass(key, `${value.length}-char secret, unique.`);
  }
}

async function checkResend() {
  const key = env.RESEND_API_KEY ?? '';
  if (!key) return fail('RESEND_API_KEY', 'Missing — resend.com → API Keys → Create API Key.');
  if (!key.startsWith('re_')) return fail('RESEND_API_KEY', 'Resend keys start with "re_" — check for a copy/paste truncation.');
  if (key.startsWith('re_test')) {
    warn('RESEND_API_KEY', 'Looks like a TEST key — emails will be simulated, use the live key in production.');
    return;
  }
  try {
    const res = await withTimeout(fetch('https://api.resend.com/domains', { headers: { Authorization: `Bearer ${key}` } }), 10000, 'Resend API');
    if (res.status === 200) {
      pass('RESEND_API_KEY', 'API key authenticated against the Resend live API.');
    } else if (res.status === 401 || res.status === 403) {
      fail('RESEND_API_KEY', 'Key rejected by Resend (401/403) — regenerate it in the Resend dashboard.');
    } else {
      warn('RESEND_API_KEY', `Unexpected status ${res.status} — key may still work; check Resend dashboard.`);
    }
  } catch (err) {
    fail('RESEND_API_KEY', `Could not reach api.resend.com (${String(err.message).slice(0, 70)})`);
  }

  const from = env.EMAIL_FROM ?? '';
  if (!from) {
    warn('EMAIL_FROM', 'Missing — falls back to app.config default. Set "TeslaPrimeCapital <no-reply@yourdomain>".');
  } else if (from.includes('onboarding@resend.dev')) {
    warn('EMAIL_FROM', 'Using onboarding@resend.dev — delivers ONLY to your own Resend account email. Verify your domain for production.');
  } else {
    pass('EMAIL_FROM', from);
  }
}

async function checkCloudinary() {
  const cloud = env.CLOUDINARY_CLOUD_NAME ?? '';
  const apiKey = env.CLOUDINARY_API_KEY ?? '';
  const apiSecret = env.CLOUDINARY_API_SECRET ?? '';
  if (!cloud || !apiKey || !apiSecret) {
    fail('CLOUDINARY_*', 'Missing — Cloudinary Dashboard → Product Environment Credentials (cloud name, API key, API secret). Set all three.');
    return;
  }
  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
    const res = await withTimeout(fetch(`https://api.cloudinary.com/v1_1/${cloud}/ping`, { headers: { Authorization: `Basic ${auth}` } }), 10000, 'Cloudinary ping');
    if (res.ok) {
      pass('CLOUDINARY_*', `Ping OK on cloud "${cloud}" — KYC vault credentials are live.`);
    } else if (res.status === 401 || res.status === 403) {
      fail('CLOUDINARY_*', 'Credentials rejected — re-copy API key + secret (watch for trailing spaces).');
    } else if (res.status === 404) {
      fail('CLOUDINARY_*', `Cloud "${cloud}" not found — verify the cloud name exactly as shown on the dashboard.`);
    } else {
      warn('CLOUDINARY_*', `Unexpected status ${res.status} — check the dashboard.`);
    }
  } catch (err) {
    fail('CLOUDINARY_*', `Could not reach api.cloudinary.com (${String(err.message).slice(0, 70)})`);
  }
}

async function checkChatAndSite() {
  const chat = env.NEXT_PUBLIC_SMARTSUPP_KEY ?? '';
  if (!chat) warn('NEXT_PUBLIC_SMARTSUPP_KEY', 'Empty — chat widget stays hidden. Smartsupp → Settings → Chat box → Chat code.');
  else if (chat.length < 10) warn('NEXT_PUBLIC_SMARTSUPP_KEY', 'Suspiciously short — copy the full _smartsupp.key value.');
  else pass('NEXT_PUBLIC_SMARTSUPP_KEY', 'Set — widget will render on marketing + dashboard surfaces.');

  const site = env.NEXT_PUBLIC_SITE_URL ?? '';
  if (!site) warn('NEXT_PUBLIC_SITE_URL', 'Empty — canonicals/OG fall back to the placeholder domain. Set your real https origin.');
  else if (!/^https:\/\//.test(site)) fail('NEXT_PUBLIC_SITE_URL', 'Must be a full https:// origin (no trailing path).');
  else if (site.endsWith('/')) warn('NEXT_PUBLIC_SITE_URL', 'Trailing slash is auto-trimmed by config, but clean it up anyway.');
  else pass('NEXT_PUBLIC_SITE_URL', site);
}

/* ------------------------------------------------------------------- main */
console.log('\n═══ TeslaPrimeCapital — Pre-Flight Environment Check ═══\n');

await checkSecrets();
await checkDatabase();
await checkRedis();
await checkResend();
await checkCloudinary();
await checkChatAndSite();

console.log('');
if (requiredFailures > 0) {
  console.log(`${RED} ${requiredFailures} required check(s) FAILED — fix the lines marked ❌ above and re-run.\n`);
  process.exit(1);
}
console.log(`${GREEN} All required checks passed — the platform is wired end-to-end. Safe to push the schema and continue.\n`);
