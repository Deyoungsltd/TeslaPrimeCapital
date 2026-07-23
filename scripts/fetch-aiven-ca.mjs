#!/usr/bin/env node
/**
 * Aiven Project-CA Fetcher (`npm run fetch:aiven-ca -- <project> [token]`).
 *
 * Console-independent path to the Valkey/Redis CA certificate: calls the
 * documented Aiven REST endpoint `GET /v1/project/{project}/kms/ca`, base64-
 * encodes the returned PEM, and upserts REDIS_CA_CERT into .env.local so the
 * app's TLS client can verify Aiven's private project CA without disabling
 * verification.
 *
 * Token source (one-time): Aiven Console > top-right profile avatar >
 * Tokens > Generate token. The project name is in your console URL:
 *   console.aiven.io/account/.../project/<THIS-PART>/services/...
 *
 * Tries the three authorization schemes Aiven has accepted across token
 * generations (aivenv1, Bearer, aiven) so any issued token works.
 */
import fs from 'node:fs';
import path from 'node:path';

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

function upsertEnv(file, key, value) {
  let lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n') : [];
  const pattern = new RegExp(`^${key}=`);
  const replacement = `${key}="${value}"`;
  let replaced = false;
  lines = lines.map((line) => {
    if (pattern.test(line.trim())) {
      replaced = true;
      return replacement;
    }
    return line;
  });
  if (!replaced) {
    if (lines.length && lines[lines.length - 1].trim() !== '') lines.push('');
    lines.push(replacement);
  }
  fs.writeFileSync(file, lines.join('\n'));
}

const envLocal = loadEnvFile(path.join(process.cwd(), '.env.local'));
const project = process.argv[2] || envLocal.AIVEN_PROJECT;
const token = process.argv[3] || envLocal.AIVEN_API_TOKEN;

if (!project || !token) {
  console.error(`
Usage:  npm run fetch:aiven-ca -- <project> <token>

  <project>  the project segment of your Aiven console URL
  <token>    a personal access token (Console > profile avatar > Tokens > Generate)

Alternatively set AIVEN_PROJECT and AIVEN_API_TOKEN inside .env.local and run
without arguments.
`);
  process.exit(1);
}

console.log(`Fetching project CA for "${project}" from the Aiven API…`);

let certificate = null;
let lastStatus = 0;
for (const scheme of ['aivenv1', 'Bearer', 'aiven']) {
  try {
    const res = await fetch(`https://api.aiven.io/v1/project/${encodeURIComponent(project)}/kms/ca`, {
      headers: { authorization: `${scheme} ${token}` },
    });
    lastStatus = res.status;
    if (res.ok) {
      const body = await res.json();
      certificate = body.certificate;
      if (certificate) {
        console.log(`Authenticated with the "${scheme}" scheme.`);
        break;
      }
    } else if (res.status === 404) {
      console.error(`Project "${project}" not found — copy the project name verbatim from your console URL.`);
      process.exit(1);
    }
    // else: wrong scheme for this token, try the next one
  } catch (err) {
    console.error(`Network failure reaching api.aiven.io: ${err.message}`);
    process.exit(1);
  }
}

if (!certificate) {
  console.error(`Could not authenticate (last status ${lastStatus}). Verify the token exists and belongs to the same Aiven account that owns project "${project}".`);
  process.exit(1);
}

if (!certificate.includes('BEGIN CERTIFICATE')) {
  console.error('API returned an unexpected payload — no PEM found.');
  process.exit(1);
}

const base64 = Buffer.from(certificate, 'utf8').toString('base64');
const envPath = path.join(process.cwd(), '.env.local');
upsertEnv(envPath, 'REDIS_CA_CERT', base64);

console.log(`REDIS_CA_CERT written into .env.local (${certificate.length} chars of PEM -> ${base64.length} chars base64).`);
console.log('Run:  npm run verify:env   — REDIS_URL should now return PONG.');
