# Cómo mantener JOSEMI-OS

El código editable vive en `src/` y `styles/`. Los archivos de la raíz que carga el navegador se generan con un comando; conservan sus rutas públicas para publicar en GitHub Pages y Cloudflare.

## Dónde cambiar cada cosa

| Carpeta | Responsabilidad |
| --- | --- |
| `src/data/` | Perfil, proyectos y datos del usuario |
| `src/core/` | Preferencias locales, almacenamiento seguro y cálculo |
| `src/desktop/` | Ventanas, menús, iconos, temas, búsqueda y barra de tareas |
| `src/boot/` y `src/bootstrap/` | Primera visita, animación y puesta en marcha |
| `src/apps/` | Contenido y eventos de cada aplicación |
| `src/games/` | Utilidades compartidas, Tetris, Pac-Man, Buscaminas y Arcade |
| `src/ascii/` | Dibujado, escenas y salvapantallas |
| `src/wallpapers/` | Paisajes, detalle y animación de fondos |
| `src/shell/`, `src/pixel/`, `src/portfolio/` | Integración y presentación de la interfaz |
| `src/milo/` | Chat, formato seguro de respuestas, acciones y cliente remoto |
| `src/shared/milo-contract.js` | Lista única de aplicaciones y temas permitidos por cliente y Worker |
| `src/worker/` | Configuración, personalidad, validación, proveedores y rutas del servidor |
| `styles/typography.css` | Fuentes y variables tipográficas, definidas en un solo lugar |
| `styles/base/` | Ventanas, escritorio, menús, barra y componentes base |
| `tools/` | Generación reproducible y comprobaciones de mantenimiento |
| `tests/` | Pruebas de seguridad, contrato, generación, almacenamiento y cálculo |

## Flujo de trabajo

Con Node 22 o superior:

```text
npm ci
npm run format
npm run build
npm run verify
```

1. Edita una fuente, no su salida generada en la raíz.
2. `build` lee `sources.manifest.json`, conserva el orden de dependencias y genera los mismos archivos que carga `index.html`.
3. El proceso calcula una huella del contenido para cada JS/CSS y actualiza automáticamente su `?v=`. Ya no hay que inventar ni recordar números de caché.
4. `verify` detecta salidas desactualizadas, fuentes sin registrar, errores de sintaxis, recursos ausentes y fallos de las pruebas. También comprueba el formato.
5. Prueba el comportamiento en navegador y publica las fuentes junto con los archivos generados. GitHub Pages puede servirlos directamente, sin instalar Node en producción. Wrangler sigue utilizando `worker.js`.

## Ámbitos y dependencias

La interfaz utiliza scripts clásicos y algunas funciones públicas compartidas (`Apps`, `WM`, `openWindow`, `PixelOS`). El manifiesto declara su orden. Los grupos `scope: "private"` se generan dentro de una función cerrada: sus variables auxiliares no pasan al ámbito global. Las fuentes de un grupo comparten ese ámbito y no son módulos ES independientes.

La generación no vuelve a interpretar entradas del visitante ni introduce `eval`. Solo une fuentes locales registradas, valida la sintaxis y da formato. Los proveedores y las rutas del Worker permanecen aislados en su propia salida.

Esta organización permite localizar y revisar cada responsabilidad conservando la compatibilidad del motor actual. No elimina todas las dependencias históricas ni equivale a reescribir la aplicación con un framework. Las reglas CSS mantienen su orden de cascada para evitar cambios visuales involuntarios.

## Convenciones

- Los recursos publicados llevan el aviso `GENERADO`. Regenerarlos es obligatorio después de cambiar una fuente.
- El perfil se define en `src/data/profile.js`. Las listas permitidas de Milo se editan solo en `src/shared/milo-contract.js`.
- `OSStorage` centraliza lecturas y escrituras tolerantes a datos incompletos o almacenamiento bloqueado.
- Cada juego y aplicación limpia temporizadores y eventos al cerrar su ventana.
- No se incluyen claves de APIs, documentos privados ni datos sensibles en las fuentes. Las claves del Worker siguen en Secrets de Cloudflare.
- La primera visita conserva la intro completa; las siguientes permiten saltarla. Milo responde dentro del chat y no muestra mensajes espontáneos en el escritorio.

## Qué se comprobó en esta reorganización

Antes del cambio de fuente, los nueve archivos JavaScript generados conservaron la estructura ejecutable de sus versiones originales, normalizando únicamente la forma de escribir las claves de objetos. Las 25 aplicaciones conservaron contenido, controles y tamaños en la comparación previa a la tipografía. Después se eliminaron duplicaciones concretas y se añadieron pruebas del almacenamiento, cálculo y generación. La tipografía se valida visualmente aparte porque cambia las métricas del texto.
