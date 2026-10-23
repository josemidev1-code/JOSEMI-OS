// src/wallpapers/catalog.js: fuente de JOSEMI-OS.
const PIXEL_WALLPAPERS = Object.fromEntries(
  [
    ["matrixCity", "Matrix · azotea", "Ciudad, código y silueta"],
    ["matrixCode", "Matrix · portal", "Código verde y cian"],
    ["minecraft", "Minecraft · valle", "Bloques, río y refugio"],
    ["jetpack", "Jetpack · laboratorio", "Arcade industrial y monedas"],
    ["cyberpunk", "Cyberpunk · neón", "Azotea, moto y ciudad nocturna"],
    ["platformWorld", "Mundo plataformas · retro", "Tuberías, bloques y castillo"],
    ["zeldaForest", "Zelda · bosque sagrado", "Ruinas y espada en la piedra"],
    ["sonicCoast", "Sonic · costa", "Palmeras, anillos y bucle"],
    ["hollowCavern", "Hollow Knight · cavernas", "Santuario azul y máscara"],
    ["godOfWarPixel", "God of War · nórdico", "Lago helado, runas y hacha"],
  ].map(([id, name, detail]) => [id, { name, detail, url: drawPixelWallpaper(id) }]),
);
function selectPixelWallpaper(id) {
  if (!PIXEL_WALLPAPERS[id]) return false;
  state.wallpaper = id;
  if (!state.universeUserAtmosphere) state.atmosphere = "none";
  state.wp = 0;
  applyTheme();
  save();
  return true;
}
