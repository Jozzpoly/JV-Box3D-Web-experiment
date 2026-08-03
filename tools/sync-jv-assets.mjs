import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const sourceRef = process.env.JV_SOURCE_REF || 'main';
const refresh = process.env.JV_REFRESH_ASSETS === '1';
const nativeRoot = findNativeRoot();

const FRONT_RIG_REQUIRED_NODES = [
  'Socket_SingleDamperUpper',
  'Socket_SingleDamper_Mount',
  'Socket_ChassisMount_a',
  'Chassis_Top',
  'Socket_SingleDamperLower',
  'Chassis_Bottom',
  'Socket_ChassisMount_b',
  'Socket_SteeringRod',
  'Socket_WheelCenter',
  'Socket_CardanDrive',
  'Socket_CardanHub',
  'Axis_SuspensionTravel_Top',
  'Axis_SuspensionTravel_Bottom',
];

const assets = [
  asset('rama_rurowa', 'assets/source/Nadwozie.gltf', 'public/assets/vehicle/Nadwozie.gltf'),
  asset(
    'koło JV',
    'assets/source/Offroad_Big_Wheels.gltf',
    'public/assets/vehicle/Offroad_Big_Wheels.gltf',
    ['Socket_WheelMount', 'Marker_TireRadiusOuter', 'Marker_TireWidthLeft', 'Marker_TireWidthRight'],
  ),
  asset(
    'przedni rig kierowniczy',
    'assets/source/OneSided_Steering_Suspension_Rig.gltf',
    'public/assets/vehicle/OneSided_Steering_Suspension_Rig.gltf',
    FRONT_RIG_REQUIRED_NODES,
  ),
  asset(
    'tylny mount zawieszenia',
    'assets/source/One_Sided_wheel_mount.gltf',
    'public/assets/vehicle/One_Sided_wheel_mount.gltf',
  ),
  asset('amortyzator JV', 'assets/source/Asset_Dumper.gltf', 'public/assets/vehicle/Asset_Dumper.gltf'),
];

const contractFiles = [
  contractFile(
    'kontrakt przedniego rigu',
    'assets/contracts/one_sided_steering_suspension.asset.json',
    'public/assets/contracts/one_sided_steering_suspension.asset.json',
    'jozz.one_sided_steering_suspension.v0',
  ),
];

if (nativeRoot) console.log(`[jv-assets] lokalne źródło JV: ${nativeRoot}`);
else console.log(`[jv-assets] lokalne JV nie znalezione; assety pochodzą z JV ${sourceRef}`);

const manifestEntries = [];
for (const item of assets) manifestEntries.push(await synchronizeAsset(item));
for (const item of contractFiles) manifestEntries.push(await synchronizeContractFile(item));
await writeAssetManifest(manifestEntries);
await synchronizeSession();

function asset(name, relativeSource, relativeTarget, requiredNodes = []) {
  return {
    kind: 'gltf',
    name,
    relativeSource,
    relativeTarget,
    requiredNodes,
    target: path.resolve(relativeTarget),
    remote: `https://raw.githubusercontent.com/Jozzpoly/Box3d_FunProject/${sourceRef}/${relativeSource}`,
  };
}

function contractFile(name, relativeSource, relativeTarget, expectedAssetId) {
  return {
    kind: 'native-contract',
    name,
    relativeSource,
    relativeTarget,
    expectedAssetId,
    target: path.resolve(relativeTarget),
    remote: `https://raw.githubusercontent.com/Jozzpoly/Box3d_FunProject/${sourceRef}/${relativeSource}`,
  };
}

async function synchronizeAsset(item) {
  const { text, sourceKind } = await readAuthoritativeText(item, validateGltfContract);
  return describeGltf(item, text, sourceKind);
}

