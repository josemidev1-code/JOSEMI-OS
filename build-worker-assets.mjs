import { mkdir, copyFile } from 'node:fs/promises';
const output = new URL('./.wrangler/site/', import.meta.url);
await mkdir(output, { recursive: true });
for (const file of ['index.html', 'style.css', 'script.js', 'milo-ai.js', '.nojekyll']) {
  await copyFile(new URL(file, import.meta.url), new URL(file, output));
}
