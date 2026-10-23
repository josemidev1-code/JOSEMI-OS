# JOSEMI-OS

Portfolio de José Miguel Miralles Gandia, estudiante de Desarrollo de Aplicaciones Multiplataforma. Una web con escritorio, ventanas y estética pixel art.

[Abrir JOSEMI-OS](https://josemidev1.site/) · [GitHub](https://github.com/josemidev1-code) · [Contacto](mailto:josemidev1@gmail.com)

## Funciones

- Arranque Matrix y escritorio con ventanas que se pueden mover, minimizar y cerrar.
- Sobre mí, proyectos, habilidades y contacto.
- Terminal, buscador de aplicaciones y monitor del sistema.
- Arcade con Tetris (Maratón, Sprint 40 y Ultra, rotación SRS, pieza guardada y T-spins), Pac-Man (laberinto propio, cuatro fantasmas con personalidad, frutas y niveles) y Buscaminas (cuatro dificultades, primer clic seguro, acordes, pistas y estadísticas).
- Secret Vault con acertijos y fondos desbloqueables.
- 22 fondos pixel art (galería con buscador y favoritos), iconos personalizados y salvapantallas ASCII.
- Milo, un ajolote con IA (Groq), búsqueda web (Tavily), meteorología (Open-Meteo) y música (iTunes). Las respuestas locales se conservan como respaldo.
- Preferencias guardadas en el navegador y adaptación a móvil.

La primera visita reproduce la intro completa, sin bloque de presentación ni botón para saltarla. Al completarla se guarda `introSeen` en ese navegador; en visitas posteriores se puede saltar con el botón o Enter. Si se borran los datos del navegador, vuelve a contar como primera visita. Milo conserva el chat y sus acciones, sin bocadillos ni frases espontáneas en el escritorio.

## Estructura

La web publicada utiliza HTML, CSS y JavaScript estáticos. Las fuentes editables están separadas en `src/` y `styles/`; `npm run build` genera los archivos públicos de la raíz y sus versiones de caché. [Mapa del código y comandos de mantenimiento](docs/DESARROLLO.md).

| Archivo | Contenido |
| --- | --- |
| `index.html` | Arranque y estructura del escritorio |
| `style.css` | Diseño, ventanas, iconos y adaptación a pantallas |
| `script.js` | Aplicaciones, fondos, preferencias y chat de Milo |
| `games.js` / `games.css` | Arcade: Tetris, Pac-Man y Buscaminas |
| `pixel-universe.js` / `pixel-universe.css` | Iconos, entrada con moneda, animación de los paisajes, Vault y acciones locales de Milo |
| `milo-ai.js` | Cliente de IA y acciones del chat |
| `worker.js` | Backend serverless para Groq, Tavily y Open-Meteo |
| `wrangler.toml` | Configuración del despliegue a Cloudflare Workers |

`CNAME` configura el dominio. `.nojekyll` permite publicar la web estática con GitHub Pages y `.gitignore` excluye configuración privada y archivos locales.

## Arquitectura

**Fuentes por responsabilidad.** Aplicaciones, juegos, ventanas, fondos, arranque, Milo y proveedores tienen fuentes separadas. Un manifiesto explícito genera los archivos públicos conservando el orden de dependencias y los ámbitos privados. GitHub Pages sirve los resultados directamente.

**Estado local.** Los ajustes, récords y llaves de Secret Vault utilizan `localStorage`. Se conservan al recargar en el mismo navegador y no requieren una cuenta ni un servidor. Los acertijos son una función de juego, no un sistema de autenticación.

**Recursos gráficos integrados.** Los iconos y fondos pixel art se dibujan con SVG; el salvapantallas utiliza Canvas y texto ASCII. La galería mantiene el encuadre centrado y respeta las opciones de movimiento reducido.

## Milo AI y APIs (proyecto DAM)

La web de GitHub Pages es estática. El frontend `milo-ai.js` se comunica con el Cloudflare Worker `worker.js`. Las credenciales de las APIs no se incluyen en el HTML ni en JavaScript público.

| API | Uso | Clave |
| --- | --- | --- |
| Groq Chat Completions | Conversación con modelo openai/gpt-oss-120b | `GROQ_API_KEY` (obligatoria) |
| Tavily Search | Búsqueda de información actual con enlaces | `TAVILY_API_KEY` (opcional) |
| Open-Meteo Geocoding + Forecast | Tiempo actual en ciudades | Sin clave |
| Apple iTunes Search | Encontrar canciones y escuchar previews | Sin clave |

### Configuración del Worker

1. Crea un Worker de Cloudflare, instala y autentica Wrangler, y desde la carpeta del proyecto ejecuta `npx wrangler secret put GROQ_API_KEY`.
2. Si quieres búsqueda web, ejecuta `npx wrangler secret put TAVILY_API_KEY`. Sin Tavily, Milo seguirá pudiendo hablar y consultar el tiempo.
3. Despliega con `npx wrangler deploy`. El archivo `wrangler.toml` usa el nombre `milo-ai`. Comprueba que su URL coincide con el `endpoint` declarado en `milo-ai.js`.
4. Publica el frontend fusionando la rama en `main` para que GitHub Pages actualice la web.
5. Prueba `https://milo-ai.josemidev1.workers.dev/health`: devuelve únicamente `{ "ok": true }`. Comprueba la configuración de los proveedores con una conversación y una búsqueda desde la web; el endpoint público no expone claves configuradas ni el modelo.

Los endpoints del Worker son `POST /chat`, `POST /search`, `POST /weather` y `GET /health`. Las llamadas a Groq y Tavily requieren configuración previa. `/weather` usa primero geocodificación y después previsión actual con la API de Open-Meteo; la búsqueda sin clave no es posible. La música se obtiene directamente de iTunes desde el navegador, sin credenciales. Los resultados de APIs externas pueden no estar disponibles si el proveedor falla.

### Demostración en clase

- «Qui és Josemi i què estudia?» demuestra el contexto del portfolio y la IA.
- «Explica'm què és una API REST» demuestra conversación libre.
- «Quin temps fa a València?» demuestra geocodificación y datos meteorológicos de una API.
- «Busca notícies recents sobre Java» demuestra Tavily si has configurado su clave.
- «Obri projectes», «Posa el tema oceà», «Busca música de Queen» demuestran herramientas y la integración en la interfaz.

**Arquitectura**: navegador → Worker → Groq → `tool_calls` → Worker (Tavily/Open-Meteo) o navegador (iTunes/acciones visuales) → respuesta. Las respuestas se envían como JSON.

**Seguridad y despliegue**: nunca subas archivos `.dev.vars`, claves ni tokens a GitHub. Los POST exigen un Origin permitido, pero este se puede falsificar fuera del navegador. El binding `MILO_RATE_LIMITER`, declarado en `wrangler.toml`, aplica un umbral conjunto de 20 peticiones por minuto por IP a `/chat`, `/search` y `/weather`. Cloudflare mantiene contadores aproximados por ubicación: no es una cuota global estricta ni protección completa contra ataques distribuidos. Conserva los límites de uso de los proveedores. Si el binding no está disponible, el Worker devuelve 503 sin consultar APIs; al superar el umbral devuelve 429 y `Retry-After: 60`. Una conversación puede utilizar varias peticiones para completar herramientas.

Groq tiene un tiempo máximo de 25 segundos por llamada; Tavily y cada consulta de Open-Meteo, 8 segundos. Los errores visibles están en castellano. La página tiene CSP para scripts propios, fuentes locales, fondos SVG y los servicios usados por Milo, además de una presentación de contacto sin JavaScript. Los datos que Milo utiliza sobre Josemi son públicos.

`npm run verify` comprueba generación, caché, sintaxis, recursos, formato y 13 pruebas de seguridad, contrato y mantenimiento. Las pruebas del Worker también se pueden ejecutar con `node --test tests/worker-security.test.mjs`. Antes de publicar cambios de fuentes, ejecuta `npm run build`: actualiza automáticamente los `?v=` mediante huellas del contenido. Después comprueba la web pública.


## Publicación

GitHub Pages publica la raíz de la rama `main`. Las rutas de los estilos y scripts son relativas y el dominio es [josemidev1.site](https://josemidev1.site/).

## Entrega y defensa

- [Guía de defensa de cinco minutos y preguntas](docs/DEFENSA.md).
- [ADR 001: web estática y Worker](docs/arquitectura/0001-web-estatica-y-worker.md) y [ADR 002: estado local](docs/arquitectura/0002-estado-local.md).
- [Extractos de instrucciones y trazabilidad](prompts/README.md). Se archivan ahora, sin inventar una cronología anterior.
- [Revisión de los criterios de entrega](REVISION-RUBRICA.md).
- [Informes Lighthouse y verificación de la demo en producción](docs/evidencias/README.md): rendimiento 96 en móvil y 97 en escritorio; accesibilidad, buenas prácticas y SEO 100. Mediciones del 23 de octubre de 2026, no una garantía permanente.
- [Evolución v1 → v2](CHANGELOG.md), vinculada a estados reales del historial.
- Demo real de 30 segundos en Proyectos → JOSEMI-OS: MP4 H.264, 1280×720, 1,16 MB, sin audio, con subtítulos y descripción. Usa controles, póster y `preload="none"`; se pausa al minimizar o dejar la pestaña. [Descripción accesible](media/demo-transcripcion.html).

Los contadores del proyecto leen las aplicaciones y paisajes registrados. La demo muestra una orden local de Milo, no una conversación remota simulada. La fotografía personal sigue pendiente de una imagen que Josemi decida publicar; la captura y el vídeo son medios propios del proyecto, no fotografías personales.

La interfaz utiliza Atkinson Hyperlegible Next; el terminal, el código y el ASCII utilizan JetBrains Mono, con las ligaduras desactivadas donde deben distinguirse los caracteres. Ambas se sirven localmente en WOFF2. [Procedencia y licencias de las fuentes](assets/fonts/SOURCES.md).

## Referencias gráficas

Los fondos reinterpretan estéticas de ciencia ficción y videojuegos mediante dibujos propios de bloques. Milo se inspira en el ajolote de Minecraft y el terminal ASCII en el salvapantallas de Omarchy.

El fondo fotográfico desbloqueable de God of War utiliza una imagen del [kit oficial de PlayStation](https://www.playstation.com/en-us/god-of-war/community/), servida desde `assets/wallpapers`. Su procedencia y atribución figuran en `assets/wallpapers/SOURCES.md`. Las licencias y procedencia de las tipografías están en `assets/fonts/SOURCES.md`.

Los 22 paisajes pixel art tienen detalles específicos de su escena y una capa animada compartida; se detiene al ocultar la pestaña o activar «Reducir movimiento».
Los paisajes utilizan exclusivamente su animación pixel art. Los efectos ASCII del escritorio se reservan para fondos de color, y la foto de God of War no recibe partículas superpuestas. ASCII Studio conserva sus propios efectos.

El escritorio muestra seis accesos esenciales: Sobre mí, Proyectos, Arcade, Bloc de notas, Fondos y Contacto. El resto está en Aplicaciones y el buscador; los tres juegos se agrupan dentro de Arcade. La primera entrada a un juego pasa por la máquina y su moneda, también si se solicita a Milo. Inicio, Proyectos, Arcade y Ajustes permanecen en la barra de tareas.

Milo puede abrir las 25 aplicaciones, cerrar/minimizar/maximizar ventanas, cambiar tema, fondo, cursor, sonido y movimiento, añadir notas locales, calcular e iniciar temporizadores. Las órdenes directas se ejecutan en el navegador; las demás conversaciones conservan la conexión con el Worker. Las acciones se limitan al escritorio de esta web, con una lista explícita de operaciones y aplicaciones: nunca ejecutan código arbitrario ni comandos del ordenador.
