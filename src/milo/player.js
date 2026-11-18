// src/milo/player.js: fuente de JOSEMI-OS.
// Reproductor de Milo. Busca en la API pública de iTunes (sin clave) y reproduce la muestra
// de 30 segundos que ofrece Apple. Lo usan la orden directa «pon …» y la herramienta
// play_music de la IA. Recorrido: navegador → itunes.apple.com → JSON → <audio> → pantalla.
const MiloPlayer = (() => {
  // El elemento de audio se crea al primer uso: así el módulo también carga en las pruebas de Node.
  let element = null;
  const media = () => element || (element = createAudio());
  let tracks = [];
  let index = 0;
  let box = null;

  const escapeText = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const mascot = () => document.querySelector("#mascot-button");
  const setDancing = (on) => {
    const m = mascot();
    if (m) m.dataset.music = on ? "on" : "off";
  };

  async function search(query, signal) {
    const url =
      "https://itunes.apple.com/search?term=" +
      encodeURIComponent(String(query).slice(0, 100)) +
      "&media=music&entity=song&limit=5&country=ES";
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error("iTunes HTTP " + response.status);
    const data = await response.json();
    return (data.results || [])
      .filter((t) => t.previewUrl)
      .slice(0, 3)
      .map((t) => ({
        name: t.trackName,
        artist: t.artistName,
        preview: t.previewUrl,
        art: (t.artworkUrl100 || "").replace("100x100bb", "200x200bb"),
        link: t.trackViewUrl || t.artistViewUrl || "",
      }));
  }

  // Pinta la tarjeta «sonando ahora» y la lista de alternativas dentro del panel de Milo.
  function render() {
    box = box || document.querySelector(".mascot-results");
    if (!box) return;
    const t = tracks[index];
    if (!t) {
      box.replaceChildren();
      return;
    }
    box.innerHTML = `<div class="milo-player" data-state="${media().paused ? "paused" : "playing"}">
      ${t.art ? `<img class="milo-player__art" src="${escapeText(t.art)}" alt="" width="56" height="56">` : ""}
      <div class="milo-player__info"><small>${media().paused ? "EN PAUSA" : "SONANDO AHORA"}</small><strong>${escapeText(t.name)}</strong><span>${escapeText(t.artist)}</span>
      <div class="milo-player__bar" role="progressbar" aria-label="Progreso de la muestra" aria-valuemin="0" aria-valuemax="30"><i></i></div></div>
      <div class="milo-player__controls"><button type="button" data-player="toggle" aria-label="${media().paused ? "Reproducir" : "Pausar"}">${media().paused ? "▶" : "❚❚"}</button><button type="button" data-player="stop" aria-label="Parar la música">■</button></div>
    </div>
    ${tracks
      .map((x, i) =>
        i === index
          ? ""
          : `<button type="button" class="music-result" data-player-track="${i}">▶ ${escapeText(x.name)} — ${escapeText(x.artist)}</button>`,
      )
      .join("")}
    <small class="milo-player__note">Muestra de 30 s de iTunes${t.link ? ` · <a href="${escapeText(t.link)}" target="_blank" rel="noopener">canción completa ↗</a>` : ""}</small>`;
  }

  function progress() {
    const bar = box?.querySelector(".milo-player__bar");
    if (!bar || !media().duration) return;
    bar.style.setProperty("--progress", (media().currentTime / media().duration) * 100 + "%");
    bar.setAttribute("aria-valuenow", String(Math.round(media().currentTime)));
  }

  async function start(i) {
    index = i;
    media().src = tracks[index].preview;
    let ok = true;
    try {
      await media().play();
    } catch {
      ok = false; // El navegador puede exigir otro clic: la tarjeta queda con ▶.
    }
    render();
    return ok;
  }

  async function play(query, signal) {
    const found = await search(query, signal);
    if (!found.length) return { ok: false, text: `No he encontrado «${query}» en iTunes.` };
    tracks = found;
    const ok = await start(0);
    const t = tracks[0];
    return {
      ok: true,
      playing: ok,
      text: ok
        ? `🎵 Sonando: ${t.name} — ${t.artist} (muestra de 30 s).`
        : `He encontrado ${t.name} — ${t.artist}. Pulsa ▶ para escucharla.`,
      tracks: tracks.map(({ name, artist }) => ({ name, artist, preview_seconds: 30 })),
    };
  }

  function pause() {
    media().pause();
    render();
    return { ok: true, text: "Música en pausa." };
  }
  function resume() {
    if (!tracks.length)
      return { ok: false, text: "No hay ninguna canción. Dime «pon» y un título." };
    media()
      .play()
      .catch(() => {});
    return { ok: true, text: "Sigo con la música." };
  }
  function stop() {
    media().pause();
    media().removeAttribute("src");
    tracks = [];
    setDancing(false);
    render();
    return { ok: true, text: "Música parada." };
  }

  function createAudio() {
    const el = new Audio();
    el.preload = "none";
    el.addEventListener("play", () => {
      setDancing(true);
      render();
    });
    el.addEventListener("pause", () => setDancing(false));
    el.addEventListener("ended", () => {
      setDancing(false);
      render();
    });
    el.addEventListener("timeupdate", progress);
    return el;
  }

  if (typeof document !== "undefined")
    document.addEventListener("click", (event) => {
      const control = event.target.closest("[data-player]");
      if (control) {
        if (control.dataset.player === "toggle") media().paused ? resume() : pause();
        if (control.dataset.player === "stop") stop();
        return;
      }
      const other = event.target.closest("[data-player-track]");
      if (other) start(Number(other.dataset.playerTrack));
    });

  return { play, pause, resume, stop, isPlaying: () => Boolean(element && !element.paused) };
})();
window.MiloPlayer = MiloPlayer;
