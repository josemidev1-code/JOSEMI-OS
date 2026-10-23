/* Renderitzador Markdown segur de Milo. No s'usa innerHTML amb textos de la IA. */
const MiloRender = (() => {
  const token =
    /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\x60([^\x60\n]+)\x60|\*([^*\n]+)\*/g;

  function inline(parent, text) {
    const source = String(text || "");
    const pattern = new RegExp(token.source, "g");
    let last = 0;
    let match;
    while ((match = pattern.exec(source))) {
      if (match.index > last) {
        parent.appendChild(document.createTextNode(source.slice(last, match.index)));
      }
      if (match[1] !== undefined) {
        let url = null;
        try {
          const parsed = new URL(match[2], window.location.href);
          if (["http:", "https:", "mailto:"].includes(parsed.protocol)) url = parsed.href;
        } catch {
          /* Enllaç invàlid */
        }
        if (url) {
          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.textContent = match[1];
          parent.appendChild(a);
        } else {
          parent.appendChild(document.createTextNode(match[0]));
        }
      } else if (match[3] !== undefined || match[4] !== undefined) {
        const b = document.createElement("strong");
        b.textContent = match[3] === undefined ? match[4] : match[3];
        parent.appendChild(b);
      } else if (match[5] !== undefined) {
        const code = document.createElement("code");
        code.textContent = match[5];
        parent.appendChild(code);
      } else {
        const em = document.createElement("em");
        em.textContent = match[6];
        parent.appendChild(em);
      }
      last = pattern.lastIndex;
    }
    if (last < source.length) {
      parent.appendChild(document.createTextNode(source.slice(last)));
    }
  }

  function cells(line) {
    return line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split(/(?<!\\)\|/)
      .map((cell) => cell.trim().replace(/\\\|/g, "|"));
  }

  function render(container, markdown) {
    const lines = String(markdown || "")
      .replace(/\r\n?/g, "\n")
      .split("\n");
    const out = document.createDocumentFragment();
    const bullet = (line) => /^(\s*)([-+*]|\d+[.)])\s+(.+)$/.exec(line);
    const table = (i) => {
      if (i + 1 >= lines.length || !lines[i].includes("|")) return false;
      const head = cells(lines[i]);
      const rule = cells(lines[i + 1]);
      return (
        head.length >= 2 &&
        head.length <= 8 &&
        rule.length === head.length &&
        rule.every((cell) => /^:?-{3,}:?$/.test(cell))
      );
    };
    const isBlock = (i) => {
      const line = lines[i];
      return (
        /^\s{0,3}(?:#{1,4}\s|>|\x60{3}|~{3})/.test(line) ||
        /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line) ||
        !!bullet(line) ||
        table(i)
      );
    };

    for (let i = 0; i < lines.length;) {
      const line = lines[i];
      if (!line.trim()) {
        i++;
        continue;
      }

      const fence = /^\s*(\x60{3,}|~{3,})/.exec(line);
      if (fence) {
        const pieces = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith(fence[1])) {
          pieces.push(lines[i++]);
        }
        if (i < lines.length) i++;
        const pre = document.createElement("pre");
        const code = document.createElement("code");
        code.textContent = pieces.join("\n");
        pre.appendChild(code);
        out.appendChild(pre);
        continue;
      }

      if (table(i)) {
        const names = cells(lines[i]);
        const wrapper = document.createElement("div");
        wrapper.className = "milo-table-scroll";
        const tableEl = document.createElement("table");
        const head = document.createElement("thead");
        const header = document.createElement("tr");
        names.forEach((name) => {
          const th = document.createElement("th");
          inline(th, name);
          header.appendChild(th);
        });
        head.appendChild(header);
        tableEl.appendChild(head);
        const body = document.createElement("tbody");
        i += 2;
        let rows = 0;
        while (i < lines.length && lines[i].trim() && lines[i].includes("|") && rows < 25) {
          const tr = document.createElement("tr");
          const columns = cells(lines[i++]);
          for (let j = 0; j < names.length; j++) {
            const td = document.createElement("td");
            inline(td, columns[j] || "");
            tr.appendChild(td);
          }
          body.appendChild(tr);
          rows++;
        }
        tableEl.appendChild(body);
        wrapper.appendChild(tableEl);
        out.appendChild(wrapper);
        continue;
      }

      const heading = /^\s{0,3}(#{1,4})\s+(.+?)\s*#*\s*$/.exec(line);
      if (heading) {
        const h = document.createElement("h4");
        inline(h, heading[2]);
        out.appendChild(h);
        i++;
        continue;
      }

      if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
        out.appendChild(document.createElement("hr"));
        i++;
        continue;
      }

      if (/^\s{0,3}>\s?/.test(line)) {
        const quote = document.createElement("blockquote");
        while (i < lines.length && /^\s{0,3}>\s?/.test(lines[i])) {
          const p = document.createElement("p");
          inline(p, lines[i++].replace(/^\s{0,3}>\s?/, ""));
          quote.appendChild(p);
        }
        out.appendChild(quote);
        continue;
      }

      const first = bullet(line);
      if (first) {
        const indent = first[1].replace(/\t/g, "    ").length;
        const type = /^\d/.test(first[2]) ? "ol" : "ul";
        const root = document.createElement(type);
        let lastMain = null;
        let nested = null;
        let nestedType = "";
        while (i < lines.length) {
          const item = bullet(lines[i]);
          if (!item) break;
          const depth = item[1].replace(/\t/g, "    ").length;
          const kind = /^\d/.test(item[2]) ? "ol" : "ul";
          if (depth < indent || (depth === indent && kind !== type)) break;
          const li = document.createElement("li");
          inline(li, item[3]);
          if (depth === indent) {
            root.appendChild(li);
            lastMain = li;
            nested = null;
          } else if (lastMain) {
            if (!nested || nestedType !== kind) {
              nested = document.createElement(kind);
              lastMain.appendChild(nested);
              nestedType = kind;
            }
            nested.appendChild(li);
          } else {
            root.appendChild(li);
            lastMain = li;
          }
          i++;
        }
        out.appendChild(root);
        continue;
      }

      const p = document.createElement("p");
      let count = 0;
      let previous = "";
      while (i < lines.length && lines[i].trim() && (count === 0 || !isBlock(i))) {
        const current = lines[i++];
        if (count) {
          p.appendChild(
            / {2}$/.test(previous) ? document.createElement("br") : document.createTextNode(" "),
          );
        }
        inline(p, current.trim());
        previous = current;
        count++;
      }
      out.appendChild(p);
    }

    container.replaceChildren(out);
  }

  return { render };
})();
window.MiloRender = MiloRender;
