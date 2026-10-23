// src/desktop/icons.js: fuente de JOSEMI-OS.
const ICON_PATHS = {
  readme:
    '<path d="M13 8h23l9 9v34H13z" fill="#dfe5d6"/><path d="M36 8v10h9M20 26h18M20 33h18M20 40h11"/>',
  about:
    '<rect x="8" y="11" width="48" height="40" rx="5" fill="#b9d3bc"/><circle cx="23" cy="27" r="7" fill="#edf0de"/><path d="M13 43q10-16 20 0M38 25h10M38 33h10M38 41h7"/>',
  projects:
    '<path d="M7 17h19l5 6h26v29H7z" fill="#d9a555"/><path d="M7 29l6-5h45l-5 28H7z" fill="#f3c778"/>',
  skills: '<path d="M34 6L12 34h17l-3 24 25-33H34z" fill="#edc16c"/>',
  terminal:
    '<rect x="7" y="10" width="50" height="43" rx="5" fill="#213a36"/><path d="M7 21h50M17 30l8 7-8 7M31 44h14" stroke="#adf0b7"/><circle cx="14" cy="16" r="1" fill="#ffd080"/>',
  contact:
    '<rect x="7" y="15" width="50" height="35" rx="4" fill="#a9c6dd"/><path d="M8 17l24 19 24-19M8 49l17-17M56 49L39 32"/>',
  arcade:
    '<path d="M18 8h30l-2 23 8 21H10l8-21z" fill="#bda9d5"/><rect x="23" y="14" width="20" height="15" rx="2" fill="#203032"/><path d="M22 42h10M27 37v10"/><circle cx="41" cy="41" r="3" fill="#e6aa64"/>',
  settings:
    '<path d="M27 7h10l2 8 7 3 8-2 5 9-6 6v8l6 5-5 9-8-2-7 4-2 7H27l-2-7-7-4-8 2-5-9 6-5v-8l-6-6 5-9 8 2 7-3z" fill="#a7b9c3"/><circle cx="32" cy="34" r="10" fill="#e8eadc"/>',
  system:
    '<rect x="6" y="10" width="52" height="35" rx="4" fill="#aec9bc"/><rect x="11" y="15" width="42" height="25" fill="#243b39"/><path d="M17 32h6l4-9 7 13 5-8h9M27 45v9M37 45v9M20 55h24" stroke="#9adeaa"/>',
  trash:
    '<path d="M17 19h30l-3 35H20z" fill="#9fb2b5"/><path d="M13 19h38M25 11h14v8M26 26v20M37 26v20"/>',
  easter:
    '<rect x="10" y="24" width="44" height="31" rx="4" fill="#d4b073"/><path d="M21 24v-8a11 11 0 0122 0v8" fill="none"/><circle cx="32" cy="38" r="4" fill="#263733"/><path d="M32 42v6"/>',
  screensaver:
    '<rect x="7" y="10" width="50" height="36" rx="4" fill="#aac7d3"/><path d="M17 23l6 5-6 5M30 34h15M27 46v8M37 46v8M21 55h22"/>',
  pacman:
    '<path d="M48 17A23 23 0 1048 47L32 32z" fill="#efcb64"/><circle cx="31" cy="18" r="3" fill="#29312f"/>',
  tetris:
    '<path d="M12 12h14v14h14V12h14v28H40v14H26V40H12z" fill="#c1a4d9"/><path d="M12 26h42M26 26v14M40 26v14"/>',
};
function osIcon(id) {
  return `<svg class="os-icon os-icon--${id}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke="#293934" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">${ICON_PATHS[id] || ICON_PATHS.projects}</g></svg>`;
}
for (const id of Object.keys(ICON_PATHS)) if (Apps[id]) Apps[id].icon = osIcon(id);
