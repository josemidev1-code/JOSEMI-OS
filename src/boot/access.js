// src/boot/access.js: fuente de JOSEMI-OS.
let typeLoginArt;

let enteringOS = false,
  bootRun = 0;
const canSkipIntro = state.introSeen === true;
const bootDelay = (ms) => new Promise((r) => setTimeout(r, ms));

// SALIDA DE ARRANQUE: añade texto con textContent, evitando interpretar texto como HTML.
function appendBoot(text = "", cls = "") {
  const out = $("#bootTerminalOutput");
  const line = document.createElement("span");
  line.className = cls;
  line.textContent = text + "\n";
  out.appendChild(line);
  out.scrollTop = out.scrollHeight;
  return line;
}
// MÁQUINA DE ESCRIBIR: una letra por temporizador normal (sin requestAnimationFrame), así funciona
// igual en ordenadores lentos o con la pestaña en segundo plano. bootRun cancela una secuencia caducada.
async function typeBootText(el, text, speed, run) {
  const live = () => run === bootRun && !enteringOS;
  if (!speed) {
    el.textContent = text;
    return live();
  }
  for (let i = 1; i <= text.length; i++) {
    if (!live()) return false;
    el.textContent = text.slice(0, i);
    await bootDelay(speed);
  }
  return live();
}

// ENTRAR: invalida la intro, prepara menú e iconos y cambia de login a escritorio después de la transición.
function enterOS() {
  if (enteringOS) return;
  enteringOS = true;
  bootRun++;
  document.documentElement.style.setProperty("--accent", state.accent);
  document.documentElement.style.setProperty("--accent-soft", state.accent + "1f");
  $(".menu__head strong").textContent = currentUser.nom;
  $(".menu__head small").textContent = currentUser.rol;
  buildIcons();
  buildMenu();
  const login = $("#login");
  login.classList.add("out");
  setTimeout(() => {
    login.classList.add("hidden");
    $("#desktop").classList.remove("hidden");
    startTime = Date.now();
    applyTheme();
    toast("Bienvenido a JOSEMI-OS. Explora, juega, descubre.");
  }, 420);
}

// La primera visita completa el arranque; las siguientes permiten botón o Enter.
function initDirectAccess() {
  $("#skipBoot").hidden = !canSkipIntro;
  $("#skipBoot").addEventListener("click", () => {
    if (canSkipIntro) enterOS();
  });
  addEventListener("keydown", (e) => {
    if (canSkipIntro && !$("#login").classList.contains("hidden") && e.key === "Enter") {
      e.preventDefault();
      enterOS();
    }
  });
}
