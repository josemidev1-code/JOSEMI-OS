import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { buildOutputs, versionAssets, digest } from "../tools/build.mjs";

test("La generación es reproducible y versiona los recursos por contenido", async () => {
  const first = await buildOutputs();
  const second = await buildOutputs();
  assert.deepEqual([...first], [...second]);
  const html = '<script src="script.js?v=viejo"></script>';
  const result = versionAssets(html, new Map([["script.js", "contenido"]]));
  assert.equal(result, `<script src="script.js?v=${digest("contenido")}"></script>`);
  assert.notEqual(result, versionAssets(html, new Map([["script.js", "cambio"]])));
});

test("El almacenamiento respeta valores válidos y tolera bloqueo o JSON roto", async () => {
  const code = await readFile(new URL("../src/core/storage.js", import.meta.url), "utf8");
  const values = new Map();
  const context = vm.createContext({
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
  });
  vm.runInContext(code + "\nglobalThis.storage = OSStorage;", context);
  assert.equal(context.storage.readJSON("ausente", 7), 7);
  for (const value of [false, 0, "", "texto"]) {
    assert.equal(context.storage.writeJSON("dato", value), true);
    assert.equal(context.storage.readJSON("dato", "respaldo"), value);
  }
  values.set("dato", "{incompleto");
  assert.equal(context.storage.readJSON("dato", "respaldo"), "respaldo");
  context.localStorage.getItem = () => {
    throw new Error("Bloqueado");
  };
  context.localStorage.setItem = () => {
    throw new Error("Sin espacio");
  };
  assert.equal(context.storage.readJSON("dato", "respaldo"), "respaldo");
  assert.equal(context.storage.writeJSON("dato", 1), false);
});

test("La calculadora mantiene precedencia y rechaza operaciones ejecutables", async () => {
  const code = await readFile(new URL("../src/core/calculator.js", import.meta.url), "utf8");
  const context = vm.createContext({});
  vm.runInContext(code, context);
  assert.equal(context.PixelTools.calculate("2 + 3 * 4"), 14);
  assert.equal(context.PixelTools.calculate("(2 + 3) * 4"), 20);
  assert.equal(context.PixelTools.calculate("25% * 80"), 20);
  for (const input of ["1/0", "alert(1)", "2+", "globalThis.x=1"]) {
    assert.throws(() => context.PixelTools.calculate(input));
  }
});
