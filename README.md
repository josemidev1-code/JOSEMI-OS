# JOSEMI-OS

Portfolio de José Miguel Miralles Gandia, estudiante de DAM. La presentación explica quién soy, mis proyectos, aficiones y contacto; después se puede entrar al escritorio con su arranque Matrix, aplicaciones y juegos originales.

[Web en GitHub Pages](https://josemidev1-code.github.io/JOSEMI-OS/) · [Mi GitHub](https://github.com/josemidev1-code) · [Contacto](mailto:josemidev1@gmail.com)

## Archivos

La web funciona con **tres archivos**, sin instalar paquetes ni compilar:

- `index.html`: presentación, arranque, escritorio, menú y zonas donde se muestran las ventanas.
- `style.css`: colores, tipografías, interfaz, fondos, iconos, chat y adaptación al móvil.
- `script.js`: datos personales, motor de ventanas, aplicaciones, juegos, preferencias, Secret Vault y Milo.

`.gitignore`, `.nojekyll` y este README son apoyo del repositorio. El PDF de clase está excluido y se queda en la copia del Escritorio. Los recursos gráficos propios y el favicon están integrados; el fondo externo de God of War se solicita al activarlo.

## Qué funciona

Se conserva el arranque Matrix, las ventanas que se pueden mover/minimizar/cerrar, la búsqueda, los ajustes, ASCII Studio, Tetris, Pac-Man y JOSEMI Run. Se añade una presentación previa, una familia de iconos pixel art, un dock compacto y Milo. La barra superior se ha retirado.

Secret Vault tiene dos preguntas personales, pistas y respuestas normalizadas: **Morfeo** desbloquea Matrix verde y cian; **God of War** desbloquea el fondo elegido. Las llaves y preferencias se guardan en `localStorage`. Es un juego público: no sirve para proteger datos privados.

Milo usa respuestas locales escritas en `RAMAS`. **Todavía no está conectado a una IA ni a una API meteorológica.** No inventa el tiempo. La integración se hará manualmente en clase.

## Puntos para editar en clase

En `script.js`, busca `DATOS PERSONALES`, `MILO / ASISTENTE` y `PUNTO DE CONEXIÓN DE APIS`:

- `PROFILE` / `PROJECTS`: información y proyectos; los textos de la presentación también están en el HTML.
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

Se ha probado en Edge: presentación inicial, arranque y entrada directa, aplicaciones, minimización, los tres juegos, Vault (aciertos, fallos, pistas y persistencia), Milo y adaptación a 320/390 px. Sin errores de JavaScript en esas pruebas. Antes de entregar hay que comprobar **la URL publicada**, su consola y el correo real; la prueba local no sustituye esa revisión.

Lighthouse ≥90, fotos propias optimizadas, vídeo propio, issues, prompts archivados y releases son evidencias que habrá que medir o completar. No se afirma que estén realizadas.

## Créditos y proceso

Motor, juegos, temas y arranque del proyecto original JOSEMI-OS. Mejoras realizadas con IA a partir de decisiones de Josemi: conservar la web existente, presentación antes del escritorio, iconos pixel art, Milo coral, quitar la barra superior, compactar el dock y personalizar Secret Vault.

Fondo God of War: [imagen elegida por Josemi](https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg). Recurso externo, no fotografía propia; no acredita derechos de reutilización. Fuentes tipográficas de Google Fonts.

Los cambios se guardan en la rama `mejoras-sobre-web-actual`, con mensajes en castellano y una PR que describe las comprobaciones. El historial previo se conserva.
