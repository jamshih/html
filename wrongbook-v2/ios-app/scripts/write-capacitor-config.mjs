import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, '..');
const file = path.join(appRoot, 'capacitor.config.json');
const config = JSON.parse(await readFile(file, 'utf8'));

config.appId = process.env.WRONGBOOK_BUNDLE_ID || config.appId || 'com.searchrecall.wrongbook';
config.appName = process.env.WRONGBOOK_APP_NAME || config.appName || '錯題本';

await writeFile(file, JSON.stringify(config, null, 2) + '\n');
console.log(`Capacitor appId=${config.appId} appName=${config.appName}`);
