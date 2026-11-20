import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const imageDir = path.resolve(scriptDir, '../public/images/evs');
const manifestPath = path.resolve(scriptDir, '../src/data/vehicleImageManifest.json');
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg', '.bmp']);
const files = await readdir(imageDir, { withFileTypes: true });
const imageFiles = await Promise.all(
  files
    .filter((file) => file.isFile() && supportedExtensions.has(path.extname(file.name).toLowerCase()))
    .map(async (file) => ({
      key: path.basename(file.name, path.extname(file.name)).toLowerCase(),
      name: file.name,
      modifiedAt: (await stat(path.join(imageDir, file.name))).mtimeMs,
    })),
);
const manifest = Object.fromEntries(
  imageFiles
    .sort((a, b) => a.key.localeCompare(b.key) || a.modifiedAt - b.modifiedAt)
    .map(({ key, name }) => [key, name]),
);

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
