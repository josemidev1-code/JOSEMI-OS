// src/worker/tools.js: fuente de JOSEMI-OS.
const tool = (name, description, properties, required) => ({
  type: "function",
  function: { name, description, parameters: { type: "object", properties, required } },
});

// Mantener las listas de open_app y set_theme sincronizadas con milo-ai.js (prueba automatizada).
const TOOLS = [
  tool(
    "web_search",
    "Busca información actual en Internet, con URLs de fuentes.",
    {
      query: { type: "string", description: "Consulta corta de búsqueda" },
    },
    ["query"],
  ),
  tool(
    "get_weather",
    "Consulta el tiempo ACTUAL en una ciudad mediante Open-Meteo.",
    {
      city: {
        type: "string",
        description: "Ciudad, opcionalmente con país (ej.: València, España)",
      },
    },
    ["city"],
  ),
  tool(
    "play_music",
    "Busca canciones con la API de iTunes y ofrece previews de 30 segundos.",
    {
      query: { type: "string" },
    },
    ["query"],
  ),
  tool(
    "open_app",
    "Abre una aplicación del escritorio de JOSEMI-OS.",
    {
      app: {
        type: "string",
        enum: MILO_APP_IDS,
      },
    },
    ["app"],
  ),
  tool(
    "set_theme",
    "Cambia el tema del escritorio.",
    {
      theme: {
        type: "string",
        enum: MILO_THEME_IDS,
      },
    },
    ["theme"],
  ),
  tool(
    "system_action",
    "Controla solamente JOSEMI-OS, la web: abre/cierra/minimiza/maximiza apps, cambia el fondo, tema, cursor, sonido o movimiento, toma una nota, calcula o inicia un temporizador. No controla el ordenador real. Valores: id de app para open/close/minimize/maximize; id de fondo para wallpaper; tema para theme; puntero para cursor; on/off para sound o motion; id de efecto para atmosphere; texto para note; operación aritmética para calculate; minutos entre 1 y 180 para timer. Si no conoces un id de fondo o puntero, abre gallery o settings en vez de inventarlo.",
    {
      action: {
        type: "string",
        enum: [
          "open",
          "close",
          "minimize",
          "maximize",
          "wallpaper",
          "theme",
          "cursor",
          "sound",
          "motion",
          "atmosphere",
          "note",
          "calculate",
          "timer",
        ],
      },
      value: { type: "string" },
    },
    ["action", "value"],
  ),
];
