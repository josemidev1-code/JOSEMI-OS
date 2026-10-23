// src/milo/panel.js: fuente de JOSEMI-OS.
const MILO_SVG = `<svg class="mascot-svg" viewBox="0 0 48 40" shape-rendering="crispEdges" aria-hidden="true">
  <g class="axolotl-tail"><path fill="#bd607c" d="M32 27h8v-3h4v9H32z"/><path fill="#f4abc2" d="M34 28h8v-3h2v6H34z"/></g>
  <path fill="#a34b68" d="M15 28h20v7H15zM14 33h7v4h-7zM28 33h7v4h-7z"/>
  <path fill="#efabc1" d="M16 28h17v5H16zM15 33h5v2h-5zM29 33h5v2h-5z"/>
  <path fill="#ffcfdb" d="M19 29h11v3H19zM16 33h2v1h-2zM30 33h2v1h-2z"/>
  <g class="axolotl-gills">
    <path fill="#b75576" d="M9 9H5V4H2v8h7v3H3v3H1v3h8v3H4v3h7V9zM39 9h4V4h3v8h-7v3h6v3h2v3h-8v3h5v3h-7V9z"/>
    <path fill="#ed7ca5" d="M8 10H4V5H2v6h6v5H3v3H1v2h8v4H5v2h6V10zM40 10h4V5h2v6h-6v5h5v3h2v2h-8v4h4v2h-6V10z"/>
    <path fill="#ffc0d2" d="M2 5h1v4H2zM2 18h4v1H2zM5 25h3v1H5zM45 5h1v4h-1zM42 18h4v1h-4zM40 25h3v1h-3z"/>
  </g>
  <path fill="#ba6d86" d="M12 8h24v2h3v18h-3v2H12v-2H9V10h3z"/>
  <path fill="#f6b4cb" d="M12 10h24v2h2v14h-2v2H12v-2h-2V12h2z"/>
  <path fill="#ffd1dd" d="M13 10h22v3H13zM11 13h4v10h-4zM15 14h18v10H15z"/>
  <path fill="#e999b6" d="M34 13h3v13h-3zM14 26h20v2H14zM16 12h3v1h-3zM27 12h4v1h-4z"/>
  <g class="milo-base-eyes"><path fill="#412f40" d="M15 17h3v3h-3zM30 17h3v3h-3z"/>
  <path fill="#fff3e9" d="M15 17h1v1h-1zM30 17h1v1h-1z"/></g>
  <path fill="#ec8ead" d="M12 21h5v2h-5zM31 21h5v2h-5z"/>
  <path fill="#a95e7a" d="M22 22h4v1h-4z"/>
</svg>`;

const mascot = document.createElement("button");
mascot.id = "mascot-button";
mascot.type = "button";
mascot.setAttribute("aria-label", "Hablar con Milo, el asistente");
mascot.setAttribute("aria-expanded", "false");
mascot.setAttribute("aria-controls", "mascot-chat");
mascot.innerHTML = MILO_SVG + '<span class="milo-label">Milo</span>';
const panel = document.createElement("section");
panel.id = "mascot-chat";
panel.hidden = true;
panel.setAttribute("role", "dialog");
panel.setAttribute("aria-label", "Milo, asistente de Josemi");
panel.innerHTML =
  '<div class="mascot-head"><div><strong>Milo</strong><small>Tu ajolote de escritorio</small></div><button id="mascot-close" aria-label="Cerrar asistente">×</button></div><div id="mascot-log" class="mascot-log" role="log" aria-live="polite"></div><form id="mascot-form" class="mascot-form"><label class="sr-only" for="mascot-input">Mensaje para Milo</label><input id="mascot-input" maxlength="500" placeholder="Estudios, proyectos, aficiones…" autocomplete="off" required><button class="btn" type="submit">Enviar</button></form><div class="mascot-results"></div><small class="milo-mode">ASISTENTE CON IA</small>';
document.body.append(mascot, panel);
let chatBusy = false;
const chatHistory = [];
function addChatMessage(text, role) {
  const log = $("#mascot-log");
  const line = document.createElement(role === "assistant" ? "div" : "p");
  line.className = "chat-message " + role;
  line.textContent = text;
  log.append(line);
  while (log.children.length > 30) log.firstElementChild.remove();
  log.scrollTop = log.scrollHeight;
  return line;
}
function toggleMilo(show) {
  panel.hidden = !show;
  mascot.setAttribute("aria-expanded", String(show));
  if (show) $("#mascot-input").focus();
  else mascot.focus();
}
// sendChat gestiona espera y error. Un corte de 20 s evita dejar el chat bloqueado.
async function sendChat(message) {
  const text = message.trim().slice(0, 500);
  if (!text || chatBusy) return;
  chatBusy = true;
  const submit = $("#mascot-form button");
  submit.disabled = true;
  $("#mascot-input").value = "";
  addChatMessage(text, "user");
  const pending = addChatMessage("Milo está escribiendo…", "assistant");
  let timer;
  try {
    const response = await Promise.race([
      getAssistantReply(text),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Tiempo agotado")), 32000);
      }),
    ]);
    if (!response || typeof response.text !== "string") throw new Error("Respuesta no válida");
    if (response.simulated) pending.textContent = response.text.slice(0, 3000);
    else if (window.MiloRender) window.MiloRender.render(pending, response.text.slice(0, 3000));
    else pending.textContent = response.text.slice(0, 3000);
    if (response.simulated) pending.classList.add("corrupt-reply");
    if (!response.simulated)
      chatHistory.push(
        { role: "user", content: text },
        { role: "assistant", content: response.text.slice(0, 3000) },
      );
    if (chatHistory.length > 12) chatHistory.splice(0, chatHistory.length - 12);
    if (response.app && Apps[response.app]) {
      const button = document.createElement("button");
      button.className = "btn milo-launch";
      button.textContent = "ABRIR " + Apps[response.app].title.toUpperCase() + " ↗";
      button.onclick = () => {
        toggleMilo(false);
        launchPortfolioApp(response.app);
      };
      pending.append(button);
    }
  } catch (error) {
    pending.textContent =
      "No he podido conectar con la IA (" +
      (error?.message || "error de red") +
      "). " +
      getLocalReply(text).text;
    console.warn("[MiloAI]", error);
  } finally {
    clearTimeout(timer);
    chatBusy = false;
    submit.disabled = false;
    $("#mascot-log").scrollTop = $("#mascot-log").scrollHeight;
  }
}
mascot.onclick = () => toggleMilo(panel.hidden);
$("#mascot-close").onclick = () => toggleMilo(false);
$("#mascot-form").onsubmit = (event) => {
  event.preventDefault();
  sendChat($("#mascot-input").value);
};
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hidden) toggleMilo(false);
});
addChatMessage(
  "¡Hola! Soy Milo, el asistente de Josemi con IA. Puedo hablar de sus proyectos, consultar información actual en Internet y decirte el tiempo de una ciudad. ¡Pregúntame lo que quieras!",
  "assistant",
);

$("#launch-settings").innerHTML = Apps.settings.icon;

// INICIO: ejecutar directamente la secuencia Matrix original.
