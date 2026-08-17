import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const dist = path.join(root, 'dist');

const excluded = new Set([
  '.gitignore',
  'IOS_README.md',
  'capacitor.config.json',
  'dist',
  'ios',
  'node_modules',
  'package-lock.json',
  'package.json',
  'scripts',
]);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name) || entry.name === '.DS_Store') continue;
  const from = path.join(root, entry.name);
  const to = path.join(dist, entry.name);
  await cp(from, to, { recursive: true });
}

const indexPath = path.join(dist, 'index.html');
const manifestPath = path.join(dist, 'manifest.webmanifest');

for (const required of [indexPath, manifestPath, path.join(dist, 'assets', 'icon-only.png')]) {
  try {
    await stat(required);
  } catch {
    throw new Error(`Missing required iOS web asset: ${path.relative(root, required)}`);
  }
}

let html = await readFile(indexPath, 'utf8');
html = html
  .replaceAll('../wrongbook-prototype/icon.svg', './assets/icon.svg')
  .replaceAll('../wrongbook-prototype/icon-180.png', './assets/icon-180.png');
await writeFile(indexPath, html);

let manifest = await readFile(manifestPath, 'utf8');
manifest = manifest
  .replaceAll('../wrongbook-prototype/icon-192.png', './assets/icon-192.png')
  .replaceAll('../wrongbook-prototype/icon-512.png', './assets/icon-512.png');
await writeFile(manifestPath, manifest);

const unresolved = [
  ...(html.match(/\.\.\/wrongbook-prototype\//g) ?? []),
  ...(manifest.match(/\.\.\/wrongbook-prototype\//g) ?? []),
];
if (unresolved.length) {
  throw new Error('Native bundle still contains parent-relative wrongbook-prototype asset references.');
}

console.log(`Prepared self-contained Capacitor web bundle at ${path.relative(root, dist)}/`);
