#!/usr/bin/env node
/**
 * Deterministic Brand Icon Rasterizer (zero dependencies).
 *
 * Renders the TeslaPrimeCapital winged-blade monogram onto a rounded-square
 * obsidian badge and emits production PNG icons using nothing but Node's
 * built-in zlib — the build pipeline never needs a network download, sharp,
 * or a headless browser to mint favicons.
 *
 * Outputs:
 *   src/app/icon.png            32×32   (browser tab favicon, PNG fallback)
 *   src/app/apple-icon.png      180×180 (iOS home-screen touch icon)
 *   public/icons/icon-192.png   192×192 (web app manifest)
 *   public/icons/icon-512.png   512×512 (web app manifest / splash)
 *
 * Geometry mirrors `src/components/atoms/TeslaLogo.tsx` exactly:
 *   wing facets  M4.5 8.5 L16 4 L27.5 8.5 L19.5 11.5 L12.5 11.5 Z  (#F87171)
 *   grounded stem M12.5 11.5 L19.5 11.5 L19.5 28 L12.5 28 Z        (#DC2626)
 * on a #0A0D14 badge with a 22% corner radius and 19% safe padding.
 */
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const COLORS = {
  badge: [10, 13, 20],      // #0A0D14
  wing: [248, 113, 113],    // #F87171
  stem: [220, 38, 38],      // #DC2626
};

/** Wing polygon in the 32×32 mark viewBox (matches TeslaLogo.tsx path data). */
const WING_POLYGON = [
  [4.5, 8.5],
  [16, 4],
  [27.5, 8.5],
  [19.5, 11.5],
  [12.5, 11.5],
];
/** Stem rectangle in mark coordinates [x0, y0, x1, y1]. */
const STEM_RECT = [12.5, 11.5, 19.5, 28];

const CORNER_RADIUS_RATIO = 0.22;
const SAFE_PADDING_RATIO = 0.19;
const SUPERSAMPLE = 4;

/* ---------------------------------------------------------------- PNG codec */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, 'ascii');
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 8 + data.length);
  return out;
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    raw[y * stride] = 0; // filter: none
    rgba.copy(raw, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ------------------------------------------------------------ Raster geometry */

function pointInPolygon(x, y, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function insideRoundedRect(x, y, size, radius) {
  if (x < radius && y < radius) return Math.hypot(x - radius, y - radius) <= radius;
  if (x > size - radius && y < radius) return Math.hypot(x - (size - radius), y - radius) <= radius;
  if (x < radius && y > size - radius) return Math.hypot(x - radius, y - (size - radius)) <= radius;
  if (x > size - radius && y > size - radius)
    return Math.hypot(x - (size - radius), y - (size - radius)) <= radius;
  return true;
}

/**
 * Renders the badge at `size * SUPERSAMPLE` resolution then box-downsamples
 * to `size` for crisp anti-aliased edges at every output density.
 */
function renderIcon(size) {
  const big = size * SUPERSAMPLE;
  const buffer = new Float64Array(big * big * 4);

  const padPx = big * SAFE_PADDING_RATIO;
  const markScale = (big - padPx * 2) / 32; // mark units -> canvas px
  const radius = big * CORNER_RADIUS_RATIO;

  const toMarkX = (px) => (px - padPx) / markScale;
  const toMarkY = (py) => (py - padPx) / markScale;

  for (let y = 0; y < big; y++) {
    for (let x = 0; x < big; x++) {
      const idx = (y * big + x) * 4;
      if (!insideRoundedRect(x + 0.5, y + 0.5, big, radius)) continue; // transparent corner

      let color = COLORS.badge;
      const mx = toMarkX(x + 0.5);
      const my = toMarkY(y + 0.5);
      if (pointInPolygon(mx, my, WING_POLYGON)) color = COLORS.wing;
      if (mx >= STEM_RECT[0] && mx <= STEM_RECT[2] && my >= STEM_RECT[1] && my <= STEM_RECT[3]) {
        color = COLORS.stem;
      }

      buffer[idx] += color[0];
      buffer[idx + 1] += color[1];
      buffer[idx + 2] += color[2];
      buffer[idx + 3] += 255;
    }
  }

  // Box downsample big -> size
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const idx = ((y * SUPERSAMPLE + sy) * big + (x * SUPERSAMPLE + sx)) * 4;
          r += buffer[idx]; g += buffer[idx + 1]; b += buffer[idx + 2]; a += buffer[idx + 3];
        }
      }
      const n = SUPERSAMPLE * SUPERSAMPLE;
      const idx = (y * size + x) * 4;
      out[idx] = Math.round(r / n);
      out[idx + 1] = Math.round(g / n);
      out[idx + 2] = Math.round(b / n);
      out[idx + 3] = Math.round(a / n);
    }
  }
  return out;
}

/* -------------------------------------------------------------------- Driver */

const OUTPUTS = [
  { file: 'public/icons/icon-32.png', size: 32 },
  { file: 'public/icons/apple-icon.png', size: 180 },
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
];

for (const { file, size } of OUTPUTS) {
  const png = encodePng(size, size, renderIcon(size));
  const target = path.join(ROOT, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, png);
  console.log(`✓ ${file}  (${size}×${size}, ${png.length} bytes)`);
}
