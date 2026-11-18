// src/apps/utilities-shared.js: fuente de JOSEMI-OS.
const read = OSStorage.readJSON;
const write = OSStorage.writeJSON;
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const spriteIcon = (kind) => mapIcon(kind);
