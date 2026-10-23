import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, resolve, relative } from "node:path";
import { parse } from "acorn";
import { format } from "prettier";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const manifest = JSON.parse(await readFile(resolve(root, "sources.manifest.json"), "utf8"));
const configuration = JSON.parse(await readFile(resolve(root, ".prettierrc.json"), "utf8"));
export const digest = (text) => createHash("sha256").update(text).digest("hex").slice(0, 12);

function sourcePath(file) {
  const target = resolve(root, file);
  if (relative(root, target).startsWith("..") || !/^(src|styles)\//.test(file)) {
    throw new Error(`Fuente fuera del proyecto: ${file}`);
  }
  return target;
}

export async function buildOutputs() {
  const outputs = new Map();
  for (const output of manifest.outputs) {
    const groups = [];
    for (const group of output.groups) {
      const sources = await Promise.all(
        group.files.map((file) => readFile(sourcePath(file), "utf8")),
      );
      const content = sources.join("\n\n");
      groups.push(group.scope === "private" ? `(() => {\n${content}\n})();` : content);
    }
    const banner = `/* GENERADO: editar src/ o styles/ y ejecutar npm run build. Orden: sources.manifest.json. */\n`;
    const result = await format(banner + groups.join("\n\n"), {
      ...configuration,
      parser: output.type === "css" ? "css" : "babel",
    });
    if (output.type !== "css") {
      parse(result, {
        ecmaVersion: "latest",
        sourceType: output.type === "module" ? "module" : "script",
      });
    }
    outputs.set(output.file, result);
  }
  return outputs;
}

export function versionAssets(html, outputs) {
  for (const [file, content] of outputs) {
    const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(
      new RegExp(`((?:src|href)="${escaped})(?:\\?v=[^"\\s]*)?"`, "g"),
      `$1?v=${digest(content)}"`,
    );
  }
  return html;
}

async function main() {
  const check = process.argv.includes("--check");
  const outputs = await buildOutputs();
  const html = await readFile(resolve(root, "index.html"), "utf8");
  outputs.set("index.html", versionAssets(html, outputs));
  const stale = [];
  for (const [file, content] of outputs) {
    const previous = await readFile(resolve(root, file), "utf8").catch(() => "");
    if (previous === content) continue;
    stale.push(file);
    if (!check) await writeFile(resolve(root, file), content);
  }
  if (check && stale.length)
    throw new Error(`Archivos desactualizados: ${stale.join(", ")}. Ejecuta npm run build.`);
  console.log(
    check
      ? "Fuentes, salidas y caché sincronizadas."
      : `Generación terminada: ${stale.length} archivos actualizados.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
