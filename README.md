# JOSEMI-OS

Portfolio de José Miguel Miralles Gandia, estudiante de Desarrollo de Aplicaciones Multiplataforma. Una web con escritorio, ventanas y estética pixel art.

[Abrir JOSEMI-OS](https://josemidev1.site/) · [GitHub](https://github.com/josemidev1-code) · [Contacto](mailto:josemidev1@gmail.com)

## Funciones

- Arranque Matrix y escritorio con ventanas que se pueden mover, minimizar y cerrar.
- Sobre mí, proyectos, habilidades y contacto.
- Terminal, buscador de aplicaciones y monitor del sistema.
- Arcade con Tetris, Pac-Man y JOSEMI Run.
- Secret Vault con acertijos y fondos desbloqueables.
- Diez fondos pixel art, iconos personalizados y salvapantallas ASCII.
- Milo, un ajolote con respuestas locales sobre el portfolio.
- Preferencias guardadas en el navegador y adaptación a móvil.

## Estructura

La web utiliza HTML, CSS y JavaScript, sin proceso de compilación.

| Archivo | Contenido |
| --- | --- |
| `index.html` | Arranque y estructura del escritorio |
| `style.css` | Diseño, ventanas, iconos y adaptación a pantallas |
| `script.js` | Aplicaciones, juegos, fondos, preferencias y asistente |

`CNAME` configura el dominio. `.nojekyll` permite publicar la web estática con GitHub Pages y `.gitignore` excluye configuración privada y archivos locales.

## Arquitectura

**Archivos separados.** La estructura, el diseño y la interacción se mantienen en HTML, CSS y JavaScript para facilitar el mantenimiento y publicar directamente en GitHub Pages.

**Estado local.** Los ajustes, récords y llaves de Secret Vault utilizan `localStorage`. Se conservan al recargar en el mismo navegador y no requieren una cuenta ni un servidor. Los acertijos son una función de juego, no un sistema de autenticación.

**Recursos gráficos integrados.** Los iconos y fondos pixel art se dibujan con SVG; el salvapantallas utiliza Canvas y texto ASCII. La galería mantiene el encuadre centrado y respeta las opciones de movimiento reducido.

Milo conversa mediante un Worker conectado a Groq y utiliza respuestas locales cuando la conexión falla. No consulta un servicio meteorológico.

## Publicación

GitHub Pages publica la raíz de la rama `main`. Las rutas de los estilos y scripts son relativas y el dominio es [josemidev1.site](https://josemidev1.site/).

## Referencias gráficas

Los fondos reinterpretan estéticas de ciencia ficción y videojuegos mediante dibujos propios de bloques. Milo se inspira en el ajolote de Minecraft y el terminal ASCII en el salvapantallas de Omarchy.

El fondo fotográfico desbloqueable de God of War utiliza una [imagen externa](https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg). Las fuentes proceden de Google Fonts.

## Servidor d’IA de Milo (Cloudflare + Groq)

El web estàtic necessita una ruta de servidor `POST /chat`; publicar només els fitxers HTML i JavaScript en Workers retorna 404 en eixa ruta.

`worker.mjs` implementa la connexió amb Groq i CORS. `wrangler.jsonc` desplega el Worker `milo-ai` i conserva el portfolio com a recursos estàtics. `build-worker-assets.mjs` copia únicament els fitxers públics a `.wrangler/site`, sense publicar el servidor, les proves ni la configuració. La clau no arriba mai al navegador.

1. En Cloudflare, dins del Worker **milo-ai**, configura `GROQ_API_KEY` com a **secret**. Reutilitza el secret existent si ja està configurat. No el poses en Git ni en el JavaScript del web.
2. Connecta el repositori i configura la comanda de desplegament `npx wrangler@4 deploy`, amb el directori arrel del repositori. També pots desplegar des d’una sessió local autenticada amb `npx wrangler@4 login` i `npx wrangler@4 deploy`.
3. El model per defecte és `llama-3.3-70b-versatile`. Pots canviar `GROQ_MODEL` si el teu compte necessita un altre model compatible amb ferramentes.
4. Comprova Milo des del portfolio. Si falta el secret, `/chat` retorna 503; si Groq rebutja la petició, retorna un error amb `provider_status`, sense mostrar claus ni contingut privat del proveïdor.

Validació local: `node --test tests/milo-worker.test.mjs` i `npx wrangler@4 deploy --dry-run`. Per provar el Worker localment: `npx wrangler@4 dev`; configura el secret només en un fitxer local `.dev.vars` (ignorat per Git) i apunta el client al servidor local durant la prova. Els orígens acceptats inclouen el domini del portfolio, el del Worker i el servidor local en el port 8000; `ALLOWED_ORIGINS` permet substituir la llista amb orígens separats per comes.
