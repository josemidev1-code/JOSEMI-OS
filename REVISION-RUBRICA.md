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
| Arquitectura documentada | README: separación de archivos, estado local, recursos gráficos y backend sin claves públicas. |
| Interactividad | Ventanas, ajustes persistentes, juegos, notas y Milo con herramientas/API. La defensa exige explicar el recorrido del dato; una función existente no acredita por sí sola esa explicación. |
| Medios | SVG pixel art propios, animaciones y fuentes locales. Falta una demo de vídeo propia y no se ha acreditado fotografía propia. La foto de God of War es material de PlayStation atribuido, no fotografía propia. |
| Lighthouse ≥90 | Pendiente de medición; no se declara cumplido. |
| Proceso excelente | Hay iteraciones y PR; quedan por acreditar releases v1→v2, archivo de instrucciones clave e issues usados como planificación. No se fabrican evidencias retrospectivas. |
| Producción sin errores | Requiere comprobación tras cada despliegue; las pruebas locales no sustituyen a esta comprobación. |

## Qué defender con el proyecto

1. Navegador → Worker → proveedor → JSON → interfaz. Las claves viven en Secrets del Worker, nunca en el frontend.
2. Los ajustes y récords usan localStorage: persisten en ese navegador, no se sincronizan entre dispositivos.
3. Los SVG de bloques mantienen el estilo pixel art y se sirven localmente. El movimiento reducido permite detener las animaciones.
4. Arcade utiliza una moneda como entrada al espacio de juegos; las herramientas útiles y el contacto siguen accesibles directamente.

## Auditorías de código aplicadas

POST con Origin permitido, limitador compartido por IP, fallo cerrado si falta el binding, límites de tiempo en proveedores, health mínimo, errores en castellano, CSP, metadatos sociales y presentación sin JavaScript. También se corrigen gestos cancelados, asignación duplicada del chat, configuración obsoleta de Arcade y migración del fondo de plataformas.

Las listas de aplicaciones y temas ya coincidían; ahora tienen pruebas de contrato. La reorganización completa del CSS y la división de script.js se aplazan por su alcance. El limitador nativo de Cloudflare es aproximado y por ubicación: no es una cuota global estricta ni garantiza un techo de gasto. [Documentación oficial](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/).

Pruebas repetibles: `node --test tests/worker-security.test.mjs` (10 comprobaciones, sin consumir APIs de pago). La revisión de navegador cubre cancelación de arrastre/redimensionado, CSP, migración de preferencias y vistas adaptables. Las llamadas reales a proveedores se verifican tras desplegar.
