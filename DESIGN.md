# JOSEMI-OS / disseny del sistema

## Referències investigades

- [Omarchy: salvapantalles](https://github.com/basecamp/omarchy/blob/master/bin/omarchy-screensaver). La versió consultada executa `ttfx` sobre `screensaver.txt`, centra el llenç i el text, i alterna efectes. Ix quan rep una entrada o perd el focus.
- [ttfx](https://github.com/omacom/ttfx). Port a Rust de [TerminalTextEffects](https://github.com/ChrisBuilds/terminaltexteffects): cada caràcter té una posició, moviment i animació. Inclou efectes com beams, rain, scattered i decrypt.
- [PostHog](https://posthog.com/) i el seu [repositori oficial](https://github.com/PostHog/posthog.com). Referència visual per a un espai navegable amb icones laterals, finestres i una identitat il·lustrada.

La implementació web és original: no importa el motor de ttfx ni copia els recursos de PostHog. Les icones SVG formen una família pròpia.

## Què incorpora

- Escritori amb icones il·lustrades als laterals i benvinguda central.
- Quatre ambients: terminal nocturna, estudi de paper, òrbita violeta i oceà profund.
- Cinc cursores: sistema, píxel, terminal, mira i fletxa clara. Tres mides. Sense cercle ni rastre.
- Tres animacions del nom: barrida de llum, pluja de caràcters i convergència. També selecció aleatòria.
- ASCII Studio per a provar els efectes i salvapantalles manual o després d'inactivitat.
- Cerca d'aplicacions amb Ctrl+K, fletxes i Enter, incloent-hi els jocs.
- Entrada escalonada d'icones, inclinació suau, entrada i eixida de finestres, minimització cap a la barra i expansió amb interpolació.
- Intensitat suau o expressiva, moviment reduït, textura i sons configurables.
- Preferències guardades en el navegador. Els jocs continuen pausant-se quan perden el focus.

## Validació

`node tests/arcade.cjs` comprova la lògica dels tres jocs i la neteja dels seus bucles.

`node tests/shell.cjs` comprova les tres animacions, dimensions del llenç, resultat final, duració independent de la freqüència de pantalla, cancel·lació, finestres desconnectades i moviment reduït.

La revisió visual en navegador comprova l'escriptori, el tema clar, els ajustos, la persistència, ASCII Studio, la cerca i una partida de Pac-Man amb minimització i restauració. També es comprova el disseny a 390 px.
