# Trabajo sobre JOSEMI-OS

- Lee `docs/DESARROLLO.md` antes de cambiar código.
- Edita `src/` y `styles/`. Los JS/CSS de la raíz son salidas generadas; no los modifiques a mano.
- Ejecuta `npm run build` después de cambiar fuentes y `npm run verify` antes de publicar.
- Conserva el orden de `sources.manifest.json`: los scripts clásicos y los grupos privados tienen dependencias compartidas.
- Comprueba en navegador los cambios de interfaz, incluida una pantalla móvil. Conserva los juegos dentro del acceso Arcade, la intro completa en primera visita y Milo sin bocadillos espontáneos.
- Mantén el contrato entre el cliente y el Worker en `src/shared/milo-contract.js`. Nunca publiques credenciales.
- Los commits se escriben en valenciano, con la identidad del usuario y sin añadir coautores de IA.
