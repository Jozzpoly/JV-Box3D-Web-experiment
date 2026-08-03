# F2 Node 24 validation receipt

Status: PASS

source_commit: 8c86c94762a79f444f425b61fa82ca07e649bbd8
node: v24.16.0
npm: 11.13.0
box3d_package: box3d.js@0.0.2
tests: 26/26 PASS
browser_smoke: PASS

Commands completed before this receipt was written:

- npm install --package-lock-only --ignore-scripts --save-exact
- npm ci
- npm run check
- npm run build
- node tools/smoke-f2-browser.mjs

Scope:

- F1 host/input regression suite
- F2 B0-B5 typed boundary and real contact fixture
- shared WASM module across world rebuilds
- runtime-fault cleanup and successful rebuild
- headless Chrome contact observation and world generation 1 -> 2 rebuild
