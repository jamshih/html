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
  await cp(path.join(root, entry.name), path.join(dist, entry.name), { recursive: true });
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

const unresolved = `${html}\n${manifest}`.match(/\.\.\/wrongbook-prototype\//g) ?? [];
if (unresolved.length) {
  throw new Error('Native bundle still contains parent-relative wrongbook-prototype asset references.');
}

const localRefs = new Set();
for (const match of html.matchAll(/(?:src|href)=["'](\.\/[^"']+)["']/g)) {
  localRefs.add(match[1]);
}
for (const icon of JSON.parse(manifest).icons ?? []) {
  if (typeof icon.src === 'string' && icon.src.startsWith('./')) localRefs.add(icon.src);
}

const missing = [];
for (const ref of localRefs) {
  const clean = ref.slice(2).split(/[?#]/, 1)[0];
  if (!clean) continue;
  try {
    await stat(path.join(dist, clean));
  } catch {
    missing.push(ref);
  }
}

if (missing.length) {
  throw new Error(`Native bundle has missing local assets:\n${missing.map((item) => `- ${item}`).join('\n')}`);
}

console.log(`Prepared self-contained Capacitor web bundle at ${path.relative(root, dist)}/`);
console.log(`Validated ${localRefs.size} local HTML/manifest asset references.`);
