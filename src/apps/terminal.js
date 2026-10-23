// src/apps/terminal.js: fuente de JOSEMI-OS.
function runCommand(raw, print, openWin) {
  const p = raw.trim().split(/\s+/),
    c = (p[0] || "").toLowerCase(),
    a = p.slice(1).join(" ");
  switch (c) {
    case "":
      break;
    case "help":
    case "ayuda":
      print(
        'Comandos: <span class="ok">ayuda readme quien-soy sobre-mi proyectos habilidades contacto limpiar fecha eco ls cat sudo secreto matrix fondo tetris pacman buscaminas vault arcade cafe hola 42</span>',
      );
      break;
    case "infectar":
    case "virus":
      startCorruption();
      print(
        '<span class="err">0xMILO: simulación activada. Datos ficticios cargados. Escribe antivirus, pulsa Escape o usa Restaurar sistema.</span>',
      );
      break;
    case "antivirus":
    case "restaurar":
      stopCorruption();
      print('<span class="ok">Integridad recuperada. La información original está intacta.</span>');
      break;
    case "whoami":
    case "quien-soy":
      if (corruptionActive) {
        print(escapeHTML(CORRUPT_STORIES[0] + " · " + CORRUPT_STORIES[1]));
        break;
      }
      print(
        "José Miguel Miralles Gandia<br>Estudiante de DAM en IES Dr. Lluís Simarro<br>Desarrollador de software en proceso.",
      );
      break;
    case "readme":
      print("Abriendo README.md...");
      openWin("readme");
      break;
    case "about":
    case "sobre-mi":
      print("Abriendo Sobre mí...");
      openWin("about");
      break;
    case "projects":
    case "proyectos":
      print("Abriendo Proyectos...");
      openWin("projects");
      break;
    case "skills":
    case "habilidades":
      print("Abriendo Habilidades...");
      openWin("skills");
      break;
    case "contact":
    case "contacto":
      print("Abriendo Contacto...");
      openWin("contact");
      break;
    case "clear":
    case "limpiar":
      $("#term-out").innerHTML = "";
      break;
    case "date":
    case "fecha":
      print(new Date().toLocaleString("es-ES"));
      break;
    case "echo":
    case "eco":
      print(escapeHTML(a || ""));
      break;
    case "ls":
      print(
        "README.md  sobre-mi.txt  suenos.txt  proyectos/  habilidades.json  contacto.txt  juegos/  secreto/",
      );
      break;
    case "cat":
      if (a.toLowerCase() === "readme.md")
        print(
          "JOSEMI-OS: mi primer proyecto personal como desarrollador. Portfolio interactivo con aplicaciones, terminal, Arcade, easter eggs y acertijos.",
        );
      else if (a === "sobre-mi.txt" || a === "about.txt")
        print(
          "José Miguel Miralles Gandia · estudiante de DAM en IES Dr. Lluís Simarro · desarrollador de software en proceso.",
        );
      else if (a === "sueños.txt" || a === "suenos.txt")
        print(
          "Crear automatizaciones y aplicaciones para grandes empresas combinando IA, programación y creatividad.",
        );
      else print(`cat: ${escapeHTML(a || "(sin archivo)")}: no existe`);
      break;
    case "sudo":
      if (a.startsWith("rm -rf")) {
        print('<span class="err">Buen intento. JOSEMI_OS se niega a autodestruirse.</span>');
        break;
      }
      print("Permiso concedido.\nLanzando protocolo de contacto...");
      openWin("contact");
      break;
    case "secret":
    case "secreto":
      print('<span class="ok">🔓 Easter egg desbloqueado.</span>');
      openWin("easter");
      toast("Has encontrado SECRETO.sys");
      break;
    case "matrix":
      state.wallpaper = "static";
      state.wp = 4;
      state.atmosphere = "matrix";
      applyTheme();
      save();
      print('<span class="ok">Código en cascada activado.</span> Usa "fondo 0" para salir.');
      break;
    case "wallpaper":
    case "fondo":
      if (selectPixelWallpaper(a)) {
        print("Fondo pixel art centrado: " + PIXEL_WALLPAPERS[a].name);
        break;
      }
      state.wallpaper = "static";
      if (a === "matrix-blue" || a === "matrix-depth") {
        state.atmosphere = a === "matrix-blue" ? "matrixBlue" : "matrixDepth";
        applyTheme();
        save();
        print("Fondo Matrix activado.");
        break;
      }
      if (["matrix", "storm", "rain", "aurora", "stars", "terrain"].includes(a)) {
        state.atmosphere = a;
        applyTheme();
        save();
        print("Fondo ASCII activado.");
      } else if (["0", "1", "2", "3"].includes(a)) {
        state.wp = +a;
        state.atmosphere = "none";
        applyTheme();
        save();
        print("Fondo estático activado.");
      } else
        print(
          `Uso: fondo ${Object.keys(PIXEL_WALLPAPERS).join("|")}|storm|rain|aurora|stars|terrain|matrix|matrix-blue|matrix-depth|0|1|2|3`,
        );
      break;
    case "tetris":
      print("Abriendo Tetris...");
      openWin("tetris");
      break;
    case "pacman":
      print("Abriendo Pac-Man...");
      openWin("pacman");
      break;
    case "buscaminas":
    case "minas":
      print("Abriendo Buscaminas...");
      openWin("minesweeper");
      break;
    case "vault":
      openWin("easter");
      break;
    case "arcade":
      print("Abriendo Arcade...");
      openWin("arcade");
      break;
    case "coffee":
    case "cafe":
      print("Compilando...\n☕ Café cargado correctamente. Productividad +10.");
      toast("Café virtual servido ☕");
      break;
    case "hello":
    case "hola":
      print("Hola, humano. JOSEMI_OS te está observando 👀");
      break;
    case "42":
      print('<span class="ok">42.</span> La respuesta estaba aquí. La pregunta sigue pendiente.');
      openWin("easter");
      break;
    default:
      print(`<span class="err">comando no encontrado: ${escapeHTML(c)}</span>`);
  }
}
