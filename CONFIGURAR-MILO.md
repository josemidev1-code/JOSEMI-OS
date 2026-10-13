# Conectar las APIs de Milo — JOSEMI-OS

## 1. Consigue las dos claves

- **Groq:** https://console.groq.com/keys — crea una clave para el modelo `llama-3.3-70b-versatile`.
- **Tavily:** https://app.tavily.com/ — crea una clave de búsqueda para las consultas web.
- **iTunes Search:** no necesita clave. Solo usa previews de ~30 segundos. Los enlaces a YouTube son búsquedas de la canción, no reproducción completa embebida.

**No compartas las claves por chat, ni las subas a GitHub, ni las pongas en `milo-ai.js`.**

## 2. Despliega el Worker en Cloudflare

### Opción A: panel web (si ya tienes un Worker `milo-ai`)

1. Entra en https://dash.cloudflare.com/ > Workers & Pages > tu Worker `milo-ai`.
2. Pulsa **Edit code** (según la vista, en **Deployments** o en la página principal).
3. Sustituye el código existente por `cloudflare-worker/worker.js` y despliega.
4. Ve a **Settings > Variables and Secrets > Add**.
5. Crea `GROQ_API_KEY` de tipo **Secret** con la clave de Groq.
6. Crea `TAVILY_API_KEY` de tipo **Secret** con la clave de Tavily (opcional: sin ella el chat funciona, pero no la búsqueda web).
7. Haz **Deploy** de los cambios.

### Opción B: CLI (desde `cloudflare-worker/`)

```bash
npx wrangler login
npx wrangler deploy
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put TAVILY_API_KEY
```

Si Wrangler te crea un nuevo Worker en vez de actualizar el existente, asegúrate de que el nombre sea `milo-ai` y de que pertenezca a tu cuenta. La URL que usa la web es:
`https://milo-ai.josemidev1.workers.dev/chat`.

## 3. Comprueba el Worker

Abre en el navegador:
`https://milo-ai.josemidev1.workers.dev/health`

Tiene que devolver algo como:

```json
{"ok":true,"groq":true,"tavily":true}
```

Eso confirma que el Worker detecta las claves, **no** que los proveedores ya respondan. Para probar la IA desde una terminal:

```bash
curl -i 'https://milo-ai.josemidev1.workers.dev/chat' \
  -H 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"Hola Milo, quién eres?"}]}'
```

Para Tavily:

```bash
curl -i 'https://milo-ai.josemidev1.workers.dev/search' \
  -H 'Content-Type: application/json' \
  --data '{"query":"noticias tecnología octubre 2026"}'
```

La respuesta de IA utiliza `{ "message": { "role": "assistant", "content": "..." } }`.

## 4. Publica los archivos del portfolio

- Reemplaza en el repositorio las versiones antiguas de `index.html`, `script.js`, `style.css` y `milo-ai.js` por las de este paquete.
- **Importante:** los archivos que subiste llevan nombres como `index(3).html`; en GitHub deben llamarse EXACTAMENTE `index.html`, `script.js` y `style.css`, porque así los carga la web.
- Mantén el archivo `CNAME` con `josemidev1.site` y los demás archivos existentes de tu proyecto (si los hay).
- `milo-ai.js` ya tiene el endpoint del Worker. Si Cloudflare te da otra URL, cambia solo la línea `endpoint` dentro de `milo-ai.js`.
- No publiques `worker.js` como script cargado en HTML. Solo se despliega en Cloudflare.

## 5. Pruebas manuales en josemidev1.site

1. Pregunta `Hola Milo, qué estudia Josemi?` → debe contestar con la IA.
2. Pregunta `Busca en Internet qué noticias tecnológicas hay hoy` → debe llamar a Tavily y citar enlaces.
3. `Pon música de Daft Punk` → preview iTunes + enlaces a YouTube. Si el navegador bloquea autoplay, pulsa ▶.
4. `Abre proyectos` → debe abrir la app de proyectos.
5. `Cambia al tema océano` → debe cambiar al tema Ocean.

Abre F12 > Console / Network si ves errores:
- **403**: origen CORS no autorizado.
- **503**: falta un Secret (revisa `GROQ_API_KEY`, `TAVILY_API_KEY`).
- **429**: límite de peticiones del proveedor o del Worker.
- **502**: proveedor Groq o Tavily rechazó la llamada, consulta Cloudflare Worker Logs.
- **404**: URL del Worker o ruta errónea.

## 6. Seguridad y costes

- Las API keys solo viven en **Cloudflare Secrets**. No las subas al repositorio.
- El Worker permite CORS solo desde `josemidev1.site`, `www.josemidev1.site` y localhost para desarrollo. **CORS no autentica peticiones HTTP directas**: antes de abrir al público, usa rate limiting (Cloudflare), cuotas y alertas en Groq/Tavily; para evitar abuso serio, considera Turnstile/verificación en el Worker.
- Groq y Tavily tienen límites y precios según cuenta/plan; revisa sus paneles de uso. iTunes Search no requiere clave para este uso.
- El endpoint `/health` solo revela si el Worker tiene configuradas las variables, nunca su valor.

## Nota

No es posible desde este ZIP conocer si tu Worker previo ya estaba bien configurado: no has aportado el código ni las credenciales de ese Worker. Este paquete propone una implementación completa que sustituye su código sin exponer secretos.
