// src/pixel/vault.js: fuente de JOSEMI-OS.
const vaultRender = Apps.easter.render,
  vaultBind = Apps.easter.bind;
const door = `<svg class="vault-pixel-door" viewBox="0 0 160 96" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="3" width="152" height="90" fill="#10252e"/><rect x="8" y="7" width="144" height="82" fill="#7396a0"/><rect x="14" y="13" width="132" height="70" fill="#16313e"/><g class="vault-door-half vault-door-left"><rect x="16" y="15" width="64" height="66" fill="#4b707f"/><path d="M22 21H74V75H22Z" fill="#365564"/><path d="M26 25H70V29H26Z" fill="#84a4ac"/></g><g class="vault-door-half vault-door-right"><rect x="80" y="15" width="64" height="66" fill="#4b707f"/><path d="M86 21H138V75H86Z" fill="#365564"/><path d="M90 25H134V29H90Z" fill="#84a4ac"/><path d="M85 39H95V59H85Z" fill="#d2b56f"/></g><g class="vault-wheel"><rect x="64" y="35" width="32" height="26" fill="#a3c1bf"/><rect x="68" y="39" width="24" height="18" fill="#284a58"/><path d="M78 33H82V63H78ZM62 46H98V50H62Z" fill="#e1d6a7"/></g><path d="M21 10H25V13H21ZM135 10H139V13H135ZM21 83H25V86H21ZM135 83H139V86H135Z" fill="#e8e0b6"/></svg>`;
Apps.easter.render = () =>
  vaultRender().replace(
    '<div class="vault-opening"',
    `<div class="vault-engine">${door}<span>ACCESO A LA CÁMARA DE SECRETOS</span></div><div class="vault-opening"`,
  );
Apps.easter.bind = (body, win) => {
  vaultBind(body, win);
  qa(".vault-lock", body).forEach((b) => {
    b.insertAdjacentHTML(
      "afterbegin",
      `<span class="vault-lock-pixel">${art.lock}<i></i><i></i><i></i><i></i></span>`,
    );
  });
  let t = setTimeout(
    () => q(".vault-engine", body)?.classList.add("vault-engine-open"),
    state.motion ? 0 : 180,
  );
  win.__cleanup = () => clearTimeout(t);
};
