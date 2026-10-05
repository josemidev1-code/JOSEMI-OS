# JOSEMI Assistant en GitHub Pages, sin encender tu PC

El frontend consta de index.html, style.css y script.js. El ZIP incluye también y `cloudflare/worker.mjs`, que se ejecuta en Cloudflare. No publiques claves en GitHub ni las pegues en script.js (sección music-config).

## 1. Crear las claves

**YouTube**: entra en https://console.cloud.google.com/, crea/selecciona un proyecto, habilita **YouTube Data API v3** en APIs y servicios → Biblioteca. En Credenciales crea una clave de API y restringe su API a YouTube Data API v3. El Worker hace la llamada desde el servidor: no uses una restricción por referente HTTP diseñada para peticiones del navegador.

**Gemini**: entra en https://aistudio.google.com/apikey y crea una clave. Comprueba en AI Studio qué modelos tienes disponibles y sus cuotas/precios. El código propone `gemini-3.8-flash`, basado en la documentación consultada; puedes cambiar GEMINI_MODEL por el identificador exacto disponible en tu cuenta. El alojamiento gratuito no convierte todas las llamadas de Gemini en gratuitas.

## 2. Crear el Worker desde el navegador

1. Crea/inicia sesión en https://dash.cloudflare.com/.
2. Ve a **Workers & Pages → Create application** y elige un Worker con el ejemplo inicial (Hello World). Ponle `josemi-assistant` y despliega el ejemplo.
3. Abre **Edit code**. Sustituye el contenido del archivo principal por TODO el texto de `cloudflare/worker.mjs` (no music-server.cjs).
4. Pulsa **Deploy**. Copia la URL pública que Cloudflare asigne, como `https://josemi-assistant.tu-subdominio.workers.dev`.

La etiqueta exacta de creación puede cambiar en el panel; la opción debe crear un Worker, no un sitio de Pages. No necesitas ejecutar Node en el ordenador de clase para estos pasos.

## 3. Dónde pegar las claves

En tu Worker, **Settings → Variables and Secrets → Add** añade:

| Nombre exacto | Tipo | Valor |
| --- | --- | --- |
| YOUTUBE_API_KEY | Secret | Tu clave de YouTube |
| GEMINI_API_KEY | Secret | Tu clave de Gemini |
| ALLOWED_ORIGIN | Texto | https://josemidev1-code.github.io |
| GEMINI_MODEL | Texto | gemini-3.8-flash, o el identificador disponible en tu cuenta |

Guarda y despliega los cambios. En ALLOWED_ORIGIN va únicamente el origen, sin `/JOSEMI-OS/` ni barra final. Si usas dominio personalizado, pon `https://tu-dominio` en su lugar. Las dos claves solo van en los secretos de Cloudflare.

## 4. Conectar la web

Abre `script.js` y busca el bloque `BEGIN music-config.js` y cambia únicamente esta línea por tu URL REAL:

```js
window.JOSEMI_MUSIC_API = 'https://josemi-assistant.tu-subdominio.workers.dev';
```

No añadas `/api/chat` ni una barra final. Esa URL es pública y sí puede estar en GitHub. Reemplaza/sube los archivos de la web, incluidos index.html, style.css, script.js y las carpetas assets, cloudflare, docs, tests y tools. Conserva los otros archivos que vienen en el ZIP. Los archivos cloudflare y las instrucciones pueden estar en el repo porque no contienen secretos. No borres cambios propios posteriores sin compararlos.

Sube los cambios desde tu clon original del repositorio (el ZIP no lleva la carpeta .git):

```bash
git status
git add index.html style.css script.js assets cloudflare docs tests tools
git commit -m "Conecto asistente a Workers y convierto bienvenida en ventana"
git push
```

Espera a que termine el despliegue de GitHub Pages y recarga con Ctrl+Shift+R.

## 5. Prueba desde tu URL de Pages

Abre JOSEMI Music:

- «¿Qué estudia Josemi?» → respuesta de Gemini.
- «Pon Eyes Without a Face de Billy Idol» → Gemini interpreta, YouTube busca, aparece el vídeo y su tarjeta. Pulsa Reproducir si el navegador lo requiere.
- «Abre contacto» → abre la ventana de contacto.
- «Pausa» y «volumen 30» → órdenes locales sin gastar una llamada de IA.
- Cierra la ventana de bienvenida con «Ya lo he leído · Cerrar», recarga y comprueba que no vuelve a aparecer. No hay panel incrustado en el fondo. Se recuerda por navegador; otro navegador tendrá su primera bienvenida.

## Diagnóstico

- «Falta GEMINI_API_KEY/YOUTUBE_API_KEY»: revisa los nombres de los secretos y despliega.
- «Origen no autorizado» o error CORS: ALLOWED_ORIGIN debe coincidir exactamente con el origen de la web.
- Error de IA: revisa modelo disponible, clave y cuotas de Google.
- Error YouTube: comprueba habilitación de YouTube Data API v3 y restricciones de clave.
- Error de red: revisa la URL de script.js (sección music-config) y que el Worker esté desplegado.
- Vídeo no disponible: puede tener restricciones regionales o de inserción; elige otra versión.

## Límites y decisiones

Cloudflare mantiene el servidor sin tu PC. Las cuotas de Gemini/YouTube son independientes. El Worker aplica un límite de apoyo de ocho llamadas por minuto por IP y por instancia; no es un límite global garantizado. CORS limita qué webs pueden leer la respuesta, pero no es autenticación. Limita cuotas y gasto también en el proveedor antes de permitir uso público amplio.

La ficha de Gemini contiene solo datos públicos. Las acciones se validan con una lista fija; no se ejecuta código generado por la IA. La conversación mantiene como máximo tres intercambios en la ventana y se envían como contexto. No se guardan chats en una base de datos.

No se ha desplegado ni validado con tus claves reales. Las pruebas usan respuestas simuladas para comprobar conexión, CORS, acciones, secretos ausentes y errores.

Fuentes: https://developers.cloudflare.com/workers/configuration/secrets/ · https://developers.cloudflare.com/workers/get-started/dashboard/ · https://ai.google.dev/gemini-api/docs/generate-content/structured-output · https://developers.google.com/youtube/v3/docs/search/list
