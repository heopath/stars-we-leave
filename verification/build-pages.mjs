import { cp, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));

// Keep the original standalone assembly workflow and its verification outputs.
await import('./assemble-v2.mjs');
await copyFile(new URL('verification/우리가-남긴-별-v2.html', root), new URL(`우리가-남긴-별-v${version}.html`, root));

// docs/ is generated only from the game's local runtime files.
await rm(new URL('docs/', root), { recursive: true, force: true });
await mkdir(new URL('docs/', root), { recursive: true });
await cp(new URL('dist/', root), new URL('docs/', root), { recursive: true });
await writeFile(new URL('docs/.nojekyll', root), '');
console.log('GitHub Pages files prepared in docs/. No upload or deployment performed.');
