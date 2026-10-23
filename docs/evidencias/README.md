# Evidencias de la entrega · 23 de octubre de 2026

Web auditada: **https://josemidev1.site/**. Código de la interfaz auditada: `eb7ff3185ab1165f25f3e70fc5eeb6ce0fd78924` (PR #15). La incorporación posterior de estos documentos no cambia la interfaz medida.

## Lighthouse en producción

Lighthouse **13.5.0**, Chrome instalado, modo headless, perfil móvil predeterminado y perfil `desktop`, con la simulación de red y CPU propia de cada perfil. No se desactiva la limitación de red para mejorar la puntuación.

| Categoría | Móvil | Escritorio |
| --- | ---: | ---: |
| Rendimiento | 96 | 97 |
| Accesibilidad | 100 | 100 |
| Buenas prácticas | 100 | 100 |
| SEO | 100 | 100 |

[Informe móvil](lighthouse-movil.html) · [Informe escritorio](lighthouse-escritorio.html) · [Resumen y métricas](resumen.json). Los JSON originales se conservan junto a los informes. Fechas UTC: 11:27 y 11:28 del 23/10/2026. Una medición fluctúa con la red y la máquina; no es una nota de Edu ni garantiza accesibilidad completa.

Estas mediciones comprueban la carga inicial, incluido el arranque. Para evitar dar por accesibles ventanas todavía ocultas, también se utiliza el modo snapshot de Lighthouse después de abrirlas.

## Ventanas después de interactuar

[Informe de ventanas en producción](accesibilidad-ventanas.html) · [Informe del reproductor y ficha del proyecto](accesibilidad-demo.html).

| Estado | Antes, en producción | Después, en producción |
| --- | ---: | ---: |
| Inicio | 95 | 100 |
| Proyectos | 95 | 100 |
| Ajustes | 96 | 100 |
| Contacto | 95 | 100 |
| Milo abierto sobre Contacto | 96 | 100 |
| Ficha JOSEMI-OS con vídeo | No medido antes | 100 |

El antes corresponde a la versión previa, `0420a07`, y se conserva en `accesibilidad-antes.json`. El fallo encontrado era el contraste insuficiente de la fecha y los textos secundarios de proyectos y contacto. Se sustituyeron colores fijos por el color secundario de la paleta activa.

Snapshots con ventana 1440×900, tema inicial y sin cambiar la simulación de pantalla durante el recorrido. No representan todas las combinaciones de temas ni una revisión manual con lector de pantalla. Un snapshot no tiene puntuación de rendimiento y no se presenta como si la tuviera.

## Demo y adaptación

[Verificación de la demo publicada](demo-verificacion.json): 30 segundos, 1280×720, H.264, 1.155.953 bytes. Se comprobó reproducción completa, saltos, subtítulos, disponibilidad de la descripción escrita, pausa al minimizar y tamaños 320/390/768. Abrir la ficha no solicita el MP4 gracias a `preload="none"`. No hubo errores de JavaScript ni infracciones CSP en ese recorrido.

En la revisión local general también se comprobaron las 25 aplicaciones y 18 combinaciones de pantalla (Inicio, Pac-Man y Ajustes en seis tamaños). Estos controles son pruebas de comportamiento, no una puntuación adicional de Lighthouse.

## Repetir la medición

Con Node compatible y Chrome instalados, desde una carpeta de trabajo:

```powershell
npx --yes lighthouse@13.5.0 https://josemidev1.site/ --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=./lighthouse-movil
npx --yes lighthouse@13.5.0 https://josemidev1.site/ --preset=desktop --chrome-flags="--headless" --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=./lighthouse-escritorio
```

Para una comprobación sin instalar herramientas, abre F12 → Lighthouse → analiza móvil y escritorio. Para las ventanas, entra al escritorio y utiliza el modo Snapshot tras abrir cada aplicación. [Documentación oficial sobre recorridos de Lighthouse](https://github.com/GoogleChrome/lighthouse/blob/main/docs/user-flows.md).

El servidor local de desarrollo no comprime los archivos como GitHub Pages: sus resultados de rendimiento no se mezclan con los de producción. El objetivo ≥90 se acredita aquí con la URL pública.
