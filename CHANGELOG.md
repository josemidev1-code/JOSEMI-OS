# Evolución de JOSEMI-OS

Los hitos v1.0.0 y v2.0.0 identifican dos estados reales del historial. Se etiquetan el 23 de octubre de 2026 para facilitar la comparación; no se alteran las fechas de los commits ni se inventa un desarrollo anterior.

## v3.0.0 · Projectes reals i univers pixel (18 de novembre de 2026)

- Proyectos: siete casos reales (JOSEMI-OS, SparkTune, DragonBall Survivor, The Fog, System Plast, la web de Nuria Cerdá y Museu grec) con reto, solución, resultado, datos y enlaces. Sustituyen a los huecos de «roadmap».
- Widget en directo con la API pública de GitHub: repos públicos, lenguajes más usados y último cambio de cada proyecto, con caché de 10 minutos y aviso si falla.
- Tipografía pixel art en toda la interfaz: Pixelify Sans y VT323; JetBrains Mono solo para el arte ASCII.
- Sistema único de iconos en `src/core/pixel-icons.js`: 26 iconos redibujados con paleta cerrada, contorno y luz coherente; favicon generado con el mismo mapa.
- Intro saltable también en la primera visita.
- Milo conoce los siete proyectos (respuestas locales y personalidad del Worker).
- Rendimiento: scripts con `defer` para no bloquear la primera pintura. En móvil, el contenido de las ventanas deja sitio a Milo.

## v2.0.0 · Entrega documentada

- PR #14: protección de Milo, tiempos máximos, health mínimo, CSP, gestos cancelados y presentación de los seis bloques personales en Inicio.
- PR #15: identidad visible durante el arranque, contraste legible, fuentes WOFF2, métricas del proyecto y demo accesible de 30 segundos.
- Guía de defensa, dos ADR y extractos de instrucciones clave vinculados a sus cambios.
- Informes reales de producción: Lighthouse móvil 96/100/100/100 y escritorio 97/100/100/100; ventanas revisadas con accesibilidad 100.
- Pendientes explícitos: fotografía personal y defensa oral; la refactorización amplia del CSS y script.js queda fuera de esta entrega.

## v1.0.0 · Escritorio coherente

Referencia: `00c41381b79f2906e23cdb040c7f5a5316fe6984`, PR #13.

- Seis accesos esenciales y ajustes en el dock.
- Entrada a juegos a través de Arcade y su moneda.
- Milo pixel art y brillo ajustado a su silueta.
- Paisajes con su propia animación y control de flechas de Pac-Man.

No se afirma que v1 fuera la primera versión de la web: es el hito anterior elegido para mostrar mejoras trazables frente a v2.