async function synchronizeContractFile(item) {
  const { text, sourceKind } = await readAuthoritativeText(item, validateNativeContract);
  const json = validateNativeContract(item, text);
  return {
    kind: item.kind,
    key: item.name,
    sourceKind,
    sourcePath: item.relativeSource,
    webPath: item.relativeTarget.replace(/^public[\\/]/, ''),
    sha256: createHash('sha256').update(text, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(text, 'utf8'),
    assetId: json.assetId,
    assetType: json.assetType,
    contractVersion: json.source?.contractVersion ?? null,
  };
}

async function readAuthoritativeText(item, validate) {
  await mkdir(path.dirname(item.target), { recursive: true });
  const localSource = nativeRoot ? path.join(nativeRoot, item.relativeSource) : null;
  let text;
  let sourceKind;

  if (localSource && existsSync(localSource)) {
    text = await readFile(localSource, 'utf8');
    validate(item, text);
    sourceKind = 'local-native-jv';

    if (!refresh && existsSync(item.target)) {
      const targetText = await readFile(item.target, 'utf8');
      if (targetText === text) {
        console.log(`[jv-assets] ${item.name}: zgodny z lokalnym JV`);
        return { text, sourceKind };
      }
    }

    await writeFile(item.target, text, 'utf8');
    console.log(`[jv-assets] ${item.name}: zsynchronizowano lokalnie (${Math.round(text.length / 1024)} KiB)`);
    return { text, sourceKind };
  }

  if (!refresh && existsSync(item.target)) {
    text = await readFile(item.target, 'utf8');
    try {
      validate(item, text);
      console.log(`[jv-assets] ${item.name}: już istnieje`);
      return { text, sourceKind: 'cached-jv-asset' };
    } catch {
      // Invalid or stale-contract cache is replaced by the authoritative file.
    }
  }

  console.log(`[jv-assets] ${item.name}: pobieranie z JV ${sourceRef}`);
  const response = await fetch(item.remote, {
    headers: { 'user-agent': 'JV-Box3D-Web-experiment' },
  });
  if (!response.ok) {
    throw new Error(`${item.name}: download failed (${response.status} ${response.statusText})`);
  }
  text = await response.text();
  validate(item, text);
  await writeFile(item.target, text, 'utf8');
  console.log(`[jv-assets] ${item.name}: zapisano ${Math.round(text.length / 1024)} KiB`);
  return { text, sourceKind: `github-${sourceRef}` };
}

async function writeAssetManifest(entries) {
  const target = path.resolve('public/assets/jv-asset-manifest.json');
  await mkdir(path.dirname(target), { recursive: true });
  const manifest = {
    bridgeVersion: 2,
    nativeRepository: 'Jozzpoly/Box3d_FunProject',
    nativeRef: nativeRoot ? 'local-working-tree' : sourceRef,
    entries,
  };
  await writeFile(target, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  console.log(`[jv-assets] manifest kontraktów: ${path.relative(process.cwd(), target)}`);
}

function validateGltfContract(item, text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`${item.name}: plik nie jest poprawnym JSON glTF (${String(error)})`);
  }
  if (json?.asset?.version !== '2.0' || !Array.isArray(json.meshes) || json.meshes.length === 0) {
    throw new Error(`${item.name}: plik nie jest poprawnym glTF 2.0 z meshem`);
  }

  const nodeNames = new Set((json.nodes ?? []).map((node) => node?.name).filter(Boolean));
  const missing = item.requiredNodes.filter((name) => !nodeNames.has(name));
  if (missing.length > 0) {
    throw new Error(`${item.name}: brakuje wymaganych markerów/socketów: ${missing.join(', ')}`);
  }
  return json;
}

function validateNativeContract(item, text) {
  let json;
  try {
    json = JSON.parse(text);
  } catch (error) {
    throw new Error(`${item.name}: plik nie jest poprawnym JSON (${String(error)})`);
  }
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    throw new Error(`${item.name}: root kontraktu nie jest obiektem`);
  }
  if (json.assetId !== item.expectedAssetId) {
    throw new Error(`${item.name}: oczekiwano assetId=${item.expectedAssetId}, otrzymano ${String(json.assetId)}`);
  }
  if (typeof json.source?.gltf !== 'string' || typeof json.source?.contractVersion !== 'number') {
    throw new Error(`${item.name}: brak source.gltf albo source.contractVersion`);
  }
  return json;
}

function describeGltf(item, text, sourceKind) {
  const json = validateGltfContract(item, text);
  const nodeNames = (json.nodes ?? []).map((node) => node?.name).filter(Boolean);
  const contractNodes = nodeNames.filter((name) => /^(Socket_|Marker_|Axis_)/.test(name));
  return {
    kind: item.kind,
    key: item.name,
    sourceKind,
    sourcePath: item.relativeSource,
    webPath: item.relativeTarget.replace(/^public[\\/]/, ''),
    sha256: createHash('sha256').update(text, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(text, 'utf8'),
    meshCount: json.meshes?.length ?? 0,
    skinCount: json.skins?.length ?? 0,
    nodeCount: json.nodes?.length ?? 0,
    requiredNodes: item.requiredNodes,
    contractNodes,
  };
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
