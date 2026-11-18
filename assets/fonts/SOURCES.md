# Fuentes tipográficas

## Fuentes activas

- **Pixelify Sans**: interfaz, títulos y texto. Fuente pixel art con pesos de 400 a 700. Licencia: `OFL-Pixelify-Sans.txt`.
- **VT323**: terminal, etiquetas, datos y código. Se declara con `size-adjust: 120%` porque sus glifos son más pequeños que los de una monoespaciada normal. Licencia: `OFL-VT323.txt`.
- **JetBrains Mono**: solo para el arte ASCII (salvapantallas, fondos ASCII y puerta de Secret Vault), que necesita una rejilla de caracteres exacta. WOFF2 original del [repositorio de JetBrains](https://github.com/JetBrains/JetBrainsMono/tree/master/fonts/webfonts). Licencia: `OFL-JetBrains-Mono.txt`.

Se sirven desde esta carpeta, sin peticiones a servicios de fuentes externos. Las variables (`--font-ui`, `--font-display`, `--font-mono` y `--font-ascii`) y las declaraciones están centralizadas en `styles/typography.css`. Las ligaduras se desactivan en código y ASCII para conservar la distinción de caracteres.

## Versiones anteriores

Atkinson Hyperlegible Next (`atkinson-next.*`, licencia `OFL-Atkinson-Next.txt`) se usó en la interfaz entre el 23 de octubre y el 18 de noviembre de 2026. Se conserva como recurso histórico; la interfaz vuelve a la estética pixel art.
