// src/apps/gallery.js: fuente de JOSEMI-OS.
Apps.gallery = {
  title: "Fondos",
  icon: spriteIcon("gallery"),
  size: [900, 680],
  render: () =>
    '<section class="wall-gallery"><div class="extra-heading"><span class="card-kicker">PERSONALIZA TU UNIVERSO</span><h2>Un escritorio. Muchos mundos.</h2><p>Fondos originales en pixel art. Elige uno o guarda tus favoritos.</p></div><div class="wall-controls"><input type="search" aria-label="Buscar fondo" placeholder="Buscar un mundo…"><div><button class="btn" data-wall-filter="all" aria-pressed="true">TODOS</button><button class="btn" data-wall-filter="new" aria-pressed="false">NUEVOS</button><button class="btn" data-wall-filter="favorite" aria-pressed="false">FAVORITOS</button></div></div><p class="wall-count" role="status"></p><div class="wall-gallery-grid"></div></section>',
  bind(body) {
    let filter = "all",
      favorites = read("josemi-wall-favorites", []);
    if (!Array.isArray(favorites)) favorites = [];
    if (favorites.includes("marioWorld")) {
      favorites = [...new Set(favorites.map((id) => (id === "marioWorld" ? "platformWorld" : id)))];
      write("josemi-wall-favorites", favorites);
    }
    const grid = body.querySelector(".wall-gallery-grid"),
      input = body.querySelector("input");
    const normalize = (s) =>
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    function render() {
      const query = normalize(input.value),
        items = Object.entries(PIXEL_WALLPAPERS).filter(
          ([id, w]) =>
            (filter !== "new" || newWalls.some((v) => v[0] === id)) &&
            (filter !== "favorite" || favorites.includes(id)) &&
            normalize(w.name + " " + w.detail).includes(query),
        );
      body.querySelector(".wall-count").textContent =
        items.length +
        (items.length === 1 ? " fondo" : " fondos") +
        " · se guarda en este navegador";
      grid.innerHTML = items.length
        ? items
            .map(
              ([id, w]) =>
                `<article class="wall-tile ${state.wallpaper === id ? "selected" : ""}"><button class="wall-select" data-select-wall="${id}" aria-label="Usar fondo ${escape(w.name)}" aria-pressed="${state.wallpaper === id}"><span class="wall-tile-preview" style="background-image:url('${w.url}')"></span><strong>${escape(w.name)}</strong><small>${escape(w.detail)}</small><span class="wall-tile-state">${state.wallpaper === id ? "EN TU ESCRITORIO" : "APLICAR FONDO →"}</span></button><button class="wall-favorite" data-wall-favorite="${id}" aria-label="${favorites.includes(id) ? "Quitar de favoritos" : "Guardar favorito"}: ${escape(w.name)}" aria-pressed="${favorites.includes(id)}">${favorites.includes(id) ? "★" : "☆"}</button></article>`,
            )
            .join("")
        : '<p class="extra-empty">Aquí aún no hay mundos. Prueba otra búsqueda o guarda un favorito.</p>';
    }
    input.addEventListener("input", render);
    body.addEventListener("click", (e) => {
      const button = e.target.closest("button");
      if (!button) return;
      if (button.dataset.wallFilter) {
        filter = button.dataset.wallFilter;
        body
          .querySelectorAll("[data-wall-filter]")
          .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
        render();
      }
      if (button.dataset.selectWall) {
        selectPixelWallpaper(button.dataset.selectWall);
        render();
        toast("Fondo aplicado: " + PIXEL_WALLPAPERS[button.dataset.selectWall].name);
      }
      if (button.dataset.wallFavorite) {
        const id = button.dataset.wallFavorite;
        favorites = favorites.includes(id) ? favorites.filter((x) => x !== id) : [...favorites, id];
        if (!write("josemi-wall-favorites", favorites))
          toast("No se ha podido guardar el favorito.");
        render();
      }
    });
    render();
  },
};
