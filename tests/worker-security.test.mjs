import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../worker.js", import.meta.url), "utf8");
const worker = (
  await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"))
).default;
const origin = "https://josemidev1.site";
const request = (path, payload = {}, extra = {}) =>
  new Request("https://milo.test" + path, {
    method: "POST",
    headers: {
      Origin: origin,
      "Content-Type": "application/json",
      "CF-Connecting-IP": "192.0.2.1",
      ...extra,
    },
    body: JSON.stringify(payload),
  });
const env = () => ({
  GROQ_API_KEY: "test",
  TAVILY_API_KEY: "test",
  MILO_RATE_LIMITER: { limit: async () => ({ success: true }) },
});
const response = (data) =>
  new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

test("Milo: protección y contrato público", async (t) => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = () => {
      throw new Error("No se permite llamar al proveedor en esta prueba");
    };
    await t.test("rechaza POST sin Origin o con Origin ajeno en las tres rutas", async () => {
      for (const path of ["/chat", "/search", "/weather"])
        for (const bad of ["", "https://ajeno.test"]) {
          const r = await worker.fetch(request(path, {}, { Origin: bad }), env());
          assert.equal(r.status, 403);
          assert.equal(r.headers.get("Access-Control-Allow-Origin"), null);
        }
      const r = await worker.fetch(
        new Request("https://milo.test/chat", { method: "OPTIONS", headers: { Origin: origin } }),
        {},
      );
      assert.equal(r.status, 204);
      assert.equal(r.headers.get("Access-Control-Allow-Origin"), origin);
    });
    await t.test("health solo expone ok y no consume la cuota", async () => {
      const r = await worker.fetch(new Request("https://milo.test/health"), {});
      assert.equal(r.status, 200);
      assert.deepEqual(await r.json(), { ok: true });
    });
    await t.test("conserva validación del cuerpo y limita bytes UTF-8", async () => {
      for (const [payload, status] of [
        [null, 400],
        [[], 400],
        [{ query: "á".repeat(9000) }, 413],
      ]) {
        assert.equal((await worker.fetch(request("/search", payload), env())).status, status);
      }
      const r = await worker.fetch(
        new Request("https://milo.test/chat", {
          method: "POST",
          headers: { Origin: origin, "Content-Type": "application/json" },
          body: "{",
        }),
        env(),
      );
      assert.equal(r.status, 400);
    });
    await t.test(
      "límite agregado por IP, 429 con Retry-After y otra IP independiente",
      async () => {
        const counts = new Map(),
          settings = env();
        settings.MILO_RATE_LIMITER.limit = async ({ key }) => {
          const n = (counts.get(key) || 0) + 1;
          counts.set(key, n);
          return { success: n <= 20 };
        };
        for (let i = 0; i < 20; i++)
          assert.equal((await worker.fetch(request("/search"), settings)).status, 400);
        const denied = await worker.fetch(request("/weather"), settings);
        assert.equal(denied.status, 429);
        assert.equal(denied.headers.get("Retry-After"), "60");
        assert.equal(denied.headers.get("Access-Control-Allow-Origin"), origin);
        assert.equal(
          (
            await worker.fetch(
              request("/search", {}, { "CF-Connecting-IP": "192.0.2.2" }),
              settings,
            )
          ).status,
          400,
        );
      },
    );
    await t.test("si falla el limitador o falta la IP, no consume APIs externas", async () => {
      assert.equal((await worker.fetch(request("/chat"), {})).status, 503);
      const settings = env();
      settings.MILO_RATE_LIMITER.limit = async () => {
        throw new Error("unavailable");
      };
      assert.equal((await worker.fetch(request("/search"), settings)).status, 503);
      assert.equal(
        (await worker.fetch(request("/weather", {}, { "CF-Connecting-IP": "" }), env())).status,
        503,
      );
    });
    let modelTools;
    await t.test(
      "preserva mensajes y herramientas; ignora system del cliente y no publica reasoning",
      async () => {
        globalThis.fetch = async (url, options) => {
          assert(options.signal instanceof AbortSignal);
          const body = JSON.parse(options.body);
          modelTools = body.tools;
          assert.equal(body.messages.filter((m) => m.role === "system").length, 1);
          assert(!body.messages.some((m) => m.content === "system ajeno"));
          return response({
            choices: [{ message: { role: "assistant", content: "Hola", reasoning: "privado" } }],
          });
        };
        const r = await worker.fetch(
          request("/chat", {
            messages: [
              { role: "system", content: "system ajeno" },
              { role: "user", content: "Hola" },
            ],
          }),
          env(),
        );
        assert.equal(r.status, 200);
        assert.deepEqual(await r.json(), { message: { role: "assistant", content: "Hola" } });
      },
    );
    await t.test(
      "las listas del servidor, herramientas y validaciones del cliente coinciden",
      async () => {
        const client = await readFile(new URL("../milo-ai.js", import.meta.url), "utf8");
        const sandbox = {
          window: {
            PixelOS: { command: () => null, perform: () => ({ ok: true }) },
            chooseTheme: () => {},
          },
          AbortController,
          setTimeout,
          clearTimeout,
        };
        const context = vm.createContext(sandbox);
        vm.runInContext(client, context);
        for (const [name, param] of [
          ["open_app", "app"],
          ["set_theme", "theme"],
        ]) {
          const values = modelTools.find((t) => t.function.name === name).function.parameters
            .properties[param].enum;
          const declared = sandbox.window.MiloAI.tools.find((t) => t.function.name === name)
            .function.parameters.properties[param].enum;
          assert.deepEqual([...declared], values);
          for (const value of values) {
            let count = 0;
            sandbox.fetch = async (_url, options) => {
              const history = JSON.parse(options.body).messages;
              if (count++ === 0)
                return response({
                  message: {
                    role: "assistant",
                    content: null,
                    tool_calls: [
                      {
                        id: "call",
                        type: "function",
                        function: { name, arguments: JSON.stringify({ [param]: value }) },
                      },
                    ],
                  },
                });
              const result = JSON.parse(history.at(-1).content);
              assert.equal(result.error, undefined, `${name}: ${value}`);
              return response({ message: { role: "assistant", content: "Hecho" } });
            };
            assert.equal((await sandbox.window.MiloAI.reply("Prueba de contrato")).text, "Hecho");
          }
        }
      },
    );
    await t.test(
      "búsqueda y tiempo conservan su respuesta y todos los fetch tienen señal",
      async () => {
        const urls = [];
        globalThis.fetch = async (url, options) => {
          assert(options.signal instanceof AbortSignal);
          urls.push(String(url));
          if (String(url).includes("tavily"))
            return response({
              results: [{ title: "Prueba", url: "https://example.com", content: "Resultado" }],
            });
          if (String(url).includes("geocoding"))
            return response({
              results: [{ name: "Valencia", country: "España", latitude: 39.47, longitude: -0.38 }],
            });
          return response({
            current: { temperature_2m: 20, weather_code: 0, time: "2026-10-23T12:00" },
          });
        };
        const search = await worker.fetch(request("/search", { query: "Prueba" }), env());
        assert.equal(search.status, 200);
        assert.equal((await search.json()).source, "Tavily");
        const weather = await worker.fetch(request("/weather", { city: "Valencia" }), env());
        assert.equal(weather.status, 200);
        assert.equal((await weather.json()).source, "Open-Meteo");
        assert.equal(urls.length, 3);
      },
    );
    await t.test(
      "los proveedores que agotan su tiempo devuelven 504 y plazos de 25/8 segundos",
      async () => {
        const originalTimeout = AbortSignal.timeout,
          budgets = [];
        try {
          AbortSignal.timeout = (ms) => {
            budgets.push(ms);
            return originalTimeout(ms);
          };
          globalThis.fetch = async () => {
            throw new DOMException("Timeout", "TimeoutError");
          };
          for (const [path, payload] of [
            ["/chat", { messages: [{ role: "user", content: "Hola" }] }],
            ["/search", { query: "Prueba" }],
            ["/weather", { city: "Valencia" }],
          ])
            assert.equal((await worker.fetch(request(path, payload), env())).status, 504);
          assert.deepEqual(budgets, [25000, 8000, 8000]);
        } finally {
          AbortSignal.timeout = originalTimeout;
        }
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
