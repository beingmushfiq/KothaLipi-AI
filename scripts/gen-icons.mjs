import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pub = join(__dirname, '..', 'public');
const svg = readFileSync(join(pub, 'favicon.svg'));

const BG = { r: 7, g: 9, b: 14, alpha: 1 };

async function render(size, out, { flatten = false, pad = 0 } = {}) {
  let pipeline = sharp(svg, { density: Math.max(384, Math.round((size / 64) * 384)) }).resize(size - pad * 2, size - pad * 2, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  let input = await pipeline.png().toBuffer();

  if (pad > 0 || flatten) {
    const composed = await sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input, top: pad, left: pad }])
      .flatten({ background: BG })
      .removeAlpha()
      .png()
      .toBuffer();
    input = composed;
  }

  await sharp(input).png({ compressionLevel: 9 }).toFile(join(pub, out));
  console.log('wrote', out, size);
}

await render(180, 'apple-touch-icon.png', { flatten: true });
await render(192, 'pwa-192x192.png');
await render(512, 'pwa-512x512.png');
await render(512, 'pwa-maskable-512x512.png', { pad: 64 });
console.log('done');
