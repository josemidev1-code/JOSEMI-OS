// src/apps/notes.js: fuente de JOSEMI-OS.
Apps.notes = {
  title: "Bloc de notas",
  icon: spriteIcon("notes"),
  size: [680, 570],
  render: () =>
    '<section class="pixel-notes"><div class="extra-heading"><span class="card-kicker">CAPTURA UNA IDEA</span><h2>Tu bloc de notas.</h2><p>Solo en este navegador. Escribir aquí no envía tus notas a Milo ni a un servidor.</p></div><label class="sr-only" for="pixel-note">Escribe tu nota</label><textarea id="pixel-note" maxlength="60000" placeholder="Una idea, una lista, algo que no quieres olvidar…" spellcheck="true"></textarea><div class="notes-footer"><span class="notes-status" role="status"></span><span class="notes-count"></span><button class="btn" data-note-download>DESCARGAR .TXT</button></div></section>',
  bind(body, win) {
    const input = body.querySelector("textarea"),
      status = body.querySelector(".notes-status"),
      count = body.querySelector(".notes-count");
    let debounce;
    const saved = read("josemi-pixel-note", "");
    input.value = typeof saved === "string" ? saved : "";
    function updateCount() {
      count.textContent = input.value.length.toLocaleString("es-ES") + " caracteres";
    }
    function saveNote() {
      clearTimeout(debounce);
      status.textContent = write("josemi-pixel-note", input.value)
        ? "GUARDADO EN ESTE NAVEGADOR"
        : "NO SE HA PODIDO GUARDAR";
    }
    input.addEventListener("input", () => {
      updateCount();
      status.textContent = "GUARDANDO…";
      clearTimeout(debounce);
      debounce = setTimeout(saveNote, 350);
    });
    body.querySelector("[data-note-download]").onclick = () => {
      saveNote();
      const url = URL.createObjectURL(
          new Blob([input.value], { type: "text/plain;charset=utf-8" }),
        ),
        link = document.createElement("a");
      link.href = url;
      link.download = "nota-josemi.txt";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    window.addEventListener("pagehide", saveNote);
    win.__cleanup = () => {
      saveNote();
      window.removeEventListener("pagehide", saveNote);
    };
    updateCount();
    status.textContent = "SOLO EN ESTE NAVEGADOR";
  },
};
