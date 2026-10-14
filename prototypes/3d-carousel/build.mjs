import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await build({ entryPoints: ['src/app.jsx'], bundle: true, minify: true, outfile: 'dist/app.js', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'eof' });
const license = await readFile('src/vendor/LICENSE.md', 'utf8');
const reactLicense = await readFile('node_modules/react/LICENSE', 'utf8');
const domLicense = await readFile('node_modules/react-dom/LICENSE', 'utf8');
await writeFile('dist/THIRD-PARTY-LICENSES.txt', `React Bits Circular Carousel\n${license}\nReact\n${reactLicense}\nReact DOM\n${domLicense}`);
