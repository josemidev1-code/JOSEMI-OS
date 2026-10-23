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

## Estructura

La web utiliza HTML, CSS y JavaScript, sin proceso de compilación.

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

**Archivos separados.** La estructura, el diseño y la interacción se mantienen en HTML, CSS y JavaScript para facilitar el mantenimiento y publicar directamente en GitHub Pages.

**Estado local.** Los ajustes, récords y llaves de Secret Vault utilizan `localStorage`. Se conservan al recargar en el mismo navegador y no requieren una cuenta ni un servidor. Los acertijos son una función de juego, no un sistema de autenticación.

**Recursos gráficos integrados.** Los iconos y fondos pixel art se dibujan con SVG; el salvapantallas utiliza Canvas y texto ASCII. La galería mantiene el encuadre centrado y respeta las opciones de movimiento reducido.

## Milo AI y APIs (proyecto DAM)

La web de GitHub Pages es estática. El frontend `milo-ai.js` se comunica con el Cloudflare Worker `worker.js`. Las credenciales de las APIs no se incluyen en el HTML ni en JavaScript público.

| API | Uso | Clave |
| --- | --- | --- |
| Groq Chat Completions | Conversación con modelo Llama 3.3 70B | `GROQ_API_KEY` (obligatoria) |
| Tavily Search | Búsqueda de información actual con enlaces | `TAVILY_API_KEY` (opcional) |
| Open-Meteo Geocoding + Forecast | Tiempo actual en ciudades | Sin clave |
| Apple iTunes Search | Encontrar canciones y escuchar previews | Sin clave |

### Configuración del Worker

1. Crea un Worker de Cloudflare, instala y autentica Wrangler, y desde la carpeta del proyecto ejecuta `npx wrangler secret put GROQ_API_KEY`.
2. Si quieres búsqueda web, ejecuta `npx wrangler secret put TAVILY_API_KEY`. Sin Tavily, Milo seguirá pudiendo hablar y consultar el tiempo.
3. Despliega con `npx wrangler deploy`. El archivo `wrangler.toml` usa el nombre `milo-ai`. Comprueba que su URL coincide con el `endpoint` declarado en `milo-ai.js`.
4. Publica el frontend fusionando la rama en `main` para que GitHub Pages actualice la web.
5. Prueba `https://milo-ai.josemidev1.workers.dev/health` (debe indicar `groq: true`). El valor `tavily: true` señala que la clave de búsqueda existe.

Los endpoints del Worker son `POST /chat`, `POST /search`, `POST /weather` y `GET /health`. Las llamadas a Groq y Tavily requieren configuración previa. `/weather` usa primero geocodificación y después previsión actual con la API de Open-Meteo; la búsqueda sin clave no es posible. La música se obtiene directamente de iTunes desde el navegador, sin credenciales. Los resultados de APIs externas pueden no estar disponibles si el proveedor falla.

### Demostración en clase

- «Qui és Josemi i què estudia?» demuestra el contexto del portfolio y la IA.
- «Explica'm què és una API REST» demuestra conversación libre.
- «Quin temps fa a València?» demuestra geocodificación y datos meteorológicos de una API.
- «Busca notícies recents sobre Java» demuestra Tavily si has configurado su clave.
- «Obri projectes», «Posa el tema oceà», «Busca música de Queen» demuestran herramientas y la integración en la interfaz.

**Arquitectura**: navegador → Worker → Groq → `tool_calls` → Worker (Tavily/Open-Meteo) o navegador (iTunes/acciones visuales) → respuesta. Las respuestas se envían como JSON.

**Seguridad y despliegue**: nunca subas archivos `.dev.vars`, claves ni tokens a GitHub. Los filtros CORS no sustituyen la autenticación ni impiden abusos fuera del navegador. Antes de dar difusión a la web configura límites de peticiones/costes en Cloudflare y en los proveedores. El endpoint es público y no tiene aún un límite de cuota por visitante. Las respuestas a preguntas sobre Josemi solo utilizan datos públicos declarados en el prompt del Worker.


## Publicación

GitHub Pages publica la raíz de la rama `main`. Las rutas de los estilos y scripts son relativas y el dominio es [josemidev1.site](https://josemidev1.site/).

## Referencias gráficas

Los fondos reinterpretan estéticas de ciencia ficción y videojuegos mediante dibujos propios de bloques. Milo se inspira en el ajolote de Minecraft y el terminal ASCII en el salvapantallas de Omarchy.

El fondo fotográfico desbloqueable de God of War utiliza una imagen del [kit oficial de PlayStation](https://www.playstation.com/en-us/god-of-war/community/), servida desde `assets/wallpapers`. Su procedencia y atribución figuran en `assets/wallpapers/SOURCES.md`. Las fuentes Pixelify Sans y VT323 (licencia OFL, procedentes de Google Fonts) se sirven desde `assets/fonts`.

Los 22 paisajes pixel art tienen detalles específicos de su escena y una capa animada compartida; se detiene al ocultar la pestaña o activar «Reducir movimiento». Las animaciones ASCII pueden superponerse sin sustituir el paisaje.

Milo puede abrir las 25 aplicaciones, cerrar/minimizar/maximizar ventanas, cambiar tema, fondo, cursor, sonido y movimiento, añadir notas locales, calcular e iniciar temporizadores. Las órdenes directas se ejecutan en el navegador; las demás conversaciones conservan la conexión con el Worker. Las acciones se limitan al escritorio de esta web, con una lista explícita de operaciones y aplicaciones: nunca ejecutan código arbitrario ni comandos del ordenador.
