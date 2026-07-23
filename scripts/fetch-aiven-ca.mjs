#!/usr/bin/env node
/**
 * Private-CA Fetcher for TLS Redis providers (`npm run fetch:aiven-ca`).
 *
 * Two independent retrieval lanes, because a provider's console page or API
 * host may be unreachable from your network:
 *
 *   Lane 1 (recommended, zero credentials, zero API):
 *       npm run fetch:aiven-ca -- --from-server
 *     Opens a TLS handshake against the host in REDIS_URL (.env.local) and
 *     inspects the certificate chain the server itself presents. If the
 *     provider ships its private CA in that chain, we extract it, base64-
 *     encode the PEM, and upsert REDIS_CA_CERT into .env.local — full TLS
 *     verification restored without ever touching a console or token.
 *
 *   Lane 2 (Aiven REST API, needs a personal access token):
 *       npm run fetch:aiven-ca -- <project> <token>
 *     Calls the documented endpoint GET /v1/project/{project}/kms/ca and
 *     tries the three authorization schemes Aiven has accepted across token
 *     generations (aivenv1, Bearer, aiven) so any issued token works.
 *     Project name = the /project/<THIS-PART>/ segment of your console URL.
 *     Token: Aiven Console > top-right profile avatar > Tokens > Generate.
 *
 * If neither lane is possible from your network, set
 * REDIS_TLS_ALLOW_UNVERIFIED=true as a documented temporary escape hatch
 * (channel stays encrypted, server identity unverified) and re-run this
 * script from an unrestricted network before launch.
 */
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';

/* ----------------------------------------------------------- env file I/O */
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

function persistCa(certificate) {
  const base64 = Buffer.from(certificate, 'utf8').toString('base64');
  upsertEnv(path.join(process.cwd(), '.env.local'), 'REDIS_CA_CERT', base64);
  console.log(`\nREDIS_CA_CERT written into .env.local (${certificate.length} chars of PEM -> ${base64.length} chars base64).`);
  console.log('Run:  npm run verify:env   — REDIS_URL should now return PONG with FULL verification.');
}

const envLocal = loadEnvFile(path.join(process.cwd(), '.env.local'));

/* ------------------------------------------- Lane 1: TLS-handshake extract */
function pemFromDer(raw) {
  const b64 = Buffer.from(raw).toString('base64');
  return `-----BEGIN CERTIFICATE-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END CERTIFICATE-----`;
}

/**
 * Distinguished Names arrive as RFC2253 strings on some Node versions and as
 * null-prototype objects on others (String() throws on those). Normalize to a
 * sorted "KEY=value" join so equality comparisons are order-independent and
 * display never crashes.
 */
function dnToString(dn) {
  if (!dn) return '';
  if (typeof dn === 'string') return dn;
  try {
    return Object.entries(dn)
      .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join('+') : String(v)}`)
      .sort()
      .join(', ');
  } catch {
    return '[unprintable DN]';
  }
}

async function fetchCaFromServer(redisUrl) {
  let url;
  try {
    url = new URL(redisUrl);
  } catch {
    throw new Error('REDIS_URL is not a parseable URL — check .env.local.');
  }
  if (url.protocol !== 'rediss:') {
    throw new Error('REDIS_URL starts with redis:// (no TLS) — a plain connection needs no CA certificate. Nothing to do.');
  }
  const host = url.hostname;
  const port = Number(url.port || 6379);

  const presented = await new Promise((resolve, reject) => {
    let settled = false;
    const done = (fn, value) => {
      if (settled) return;
      settled = true;
      try { socket.end(); } catch { /* socket may already be closed */ }
      fn(value);
    };
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false }, // inspection only — we harvest, never trust
      () => {
        const chain = [];
        let cert = socket.getPeerCertificate(true);
        while (cert && cert.raw) {
          chain.push({ subject: dnToString(cert.subject), issuer: dnToString(cert.issuer), pem: pemFromDer(cert.raw) });
          if (!cert.issuerCertificate || !cert.issuerCertificate.raw || cert.issuerCertificate === cert) break;
          cert = cert.issuerCertificate;
        }
        done(resolve, chain);
      },
    );
    socket.setTimeout(12000, () => done(reject, new Error(`Timed out connecting to ${host}:${port} — check that REDIS_URL is correct and your network allows outbound TLS to that host.`)));
    socket.on('error', (err) => done(reject, new Error(`Cannot reach ${host}:${port} — ${err.message}`)));
  });

  console.log(`Handshake with ${host}:${port} succeeded — server presented ${presented.length} certificate(s):`);
  presented.forEach((c, i) => {
    const role = c.subject === c.issuer ? 'self-signed root' : i === 0 ? 'server leaf' : 'intermediate';
    console.log(`  [${i}] ${c.subject}   (${role})`);
  });

  // The CA we need is the last link presented: its SUBJECT must equal the
  // leaf's ISSUER, and a private project CA is a self-signed root.
  const leaf = presented[0];
  const top = presented[presented.length - 1];
  if (!leaf) throw new Error('No certificates presented — unexpected handshake payload.');
  if (presented.length >= 2 && top.subject === top.issuer && top.subject === leaf.issuer) {
    return top.pem;
  }
  if (presented.length >= 2 && top.subject === top.issuer) {
    console.log('Note: the presented root does not exactly match the leaf issuer string — using it anyway (common when providers normalize DN ordering).');
    return top.pem;
  }
  console.log('\nThe server presented ONLY its leaf certificate — the private CA is not in the handshake chain.');
  console.log('Options:  Lane 2 of this script (Aiven API token), or REDIS_TLS_ALLOW_UNVERIFIED=true until launch.');
  process.exit(1);
}

/* --------------------------------------------- Lane 2: Aiven REST API call */
async function fetchCaFromApi(project, token) {
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
      const cause = err?.cause ? ` [cause: ${err.cause.code ?? err.cause.message ?? err.cause}]` : '';
      console.error(`Network failure reaching api.aiven.io: ${err.message}${cause}`);
      console.error('This host is unreachable from your current network. Use Lane 1 instead:  npm run fetch:aiven-ca -- --from-server');
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
  return certificate;
}

/* -------------------------------------------------------------------- main */
const mode = process.argv[2];

try {
  if (mode === '--from-server') {
    const redisUrl = process.argv[3] || envLocal.REDIS_URL;
    if (!redisUrl || redisUrl === 'redis://localhost:6379/0') {
      console.error('Lane 1 needs your real REDIS_URL inside .env.local (or pass it as:  npm run fetch:aiven-ca -- --from-server "rediss://…").');
      process.exit(1);
    }
    const pem = await fetchCaFromServer(redisUrl);
    persistCa(pem);
  } else {
  const project = mode || envLocal.AIVEN_PROJECT;
  const token = process.argv[3] || envLocal.AIVEN_API_TOKEN;
  if (!project || !token) {
    console.error(`
Usage (Lane 1 — recommended, no token needed):
  npm run fetch:aiven-ca -- --from-server
      reads REDIS_URL from .env.local and harvests the CA from the TLS handshake

Usage (Lane 2 — Aiven API):
  npm run fetch:aiven-ca -- <project> <token>
      <project>  the project segment of your Aiven console URL
      <token>    personal access token (Console > profile avatar > Tokens > Generate)

Lane 2 credentials can also live in .env.local as AIVEN_PROJECT / AIVEN_API_TOKEN.
`);
      process.exit(1);
    }
    const pem = await fetchCaFromApi(project, token);
    persistCa(pem);
  }
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
