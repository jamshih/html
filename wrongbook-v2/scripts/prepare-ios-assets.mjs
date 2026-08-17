import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const assetsDir = path.join(root, 'assets');
const source = path.join(assetsDir, 'icon.svg');
const svg = await readFile(source);

await mkdir(assetsDir, { recursive: true });

for (const size of [180, 192, 512, 1024]) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(path.join(assetsDir, `icon-${size}.png`));
}

await sharp(svg)
  .resize(1024, 1024)
  .png()
  .toFile(path.join(assetsDir, 'icon-only.png'));

const centeredIcon = await sharp(svg)
  .resize(820, 820)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 2732,
    height: 2732,
    channels: 4,
    background: '#f6f7fb',
  },
})
  .composite([{ input: centeredIcon, gravity: 'center' }])
  .png()
  .toFile(path.join(assetsDir, 'splash.png'));

console.log('Generated Wrong Book iOS/PWA icon and splash source assets.');
