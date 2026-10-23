// src/desktop/shortcuts.js: fuente de JOSEMI-OS.
function buildIcons() {
  const container = $("#icons");
  container.innerHTML = "";
  currentUser.apps.forEach((id, i) => {
    const app = Apps[id];
    if (!app) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon";
    button.dataset.id = id;
    button.style.setProperty("--icon-index", i);
    button.setAttribute("aria-label", `Abrir ${app.title}`);
    button.innerHTML = `<span class="glyph">${app.icon}</span><span class="lbl">${app.title}</span>`;
    button.onclick = (event) => {
      if (event.pointerType === "touch" || matchMedia("(pointer: coarse)").matches) openWindow(id);
      else {
        $$(".icon").forEach((el) => el.classList.remove("sel"));
        button.classList.add("sel");
      }
    };
    button.ondblclick = () => openWindow(id);
    button.onkeydown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        openWindow(id);
      }
    };
    container.append(button);
  });
}
