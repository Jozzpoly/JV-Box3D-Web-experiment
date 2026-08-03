import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const sourceRef = process.env.JV_SOURCE_REF || 'main';
const refresh = process.env.JV_REFRESH_ASSETS === '1';
const nativeRoot = findNativeRoot();

const assets = [
  asset('rama_rurowa', 'assets/source/Nadwozie.gltf', 'public/assets/vehicle/Nadwozie.gltf'),
  asset('koło JV', 'assets/source/Offroad_Big_Wheels.gltf', 'public/assets/vehicle/Offroad_Big_Wheels.gltf'),
  asset(
    'przedni rig kierowniczy',
    'assets/source/OneSided_Steering_Suspension_Rig.gltf',
    'public/assets/vehicle/OneSided_Steering_Suspension_Rig.gltf',
  ),
  asset(
    'tylny mount zawieszenia',
    'assets/source/One_Sided_wheel_mount.gltf',
    'public/assets/vehicle/One_Sided_wheel_mount.gltf',
  ),
  asset('amortyzator JV', 'assets/source/Asset_Dumper.gltf', 'public/assets/vehicle/Asset_Dumper.gltf'),
];

if (nativeRoot) console.log(`[jv-assets] lokalne źródło JV: ${nativeRoot}`);
else console.log(`[jv-assets] lokalne JV nie znalezione; assety pochodzą z JV ${sourceRef}`);

for (const item of assets) await synchronizeAsset(item);
await synchronizeSession();

function asset(name, relativeSource, relativeTarget) {
  return {
    name,
    relativeSource,
    target: path.resolve(relativeTarget),
    remote: `https://raw.githubusercontent.com/Jozzpoly/Box3d_FunProject/${sourceRef}/${relativeSource}`,
  };
}

async function synchronizeAsset(item) {
  if (!refresh && existsSync(item.target)) {
    const existing = await readFile(item.target, 'utf8');
    if (isValidGltf(existing)) {
      console.log(`[jv-assets] ${item.name}: już istnieje`);
      return;
    }
  }

  await mkdir(path.dirname(item.target), { recursive: true });
  const localSource = nativeRoot ? path.join(nativeRoot, item.relativeSource) : null;
  if (localSource && existsSync(localSource)) {
    const text = await readFile(localSource, 'utf8');
    if (!isValidGltf(text)) throw new Error(`${item.name}: lokalny plik nie jest poprawnym glTF`);
    await writeFile(item.target, text, 'utf8');
    console.log(`[jv-assets] ${item.name}: skopiowano lokalnie (${Math.round(text.length / 1024)} KiB)`);
    return;
  }

  console.log(`[jv-assets] ${item.name}: pobieranie z JV ${sourceRef}`);
  const response = await fetch(item.remote, {
    headers: { 'user-agent': 'JV-Box3D-Web-experiment' },
  });
  if (!response.ok) {
    throw new Error(`${item.name}: download failed (${response.status} ${response.statusText})`);
  }
  const text = await response.text();
  if (!isValidGltf(text)) throw new Error(`${item.name}: pobrany plik nie jest poprawnym glTF`);
  await writeFile(item.target, text, 'utf8');
  console.log(`[jv-assets] ${item.name}: zapisano ${Math.round(text.length / 1024)} KiB`);
}

async function synchronizeSession() {
  const target = path.resolve('public/assets/config/current-session.json');
  const source = nativeRoot ? path.join(nativeRoot, 'build/jozz_vehicle_m6_session.json') : null;
  await mkdir(path.dirname(target), { recursive: true });

  if (!source || !existsSync(source)) {
    await rm(target, { force: true });
    console.log('[jv-config] brak lokalnej sesji M6 — web użyje factory/uliczny');
    return;
  }

  const text = await readFile(source, 'utf8');
  const json = JSON.parse(text);
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error('Lokalny jozz_vehicle_m6_session.json nie zawiera obiektu JSON.');
  }
  await copyFile(source, target);
  console.log(`[jv-config] aktywna sesja: ${source}`);
}

function findNativeRoot() {
  const explicit = process.env.JV_NATIVE_ROOT;
  if (explicit) {
    const resolved = path.resolve(explicit);
    if (!isNativeRoot(resolved)) {
      throw new Error(`JV_NATIVE_ROOT nie wskazuje repo JV: ${resolved}`);
    }
    return resolved;
  }

  // Supported local layouts:
  // 1. web repo nested somewhere inside the native JV repository;
  // 2. Jozz's current workspace, where the native repository is the sibling
  //    directory "box3d" under a shared Box3d_FunProject workspace folder.
  let current = process.cwd();
  for (let depth = 0; depth < 10; depth += 1) {
    const candidates = [current, path.join(current, 'box3d')];
    for (const candidate of candidates) {
      if (isNativeRoot(candidate)) return candidate;
    }

    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return null;
}

function isNativeRoot(candidate) {
  return existsSync(path.join(candidate, 'samples/jozz_vehicle_m6_geometry.cpp'))
    && existsSync(path.join(candidate, 'samples/jozz_vehicle_m6_suspension_rig.cpp'));
}

function isValidGltf(text) {
  try {
    const json = JSON.parse(text);
    return json?.asset?.version === '2.0' && Array.isArray(json.meshes) && json.meshes.length > 0;
  } catch {
    return false;
  }
}
