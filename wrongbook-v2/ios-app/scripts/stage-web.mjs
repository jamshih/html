import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const sourceRoot = path.resolve(appRoot, '..');
const out = path.join(appRoot, 'www');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of await readdir(sourceRoot, { withFileTypes: true })) {
  if (entry.name === 'ios-app' || entry.name === '.DS_Store') continue;
  await cp(path.join(sourceRoot, entry.name), path.join(out, entry.name), {
    recursive: true,
    force: true,
  });
}

await cp(path.join(appRoot, 'assets', 'app-icon.svg'), path.join(out, 'app-icon.svg'));
await cp(path.join(appRoot, 'assets', 'app-icon-1024.png'), path.join(out, 'app-icon-1024.png'));

const indexPath = path.join(out, 'index.html');
let index = await readFile(indexPath, 'utf8');
index = index
  .replaceAll('../wrongbook-prototype/icon.svg', './app-icon.svg')
  .replaceAll('../wrongbook-prototype/icon-180.png', './app-icon-1024.png');
await writeFile(indexPath, index);

const manifestPath = path.join(out, 'manifest.webmanifest');
try {
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.icons = [{ src: './app-icon-1024.png', sizes: '1024x1024', type: 'image/png' }];
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
} catch (error) {
  console.warn('manifest.webmanifest was not rewritten:', error.message);
}

if (index.includes('../wrongbook-prototype/')) {
  throw new Error('Native web bundle still references files outside wrongbook-v2.');
}

console.log(`Staged Wrong Book web app for Capacitor: ${out}`);
