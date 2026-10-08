# JOSEMI-OS

Portfolio de José Miguel Miralles Gandia, estudiante de DAM. La web abre directamente con el arranque Matrix y entra al escritorio. Las ventanas Sobre mí, Proyectos y Contacto explican quién soy, mis aficiones y cómo escribirme.

[Web en GitHub Pages](https://josemidev1.site/) · [Mi GitHub](https://github.com/josemidev1-code) · [Contacto](mailto:josemidev1@gmail.com)

## Archivos

La web funciona con **tres archivos**, sin instalar paquetes ni compilar:

- `index.html`: arranque, escritorio, menú y zonas donde se muestran las ventanas.
- `style.css`: colores, tipografías, interfaz, fondos, iconos, chat y adaptación al móvil.
- `script.js`: datos personales, motor de ventanas, aplicaciones, juegos, preferencias, Secret Vault y Milo.

`CNAME` asocia josemidev1.site a Pages. `.gitignore`, `.nojekyll` y este README son apoyo del repositorio. El PDF de clase está excluido y se queda en la copia del Escritorio. Los recursos gráficos propios y el favicon están integrados; el fondo externo de God of War se solicita al activarlo.

## Qué funciona

Se conserva el arranque Matrix, las ventanas que se pueden mover/minimizar/cerrar, la búsqueda, los ajustes, ASCII Studio, Tetris, Pac-Man y JOSEMI Run. Incluye 15 iconos SVG propios sobre una rejilla de 32 píxeles, con contornos, luces y sombras, un dock compacto y Milo, un ajolote rosa inspirado en Minecraft. El favicon comparte el dibujo del terminal. No hay una página previa al sistema. La barra superior se ha retirado.

Secret Vault tiene dos preguntas personales, pistas y respuestas normalizadas: **Morfeo** desbloquea Matrix verde y cian; **God of War** desbloquea el fondo elegido. Las llaves y preferencias se guardan en `localStorage`. Es un juego público: no sirve para proteger datos privados.

Milo conserva el chat existente y usa respuestas locales escritas en `RAMAS`. Su dibujo está en `MILO_SVG`, integrado en JavaScript. **Todavía no está conectado a una IA ni a una API meteorológica.** No inventa el tiempo. La integración se hará manualmente en clase.

## Salvapantallas: terminal ASCII

Se abre con la estrella del dock o en Ajustes → Salvapantallas. En Ajustes se puede iniciar también tras uno o tres minutos de inactividad. Cualquier tecla, clic o movimiento del ratón vuelve al escritorio.

Llena la pantalla con caracteres Matrix y una firma grande que se adapta al ancho y al alto. `SAVER_SCENES` encadena siete escenas durante 73 segundos: JOSEMI-OS, señal Matrix, órbita, Milo, píldoras, hacha y firma personal. El orden se repite al terminar. Cada escena tiene su comando, texto y efecto de aparición; los dibujos y la órbita se generan por código, sin vídeo, imágenes externas ni librerías.

Edita `SAVER_SCENES` para cambiar los textos, las duraciones y los easter eggs. `showScreensaver` dibuja con Canvas y `requestAnimationFrame`; `hideScreensaver` cancela el bucle y retira el ajuste de tamaño. Al ocultar la pestaña se detiene. Reducir movimiento viene desactivado; si se activa manualmente, muestra una firma estática.

La experiencia toma como referencia el [salvapantallas de Omarchy](https://omarchy.org/manual/toggles-idle-screensaver/), adaptada a una web con JavaScript. Los dibujos y efectos de esta página son propios. Milo se inspira en el ajolote de Minecraft; no utiliza un archivo del juego.

## Puntos para editar en clase

En `script.js`, busca `DATOS PERSONALES`, `MILO / ASISTENTE` y `PUNTO DE CONEXIÓN DE APIS`:

- `PROFILE` / `PROJECTS`: información y proyectos mostrados en las aplicaciones.
- `Apps`: contenido y eventos de cada ventana; `Apps.easter` contiene las preguntas de Secret Vault.
- `INSTRUCCIONES`: ficha pública para una futura integración con un modelo.
- `RAMAS` / `getLocalReply`: palabras clave y frases que Milo responde actualmente.
- `getAssistantReply(message)`: recibe la pregunta y devuelve `{text: "respuesta", app: "id opcional"}`. Aquí se puede conectar el tiempo o el proxy de IA.
- `chatHistory`: últimas cuatro frases de la sesión. `sendChat` controla el envío, la espera máxima y el error visible.

Para conectar una IA hay que confirmar con Edu la URL, el método, las cabeceras, el cuerpo y el formato de respuesta. Las claves privadas del proveedor deben quedarse en el servidor, nunca en el HTML o JavaScript público. Cambiar la función de conexión no requiere sustituir el motor ni el diseño.

## Decisiones de arquitectura

1. **Situación:** necesito leer y modificar el código con la IA del centro. **Decisión:** mantener HTML, CSS y JS separados, integrar la personalización en `script.js` y retirar configuraciones de despliegue y música que ya no se usan. **Consecuencia:** tres archivos de frontend fáciles de copiar y publicar, manteniendo el motor existente.
2. **Situación:** el servicio de IA se conectará más adelante. **Decisión:** separar `getAssistantReply` de la interfaz y conservar `getLocalReply`. **Consecuencia:** Milo funciona ahora sin llamadas a internet y se puede añadir una API sin rehacer el chat.
3. **Situación:** los fondos y llaves deben sobrevivir a la recarga. **Decisión:** usar `localStorage` en el navegador. **Consecuencia:** hay estado persistente sin cuenta ni servidor; no se sincroniza entre dispositivos ni constituye autenticación.

## Publicación y comprobaciones

La web está preparada para GitHub Pages desde `main`, carpeta raíz `/`. `.nojekyll` evita el procesamiento con Jekyll. El CSS y el JavaScript usan rutas relativas.

Se ha probado en Edge: arranque Matrix automático y entrada directa, aplicaciones, minimización, los tres juegos, Vault (aciertos, fallos, pistas y persistencia), Milo y adaptación a 320/390 px. Sin errores de JavaScript en esas pruebas. Antes de entregar hay que comprobar **la URL publicada**, su consola y el correo real; la prueba local no sustituye esa revisión.

Lighthouse ≥90, fotos propias optimizadas, vídeo propio, issues, prompts archivados y releases son evidencias que habrá que medir o completar. No se afirma que estén realizadas.

## Créditos y proceso

Motor, juegos, temas y arranque del proyecto original JOSEMI-OS. Mejoras realizadas con IA a partir de decisiones de Josemi: conservar la web existente, entrada directa al sistema, iconos pixel art, Milo ajolote, quitar la barra superior, compactar el dock y personalizar Secret Vault.

Fondo God of War: [imagen elegida por Josemi](https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg). Recurso externo, no fotografía propia; no acredita derechos de reutilización. Fuentes tipográficas de Google Fonts.

La iteración de iconos, Milo y salvapantallas se trabaja en la rama `iconos-personales-y-terminal-ascii`, con commits separados en castellano y una PR que describe las comprobaciones. El historial previo se conserva.

## Fondos pixel art y señal corrupta

Ajustes → Fondo ofrece diez escenas originales: Matrix azotea, Matrix portal, Minecraft valle, Jetpack laboratorio, Cyberpunk neón, Mario mundo retro, Zelda bosque sagrado, Sonic costa, Hollow Knight cavernas y God of War nórdico. Se dibujan en `drawPixelWallpaper` sobre una rejilla de 480 × 270 mediante SVG de rectángulos; `PIXEL_WALLPAPERS` guarda las miniaturas. No utilizan imágenes extraídas de juegos. El encuadre está centrado, cubre la pantalla y desactiva el parallax; en móvil se recortan los laterales. La elección se guarda en localStorage. Los fondos especiales originales de Secret Vault siguen disponibles.

La Terminal acepta `fondo` seguido de uno de estos nombres: `matrixCity`, `matrixCode`, `minecraft`, `jetpack`, `cyberpunk`, `marioWorld`, `zeldaForest`, `sonicCoast`, `hollowCavern` o `godOfWarPixel`. El comando oculto `infectar` (también `virus`) activa un easter egg: aspecto corrupto, nombres de iconos alterados, biografía ficticia y Milo con una respuesta absurda señalada como simulación. Funciona también en ventanas abiertas después de activarlo. `antivirus`, `restaurar`, Escape o el botón Restaurar sistema recuperan los textos originales. Recargar también lo termina: el estado corrupto no se guarda.

`startCorruption` guarda solo copias de los textos visibles, y `stopCorruption` los restaura y desconecta el observador. No modifica PROFILE, archivos ni contactos, no ejecuta comandos del ordenador y no realiza peticiones de red. Las frases ficticias del chat no entran en el historial que usaría la futura API. El efecto de desplazamiento respeta reducir movimiento y la preferencia del sistema.

Las seis escenas nuevas están en `drawExtraPixelWallpaper`, que reutiliza la misma rejilla, paleta por escena y sistema de miniaturas. Son reinterpretaciones propias inspiradas en juegos, sin copiar recursos gráficos de esos juegos. Las escenas de God of War pixel art y del fondo externo de Secret Vault son opciones diferentes. Los textos y el funcionamiento del modo corrupto se mantienen para que Josemi personalice `CORRUPT_STORIES` por su cuenta.
