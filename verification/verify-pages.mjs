import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(name));
    else if (entry.isFile()) result.push(name);
    else throw new Error(`Unexpected non-regular file: ${path.relative(root, name)}`);
  }
  return result.sort();
}

const source = path.join(root, 'dist');
const pages = path.join(root, 'docs');
const sourceFiles = await files(source);
const pagesFiles = await files(pages);
assert.deepEqual(pagesFiles.map(file => path.relative(pages, file)).filter(file => file !== '.nojekyll'), sourceFiles.map(file => path.relative(source, file)));
for (const file of sourceFiles) {
  assert.deepEqual(await readFile(file), await readFile(path.join(pages, path.relative(source, file))), `Outdated docs copy: ${path.relative(source, file)}`);
}
assert.equal((await stat(path.join(pages, '.nojekyll'))).size, 0);

let references = 0;
for (const file of pagesFiles) {
  if (!/\.(html|mjs|css)$/.test(file)) continue;
  const text = await readFile(file, 'utf8');
  const refs = [
    ...text.matchAll(/(?:src|href)=["']([^"']+)["']/g),
    ...text.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g),
    ...text.matchAll(/url\(["']?([^\s)'";]+)["']?\)/g)
  ];
  for (const [, ref] of refs) {
    if (!ref || /^(?:#|data:|blob:|https?:|mailto:)/.test(ref)) continue;
    assert.ok(!ref.startsWith('/'), `Root-absolute reference breaks project Pages: ${ref}`);
    const resolved = path.resolve(path.dirname(file), decodeURIComponent(ref.split(/[?#]/)[0]));
    assert.ok(resolved === pages || resolved.startsWith(pages + path.sep), `Reference escapes docs/: ${ref}`);
    const target = await stat(resolved);
    if (target.isDirectory()) await stat(path.join(resolved, 'index.html'));
    references++;
  }
}

for (const file of await files(root)) {
  if (!file.endsWith('.mjs')) continue;
  const checked = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  assert.equal(checked.status, 0, checked.stderr);
}
const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
assert.deepEqual(await readFile(path.join(root, `우리가-남긴-별-v${version}.html`)), await readFile(path.join(root, 'verification/우리가-남긴-별-v2.html')));
assert.ok((await stat(path.join(root, 'downloads/stars-we-leave-v0.2.1.zip'))).size > 0);
console.log(`Verified ${sourceFiles.length} mirrored game files, ${references} relative references, standalone output, ZIP presence, and all .mjs syntax.`);
