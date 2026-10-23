// src/apps/corruption.js: fuente de JOSEMI-OS.
let corruptionActive = false;
let corruptionObserver = null;
const corruptionOriginals = new Map();
const CORRUPT_STORIES = [
  "SIMULACIÓN · JOSEMI.EXE, jardinero de satélites",
  "Estudio teletransporte de ajolotes en la Universidad de la Luna. Este dato es ficción del easter egg.",
  "Proyecto corrupto: una tostadora que compila JavaScript y lanza meteoritos de pan.",
  "Experiencia ficticia: 404 años reparando portales de la Matrix.",
  "Aficiones corruptas: levantar planetas, coleccionar bugs y correr por Saturno.",
  "ERROR 0xMILO: disciplina sustituida por una bolsa de monedas de arcade.",
];
function corruptVisibleText() {
  if (!corruptionActive) return;
  const targets = $$(
    '.window[data-id="about"] .win__body h2, .window[data-id="about"] .win__body h3, .window[data-id="about"] .win__body p, .window[data-id="projects"] .bio, .window[data-id="projects"] .folder .n, .window[data-id="skills"] .bio, .window[data-id="readme"] .win__body p, #icons .lbl',
  );
  targets.forEach((el, i) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node, j) => {
      if (!node.textContent.trim() || corruptionOriginals.has(node)) return;
      corruptionOriginals.set(node, node.textContent);
      node.textContent = el.closest("#icons")
        ? "ERR_" + el.closest(".icon").dataset.id.toUpperCase()
        : j === 0
          ? CORRUPT_STORIES[i % CORRUPT_STORIES.length]
          : " [dato corrupto] ";
    });
  });
}
function startCorruption() {
  if (corruptionActive) return;
  corruptionActive = true;
  document.body.classList.add("is-corrupted");
  const banner = document.createElement("aside");
  banner.id = "corruption-recovery";
  banner.setAttribute("role", "status");
  banner.innerHTML =
    '<div><b>⚠ JOSEMI.SYS CORRUPTO</b><small>Easter egg · la información alterada es ficción</small></div><button type="button">Restaurar sistema</button>';
  banner.querySelector("button").onclick = stopCorruption;
  document.body.appendChild(banner);
  corruptVisibleText();
  corruptionObserver = new MutationObserver(corruptVisibleText);
  corruptionObserver.observe($("#desktop"), { childList: true, subtree: true });
  toast("Señal corrupta detectada. Milo necesita un antivirus.");
}
function stopCorruption() {
  if (!corruptionActive) return;
  corruptionActive = false;
  corruptionObserver?.disconnect();
  corruptionObserver = null;
  corruptionOriginals.forEach((text, node) => {
    if (node.isConnected) node.textContent = text;
  });
  corruptionOriginals.clear();
  document.body.classList.remove("is-corrupted");
  $("#corruption-recovery")?.remove();
  // Evita que las respuestas ficticias sigan en el chat al recuperar el sistema.
  $$("#mascot-log .corrupt-reply").forEach((node) => node.remove());
  toast("Sistema restaurado. Josemi vuelve a ser Josemi.");
}
// Rescate de teclado: funciona aunque la Terminal esté cerrada.
document.addEventListener("keydown", (e) => {
  if (corruptionActive && e.key === "Escape") stopCorruption();
});
