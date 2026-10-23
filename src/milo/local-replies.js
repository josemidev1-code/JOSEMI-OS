// src/milo/local-replies.js: fuente de JOSEMI-OS.
function launchPortfolioApp(id) {
  if (!Apps[id]) return;
  if ($("#desktop").classList.contains("hidden")) {
    enteringOS = false;
    enterOS();
    setTimeout(() => openWindow(id), 500);
  } else openWindow(id);
}

/* =========================================================
   MILO / ASISTENTE
   Una sola interfaz para la IA y las respuestas locales de respaldo.
   ========================================================= */
const normalizeQuestion = (text) =>
  String(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
const RAMAS = [
  {
    keys: ["proyecto", "project", "repositorio", "portfolio"],
    text: "Josemi está construyendo JOSEMI-OS y una web del Museu grec. Son proyectos de aprendizaje que puedes explorar en su GitHub.",
    app: "projects",
  },
  {
    keys: ["estudia", "estudias", "estudios", "study", "dam", "instituto", "sobre mi"],
    text: "Josemi estudia DAM en el IES Dr. Lluís Simarro. Está aprendiendo HTML, CSS, JavaScript y Git con proyectos reales.",
    app: "about",
  },
  {
    keys: ["contacto", "correo", "email", "escribir", "contact", "horario", "presupuesto"],
    text: "Puedes escribir a Josemi en josemidev1@gmail.com. Para horarios, oportunidades o presupuestos, consúltale directamente.",
    app: "contact",
  },
  {
    keys: [
      "gusta",
      "aficion",
      "gimnasio",
      "deporte",
      "cine",
      "lectura",
      "god of war",
      "motivacion",
    ],
    text: "Le gusta el gimnasio, hacer deporte, programar, trabajar en proyectos, la ciencia ficción, el cine y leer. Su videojuego favorito es God of War.",
    app: "about",
  },
  {
    keys: ["vault", "secreto", "matrix", "kratos", "morfeo"],
    text: "La Secret Vault tiene dos retos personales: Matrix y God of War. Resuelve sus preguntas y desbloquearás sus fondos.",
    app: "easter",
  },
  {
    keys: ["arcade", "juego", "tetris", "pacman", "buscaminas", "minas"],
    text: "El Arcade tiene Tetris (maratón, sprint y ultra), Pac-Man con cuatro fantasmas y Buscaminas con cuatro dificultades, incluida una a medida. Los récords se guardan en este navegador.",
    app: "arcade",
  },
  {
    keys: ["tiempo", "clima", "temperatura", "weather"],
    text: "Todavía no consulto el tiempo en internet. Puedo ayudarte con los proyectos, aficiones y contacto de Josemi.",
  },
  {
    keys: ["quien eres", "que eres", "creado", "milo", "asistente", "bot"],
    text: "Soy Milo, el asistente de la web de Josemi. Te ayudo a explorar su escritorio. También puedo conversar mediante mi conexión a la IA.",
  },
  {
    keys: ["hola", "hello"],
    text: "¡Hola! Soy Milo. Pregúntame por los estudios, proyectos, aficiones o contacto de Josemi.",
  },
];
function getLocalReply(message) {
  const text = normalizeQuestion(message);
  if (corruptionActive)
    return {
      text:
        "SIMULACIÓN / MILO CORRUPTO: " +
        CORRUPT_STORIES[2] +
        " Pulsa Escape para recuperar los datos reales.",
      simulated: true,
    };
  if (/direccion|dni|telefono|edad|madre|padre|instrucciones|ignora|olvida/.test(text))
    return {
      text: "Solo comparto los datos públicos de este portfolio. Para otras consultas puedes escribir a josemidev1@gmail.com.",
    };
  const best = RAMAS.map((branch) => ({
    ...branch,
    score: branch.keys.filter((key) => text.includes(key)).length,
  })).sort((a, b) => b.score - a.score)[0];
  return best?.score
    ? best
    : {
        text: "No tengo esa información. Puedo contarte sus estudios, proyectos, aficiones o contacto. Si necesitas algo más, escribe a josemidev1@gmail.com.",
      };
}
// La IA comparte la interfaz y el historial del asistente.
// Entrada: mensaje. Salida: {text:'respuesta', app:'id opcional'}.
async function getAssistantReply(message) {
  if (corruptionActive) return getLocalReply(message);
  if (!window.MiloAI) throw new Error("Milo AI no está disponible");
  return window.MiloAI.reply(message, chatHistory);
}
