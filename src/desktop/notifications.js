// src/desktop/notifications.js: fuente de JOSEMI-OS.
let AC;
// SONIDO: crea un tono corto con Web Audio; solo suena si el usuario lo activa.
function beep() {
  if (!state.sound) return;
  try {
    // Web Audio genera dos notas cuadradas; no hace falta descargar un archivo de sonido.
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    const t = AC.currentTime;
    [
      [1046, 0.08],
      [784, 0.14],
    ].forEach(([f, d], i) => {
      const o = AC.createOscillator(),
        g = AC.createGain();
      o.type = "square";
      o.frequency.value = f;
      o.connect(g);
      g.connect(AC.destination);
      const s = t + i * 0.09;
      g.gain.setValueAtTime(0.04, s);
      g.gain.exponentialRampToValueAtTime(0.0001, s + d);
      o.start(s);
      o.stop(s + d);
    });
  } catch (e) {}
}
// Una notificación "toast" se crea, se anima y se elimina para no acumular nodos en el DOM.
function toast(m) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = m;
  $("#toasts").appendChild(t);
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateX(20px)";
    t.style.transition = ".3s";
  }, 2600);
  setTimeout(() => t.remove(), 3000);
}
