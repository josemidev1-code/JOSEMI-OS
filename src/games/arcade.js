// src/games/arcade.js: fuente de JOSEMI-OS.
const ARCADE_GAMES = [
  [
    "tetris",
    "▟",
    "3 MODOS · SRS",
    "Tetris",
    "Maratón, Sprint 40 y Ultra. Pieza guardada, cinco siguientes, T-spins, combos y back-to-back.",
    "← → · ↑ · Espacio · C",
  ],
  [
    "pacman",
    "●",
    "4 FANTASMAS",
    "Pac-Man",
    "Laberinto propio, cuatro fantasmas con personalidad, frutas, túnel y niveles cada vez más rápidos.",
    "Flechas · P pausa",
  ],
  [
    "minesweeper",
    "✱",
    "4 DIFICULTADES",
    "Buscaminas",
    "Fácil, medio, difícil o a medida. Primer clic seguro, acordes, pistas por deducción y estadísticas.",
    "Clic · Clic derecho · F",
  ],
];
Apps.arcade.size = [960, 660];
Apps.arcade.render = () =>
  `<div class="arcade-heading"><div><span class="card-kicker">JOSEMI / ARCADE COLLECTION</span><h2>Una partida más.</h2><p>Tres clásicos reconstruidos desde cero dentro del sistema.</p></div><span class="arcade-badge">INSERT COIN<br>FREE PLAY</span></div><div class="arcade-grid arcade-grid--v2">${ARCADE_GAMES.map(
    ([id, mark, kicker, title, desc, keys]) =>
      `<button class="game-shortcut game-card game-card--${id}" data-game="${id}"><span class="game-card__number">${mark}</span><span class="card-kicker">${kicker}</span><strong>${title}</strong><p>${desc}</p><small>${keys}</small><span class="game-card__bottom">JUGAR ↗ <span>RÉCORD ${id === "minesweeper" ? msBestLabel() : bestScore(id)}</span></span></button>`,
  ).join(
    "",
  )}</div><p class="arcade-footnote">Las partidas se pausan al cambiar de ventana o pestaña. Haz clic en el juego para recuperar el teclado. El sonido del arcade se activa o desactiva desde cada juego.</p>`;
