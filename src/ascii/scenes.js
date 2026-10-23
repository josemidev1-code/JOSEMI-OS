// src/ascii/scenes.js: fuente de JOSEMI-OS.
const SAVER_LETTERS = {
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};
function saverWord(text) {
  return Array.from({ length: 7 }, (_, row) =>
    [...text]
      .map((letter) =>
        (SAVER_LETTERS[letter] || SAVER_LETTERS[" "])[row].replace(/1/g, "█").replace(/0/g, " "),
      )
      .join(" "),
  );
}
const SAVER_AXOLOTL = [
  "       .--.                   .--.       ",
  "  |\\   |  |   ______________   |  |   /|  ",
  "  | '--'  '--|              |--'  '--' |  ",
  "  '----------|   []    []   |----------'  ",
  "    .--------|      __      |--------.    ",
  "    '--------|______________|--------'    ",
  "               |  MILO  |_____          ",
  "             __|________|    /          ",
  "            |__|        |___/           ",
];
const SAVER_PILLS = [
  "       __________       __________       ",
  "     /::::::::::/|     /........../|      ",
  "    |::: RED :::| |   |:: BLUE ::| |      ",
  "    |::::::::::| /   |..........| /       ",
  "     '---------'/     '---------' /       ",
  "                                         ",
  "              FOLLOW THE WHITE RABBIT     ",
];
const SAVER_AXE = [
  "               .--------.                ",
  "              / /\\/\\/\\/\\ \\               ",
  "         ____| /        \\ |              ",
  "        /    | |    /\\    |              ",
  "        \\____| \\___/  \\__/               ",
  "             |==|                        ",
  "             |==|                        ",
  "             |==|                        ",
  "             |__|                        ",
];
const SAVER_SCENES = [
  {
    name: "Firma del sistema",
    duration: 11000,
    effect: "gather",
    field: "matrix",
    art: () => saverWord("JOSEMI-OS"),
    command: "josemi@os:~$ ./after-hours --fullscreen",
    subtitle: "JOSÉ MIGUEL MIRALLES GANDIA",
    notes: [
      "Inicializando lienzo de caracteres…",
      "Cada píxel tiene código detrás.",
      "Aprender. Construir. Volver a probar.",
    ],
  },
  {
    name: "Señal Matrix",
    duration: 10000,
    effect: "decrypt",
    field: "matrix",
    art: () => saverWord("JOSEMI"),
    command: "josemi@os:~$ wake-up --neo",
    subtitle: "DESPIERTA, JOSEMI. LA MATRIX TE ESTÁ ESPERANDO.",
    notes: [
      "La pantalla no es el límite.",
      "Sigue al conejo blanco.",
      "Hay otra realidad detrás de cada línea.",
    ],
  },
  {
    name: "Órbita ASCII",
    duration: 11000,
    effect: "laser",
    field: "orbit",
    art: () => saverWord("CODE"),
    command: "josemi@os:~$ render --ascii --orbit",
    subtitle: "TODO LO QUE VES TIENE CÓDIGO DETRÁS",
    notes: [
      "Proyectando coordenadas en caracteres…",
      "No es un vídeo: JavaScript dibuja cada fotograma.",
      "Curiosidad + disciplina + ganas de aprender.",
    ],
  },
  {
    name: "Milo ha aparecido",
    duration: 10000,
    effect: "rain",
    field: "matrix",
    art: () => SAVER_AXOLOTL,
    command: "josemi@os:~$ summon milo --axolotl",
    subtitle: "MILO / TU COMPAÑERO DE ESCRITORIO",
    notes: [
      "Un ajolote salvaje ha aparecido.",
      "Inventario: ideas, proyectos y un poco de redstone.",
      "Tip: Milo conoce las aplicaciones del escritorio.",
    ],
  },
  {
    name: "La elección",
    duration: 10000,
    effect: "decrypt",
    field: "matrix",
    art: () => SAVER_PILLS,
    command: "josemi@os:~$ cat /vault/matrix.log",
    subtitle: "¿HASTA DÓNDE LLEGA LA MADRIGUERA?",
    notes: [
      "Secret Vault guarda dos mundos.",
      "Las preguntas tienen algo que ver conmigo.",
      "Una decisión cambia lo que ves.",
    ],
  },
  {
    name: "El guerrero",
    duration: 10000,
    effect: "gather",
    field: "stars",
    art: () => SAVER_AXE,
    command: "josemi@os:~$ inspect /vault/leviathan",
    subtitle: "NO SEAS MEJOR QUE OTROS. SUPÉRATE A TI MISMO.",
    notes: [
      "Disciplina: repetir aunque cueste.",
      "Motivación: recordar por qué empezaste.",
      "God of War dejó una pista en este sistema.",
    ],
  },
  {
    name: "Firma personal",
    duration: 11000,
    effect: "laser",
    field: "matrix",
    art: () => saverWord("JOSEMI"),
    command: "josemi@os:~$ whoami",
    subtitle: "JOSÉ MIGUEL MIRALLES GANDIA / DESARROLLADOR EN PROCESO",
    notes: [
      "DAM · programación · proyectos",
      "Gimnasio. Cine. Ciencia ficción. Lectura.",
      "Lo siguiente todavía está por programar.",
    ],
  },
];
