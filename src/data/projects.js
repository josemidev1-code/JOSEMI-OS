// src/data/projects.js: fuente de JOSEMI-OS.
const PROJECTS = {
  web: {
    name: "JOSEMI-OS",
    desc: "Mi primer proyecto personal como desarrollador: un portfolio interactivo con estética de sistema operativo, aplicaciones, terminal, juegos y easter eggs.",
    lang: "HTML / CSS / JavaScript",
    db: "—",
    fw: "Vanilla",
    date: "2026",
    status: "dev",
    tags: ["Portfolio", "Frontend", "JavaScript"],
    github: "https://github.com/josemidev1-code/JOSEMI-OS",
  },
  school: {
    name: "Formación DAM",
    desc: "Espacio para reunir proyectos y prácticas reales de Desarrollo de Aplicaciones Multiplataforma. No añado detalles concretos hasta tener cada proyecto listo para enseñar.",
    lang: "En formación",
    db: "En formación",
    fw: "—",
    date: "Actual",
    status: "dev",
    tags: ["DAM", "Aprendizaje"],
  },
  auto: {
    name: "Automatización",
    desc: "Área de roadmap: quiero aprender a crear automatizaciones útiles y convertir procesos repetitivos en software.",
    lang: "Por definir",
    db: "—",
    fw: "—",
    date: "Roadmap",
    status: "exp",
    tags: ["Automatización", "Roadmap"],
  },
  ai: {
    name: "IA + software",
    desc: "Área de roadmap: explorar cómo integrar inteligencia artificial en aplicaciones y flujos de trabajo de forma creativa.",
    lang: "Por definir",
    db: "—",
    fw: "—",
    date: "Roadmap",
    status: "exp",
    tags: ["IA", "Creatividad", "Roadmap"],
  },
};

