import { readFile, readdir, access } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { parse } from "acorn";
import { root, manifest } from "./build.mjs";

async function filesIn(folder) {
  const result = [];
  for (const item of await readdir(resolve(root, folder), { withFileTypes: true })) {
    const path = `${folder}/${item.name}`;
    if (item.isDirectory()) result.push(...(await filesIn(path)));
    else result.push(path);
  }
  return result;
}

const registered = new Set(
  manifest.outputs.flatMap((output) => output.groups.flatMap((group) => group.files)),
);
const sources = [...(await filesIn("src")), ...(await filesIn("styles"))];
for (const file of sources) {
  if (!registered.has(file)) throw new Error(`Fuente sin registrar: ${file}`);
  if (!file.endsWith(".js")) continue;
  const code = await readFile(resolve(root, file), "utf8");
  parse(code, {
    ecmaVersion: "latest",
    sourceType: file.includes("/worker/") ? "module" : "script",
  });
}
const html = await readFile(resolve(root, "index.html"), "utf8");
for (const match of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^"#]*)?"/g)) {
  if (/^(?:[a-z]+:|#)/i.test(match[1])) continue;
  const target = resolve(root, match[1]);
  if (relative(root, target).startsWith(".."))
    throw new Error(`Ruta fuera del proyecto: ${match[1]}`);
  await access(target);
}
console.log(
  `${sources.length} fuentes registradas, sintaxis válida y recursos de index.html disponibles.`,
);
