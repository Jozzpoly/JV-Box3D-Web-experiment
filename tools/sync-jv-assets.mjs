import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const sourceRef = process.env.JV_SOURCE_REF || 'main';
const refresh = process.env.JV_REFRESH_ASSETS === '1';
const assets = [
  {
    name: 'rama_rurowa',
    source: `https://raw.githubusercontent.com/Jozzpoly/Box3d_FunProject/${sourceRef}/assets/source/Nadwozie.gltf`,
    target: path.resolve('public/assets/vehicle/Nadwozie.gltf'),
    validate(text) {
      const json = JSON.parse(text);
      return json?.asset?.version === '2.0' && Array.isArray(json.meshes) && json.meshes.length > 0;
    },
  },
];

for (const asset of assets) {
  if (!refresh && existsSync(asset.target)) {
    const existing = await readFile(asset.target, 'utf8');
    if (asset.validate(existing)) {
      console.log(`[jv-assets] ${asset.name}: already present`);
      continue;
    }
  }

  console.log(`[jv-assets] ${asset.name}: downloading from JV ${sourceRef}`);
  const response = await fetch(asset.source, {
    headers: { 'user-agent': 'JV-Box3D-Web-experiment' },
  });
  if (!response.ok) {
    throw new Error(`${asset.name}: download failed (${response.status} ${response.statusText})`);
  }
  const text = await response.text();
  if (!asset.validate(text)) {
    throw new Error(`${asset.name}: downloaded file is not the expected self-contained glTF`);
  }
  await mkdir(path.dirname(asset.target), { recursive: true });
  await writeFile(asset.target, text, 'utf8');
  console.log(`[jv-assets] ${asset.name}: saved ${Math.round(text.length / 1024)} KiB`);
}
