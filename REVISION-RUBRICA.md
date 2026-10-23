# Revisión de la entrega · 23 de octubre de 2026

Revisión basada en la anatomía de marca personal y los cuatro tutoriales facilitados por Josemi. No sustituye a la rúbrica completa ni permite asignar una nota final.

| Requisito | Evidencia / estado |
| --- | --- |
| Nombre, definición y llamada a la acción | Inicio: nombre, estudiante de DAM, proyectos y contacto directo. |
| Sobre mí | Inicio y ventana Sobre mí: origen de la motivación, estudios y aprendizaje en primera persona. |
| Hechos y proyectos | JOSEMI-OS explica reto, solución y resultado observable. Museu grec enlaza al repositorio de formación. DAM y el roadmap se identifican como formación y exploración. No se inventan clientes, métricas ni proyectos terminados. |
| Aficiones | Seis intereses confirmados, visibles en Inicio. |
| Contacto | Correo, GitHub y LinkedIn accesibles directamente desde Inicio. |
| Pie | Nombre, año automático y «De jugar a construir». |
| Git | 76 commits en origin/main antes de esta revisión, tras recuperar el historial completo. Hay ramas y PR previas; el número por sí solo no acredita que todos los commits sean atómicos. |
| Arquitectura documentada | README y dos ADR con situación, decisión y consecuencias: web estática + Worker, y estado local. |
| Interactividad | Ventanas, ajustes persistentes, juegos, notas y Milo con herramientas/API. Hay guía de defensa con un recorrido del dato real; Josemi todavía debe practicar y demostrar que puede explicarlo. |
| Medios | SVG pixel art propios, animaciones, fuentes locales WOFF2 y demo real MP4 de 30 segundos con póster, subtítulos y descripción. Falta acreditar fotografía propia; la foto de God of War es material atribuido de PlayStation. |
| Lighthouse ≥90 | Verificado en producción el 23/10/2026: rendimiento móvil 96 y escritorio 97; accesibilidad, buenas prácticas y SEO 100. Los informes y su contexto están en docs/evidencias. |
| Proceso | Historial, ramas y PR #13–#15, extractos de instrucciones archivados y dos hitos de versión documentados en CHANGELOG. No se fabrica una planificación anterior mediante issues creados después del trabajo. |
| Producción sin errores | Verificadas las ventanas y la demo publicadas, sin errores de JavaScript ni CSP en los recorridos probados. Repetir después de nuevos cambios. |

## Qué defender con el proyecto

1. Navegador → Worker → proveedor → JSON → interfaz. Las claves viven en Secrets del Worker, nunca en el frontend.
2. Los ajustes y récords usan localStorage: persisten en ese navegador, no se sincronizan entre dispositivos.
3. Los SVG de bloques mantienen el estilo pixel art y se sirven localmente. El movimiento reducido permite detener las animaciones.
4. Arcade utiliza una moneda como entrada al espacio de juegos; las herramientas útiles y el contacto siguen accesibles directamente.

## Auditorías de código aplicadas

POST con Origin permitido, limitador compartido por IP, fallo cerrado si falta el binding, límites de tiempo en proveedores, health mínimo, errores en castellano, CSP, metadatos sociales y presentación sin JavaScript. También se corrigen gestos cancelados, asignación duplicada del chat, configuración obsoleta de Arcade y migración del fondo de plataformas.

Las listas de aplicaciones y temas ya coincidían; ahora tienen pruebas de contrato. La reorganización completa del CSS y la división de script.js se aplazan por su alcance. El limitador nativo de Cloudflare es aproximado y por ubicación: no es una cuota global estricta ni garantiza un techo de gasto. [Documentación oficial](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Pruebas repetibles: `node --test tests/worker-security.test.mjs` (10 comprobaciones, sin consumir APIs de pago). La revisión de navegador cubre cancelación de arrastre/redimensionado, CSP, migración de preferencias y vistas adaptables. Las llamadas reales a chat, búsqueda y tiempo se verificaron tras desplegar la auditoría. La revisión de entrega comprueba 25 aplicaciones y 18 combinaciones de pantalla; la demo pública se reprodujo completa y se comprobó a 320, 390 y 768 píxeles.

## Qué falta para cerrar la entrega

1. Una fotografía personal o del espacio de trabajo que Josemi decida publicar y que tenga derecho a usar. Las capturas y el vídeo no se presentan como fotografía personal.
2. Practicar la defensa y explicar el recorrido de una petición real en F12. La guía no acredita por sí sola ese conocimiento.
3. La tabla completa de evaluación de Edu, si contiene requisitos que no estén en los tutoriales facilitados. No se asigna una nota oficial ni se da por cumplido un descriptor no disponible.

Actualización de mantenimiento: las fuentes se han separado por responsabilidad en `src/` y `styles/`, con generación reproducible, caché automática y comprobaciones. Los archivos públicos conservan sus rutas; el CSS mantiene su orden de cascada y la interfaz conserva los ámbitos compartidos de su motor clásico. El mapa y las limitaciones están en `docs/DESARROLLO.md`. Los resultados Lighthouse anteriores corresponden al commit indicado en cada informe, no a todas las versiones posteriores. Los resultados automáticos no sustituyen una revisión manual completa de accesibilidad.
