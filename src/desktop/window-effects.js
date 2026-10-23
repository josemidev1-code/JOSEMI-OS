// src/desktop/window-effects.js: fuente de JOSEMI-OS.
const shellEnterOS = enterOS;
enterOS = function () {
  if (enteringOS) return;
  currentBootAnimation?.cancel();
  shellEnterOS();
};
const windowObserver = new MutationObserver((records) => {
  for (const record of records)
    for (const node of record.addedNodes)
      if (node.nodeType === 1 && node.classList.contains("window")) {
        const originalClose = $(".close", node).onclick;
        $(".close", node).onclick = () => {
          node.classList.add("closing");
          originalClose();
        };
        $(".win__bar", node).addEventListener("dblclick", (e) => {
          if (!e.target.closest("button")) maximizeWithMotion(node);
        });
      }
});
