import { build } from 'esbuild';
import { resolve } from 'node:path';
import { writeFile, readFile } from 'node:fs/promises';
const root = resolve('../..');
const result = await build({ entryPoints: [resolve(root, 'assets/js/works-source.jsx')], nodePaths: [resolve('node_modules')], bundle: true, minify: true, outfile: resolve(root, 'assets/js/works.js'), format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'eof', write: false });
for (const file of result.outputFiles) {
  const isCSS = file.path.endsWith('.css');
  const path = resolve(root, isCSS ? 'assets/css/works-carousel.css' : 'assets/js/works.js');
  await writeFile(path, isCSS ? file.text : `/*! Third-party license notices: works-LICENSES.txt */\n${file.text}`);
}
await writeFile(resolve(root, 'assets/js/works-LICENSES.txt'), await readFile('dist/THIRD-PARTY-LICENSES.txt', 'utf8'));
