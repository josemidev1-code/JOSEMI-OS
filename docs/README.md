# JOSEMI-OS

Actualización en casa: consulta [REVISION-ARRANQUE.md](REVISION-ARRANQUE.md) para
las correcciones de la intro y el estado real de las APIs. El contexto de clase
conserva la historia de aquella entrega; no sustituye esta revisión posterior.

Portfolio de José Miguel Miralles Gandia, estudiant de DAM al IES Dr. Lluís Simarro. Escriptori interactiu amb finestres, projectes, terminal, jocs i JOSEMI Music.

**Per continuar a casa, llig primer [CONTEXT-PER-CONTINUAR.txt](CONTEXT-PER-CONTINUAR.txt).**

## Estructura

- `index.html`: estructura i càrrega del frontend.
- `style.css`: tots els estils, en ordre base → shell → experience → music.
- `script.js`: tots els blocs del frontend, delimitats amb BEGIN/END.
- `assets/`: favicon.
- `cloudflare/`: Worker amb Gemini i cerca YouTube; claus exclusivament en secrets de Cloudflare.
- `docs/`: context, instruccions i materials originals d’avaluació.
- `tests/`: proves de comportament i integració simulada.
- `tools/local/`: alternativa opcional de servidor local.

## GitHub Pages i APIs

Segueix [CLOUDFLARE-SETUP.md](CLOUDFLARE-SETUP.md). Configura la URL pública en `script.js`, bloc `BEGIN music-config.js`. No poses claus en els tres fitxers públics. Encara falta desplegar el Worker i provar amb claus reals.

## Proves des de l’arrel

```bash
node --check script.js
node tests/frontend.cjs
node tests/boot.cjs
node tests/shell.cjs
node tests/arcade.cjs
node tests/platformer.cjs
node tests/music.cjs
node tests/worker.mjs
```

Les proves necessiten Node modern (20 o posterior per a fetch en els tests). El servidor local opcional està adaptat per Node 12, però una versió antiga no és adequada per desplegar serveis públics.

## Estudiar el codi

Busca els separadors BEGIN/END en el script: core → upgrade → platformer → shell → music-config → music. El nombre de fitxers s’ha reduït, no el nombre de funcions. Repassa cada bloc: dades que rep, estat que canvia i què mostra.

## Estat

Frontend fusionat revisat a casa i proves de lògica superades. La revisió visual i
les correccions d'arrancada estan documentades en REVISION-ARRANQUE.md. Configuració
pública del Worker, consum real de Gemini/YouTube i Lighthouse encara pendents.