// Casos de proyecto: reto → solución → resultado. Datos comprobados en cada repositorio.
const GITHUB_USER = "josemidev1-code";
const CASE_STUDIES = [
  {
    id: "sparktune",
    repo: "CLI-SPARKTUNE",
    name: "SparkTune",
    kicker: "CLI · WINDOWS",
    tagline: "Optimizar Windows sabiendo qué cambias.",
    art: "terminal",
    status: "dev",
    reto: "Los «optimizadores» de Windows suelen aplicar cambios a ciegas y sin forma de volver atrás. Quería una herramienta que explicara cada ajuste antes de tocarlo.",
    solucion:
      "Una CLI en PowerShell que detecta el hardware, enseña una ficha por cambio (qué hace, riesgo y si es reversible) y aplica solo lo que eliges. Cada cambio queda en un registro y se deshace con un comando. Incluye un modo de recomendaciones con IA.",
    resultado:
      "Se instala con un bloque de PowerShell, sin permisos de administrador, y lleva 9 versiones publicadas en GitHub Releases.",
    facts: [
      ["Versiones publicadas", "9"],
      ["Necesita admin", "No"],
      ["Cambios reversibles", "Sí"],
    ],
    stack: ["PowerShell", "Batch", "CLI", "API de IA"],
  },
  {
    id: "dbsurvivor",
    repo: "DBSurvivor",
    name: "DragonBall Survivor",
    kicker: "VIDEOJUEGO · NAVEGADOR",
    tagline: "Un survivor pixel art que se juega sin instalar nada.",
    art: "controller",
    status: "dev",
    live: "https://josemidev1-code.github.io/DBSurvivor/",
    reto: "Quería entender cómo funciona un juego de acción por oleadas, al estilo de Vampire Survivors, construyéndolo yo con personajes que me gustan desde pequeño.",
    solucion:
      "Juego en HTML, CSS y JavaScript con sprites pixel art. Escribí herramientas en Python para montar las animaciones y generar la Dex de personajes a partir de los packs de sprites, en lugar de hacerlo a mano.",
    resultado:
      "Se juega en GitHub Pages desde cualquier navegador. Es mi proyecto más largo: más de 360 commits y una bitácora con cada cambio.",
    note: "Proyecto fan sin ánimo de lucro. Los personajes pertenecen a sus autores.",
    facts: [
      ["Commits", "360+"],
      ["Se juega en", "Navegador"],
      ["Herramientas", "Python"],
    ],
    stack: ["JavaScript", "Canvas", "Pixel art", "Python"],
  },
  {
    id: "thefog",
    repo: "TheFog-",
    name: "The Fog",
    kicker: "VIDEOJUEGO 3D · UNITY",
    tagline: "Terror en una torre de vigilancia, con Unity 6.",
    art: "fog",
    status: "dev",
    reto: "Dar el salto de los juegos en el navegador a un motor 3D profesional, con modelos pesados que no caben en un repositorio normal.",
    solucion:
      "Proyecto en Unity 6 (URP) con C#. La primera escena jugable, el Puesto de Daniel, es un turno de noche con cámaras, anomalías, apagones, linterna con pilas y niebla. Los modelos se comparten con Git LFS y la escena se regenera desde un menú propio del editor.",
    resultado:
      "Primera versión jugable, con ejecutable para Windows y una prueba automática que recorre la escena.",
    facts: [
      ["Motor", "Unity 6"],
      ["Lenguaje", "C#"],
      ["Modelos 3D", "Git LFS"],
    ],
    stack: ["Unity", "C#", "URP", "Git LFS"],
  },
  {
    id: "systemplast",
    repo: "SystemPlas",
    name: "System Plast",
    kicker: "WEB CORPORATIVA",
    tagline: "Un catálogo industrial que se genera a partir de datos.",
    art: "factory",
    status: "dev",
    live: "https://josemidev1-code.github.io/SystemPlas/",
    reto: "Presentar el catálogo de System Plast, componentes para inyectoras de plástico, con decenas de fichas técnicas sin mantener cada página a mano.",
    solucion:
      "Los productos viven en un único JSON y un script en Python genera todas las fichas HTML. El sitio es estático y se publica con GitHub Pages.",
    resultado:
      "21 fichas de producto generadas desde una sola fuente de datos: cambio un dato, vuelvo a generar y se actualiza toda la web.",
    facts: [
      ["Fichas generadas", "21"],
      ["Fuente de datos", "1 JSON"],
      ["Generador", "Python"],
    ],
    stack: ["HTML", "CSS", "JavaScript", "Python"],
  },
  {
    id: "nuria",
    repo: "PAGINAWEBNURIA",
    name: "Nuria Cerdá · Abogada",
    kicker: "WEB PROFESIONAL",
    tagline: "La web de un despacho de herencias en Xàtiva.",
    art: "scales",
    status: "done",
    live: "https://josemidev1-code.github.io/PAGINAWEBNURIA/",
    reto: "Explicar con claridad un tema que preocupa (herencias, testamentos e impuesto de sucesiones) y cumplir con los textos legales que exige una web profesional.",
    solucion:
      "Web estática en HTML, CSS y JavaScript con servicios, página de ayudas, aviso legal, privacidad y cookies, favicon propio y robots.txt.",
    resultado:
      "Publicada en GitHub Pages, con descripción para buscadores y diseño adaptado a móvil.",
    facts: [
      ["Páginas", "6"],
      ["Textos legales", "3"],
      ["Publicada en", "Pages"],
    ],
    stack: ["HTML", "CSS", "JavaScript", "SEO"],
  },
  {
    id: "museo",
    repo: "portafolio-web",
    name: "Museu grec",
    kicker: "PORTFOLIO 3D · THREE.JS",
    tagline: "Un museo griego en 3D que se recorre con la rueda del ratón.",
    art: "temple",
    status: "done",
    reto: "Mi primer portfolio: quería que recorrerlo fuera una experiencia y no una lista de enlaces.",
    solucion:
      "Una escena 3D con Three.js: el ágora de Atenas, el Partenón y tres salas presididas por dioses de la saga griega de God of War. El mármol, la piedra y el bronce se generan con canvas, el fuego se anima con shaders y se avanza con la rueda o deslizando en el móvil.",
    resultado:
      "Un museo navegable desde el navegador. Con él aprendí WebGL, cámaras 3D y a cuidar el rendimiento.",
    facts: [
      ["Motor", "Three.js"],
      ["Salas", "3"],
      ["Materiales", "Procedurales"],
    ],
    stack: ["Three.js", "WebGL", "JavaScript", "Shaders"],
  },
];
