// Copies the library into the docs site so mouseview.org serves the same files as npm.
// Edit the files in the repository root, then run `npm run build`.

import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'WWW', 'static');

const copies = [
    ['MouseView.js', 'MouseView.js'],
    ['MouseView.mjs', 'MouseView.mjs'],
    ['MouseView-fallback.js', 'MouseView-fallback.js'],
    ['jspsych', 'jspsych'],
    ['examples/jspsych', 'examples/jspsych'],
    ['test', 'test'],
];

for (const [from, to] of copies) {
    const target = join(site, to);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(join(root, from), target, { recursive: true });
    console.log(`copied ${from} -> WWW/static/${to}`);
}
