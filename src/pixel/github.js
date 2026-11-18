// src/pixel/github.js: datos en directo de GitHub con la API pública, sin clave.
// Recorrido: navegador → api.github.com → JSON → resumen → pantalla.
const GITHUB_CACHE_KEY = "josemi-github-v1";
const GITHUB_CACHE_MS = 10 * 60 * 1000;
let githubRequest = null;

function readGithubCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(GITHUB_CACHE_KEY) || "null");
    if (cached && Date.now() - cached.at < GITHUB_CACHE_MS && Array.isArray(cached.repos))
      return cached.repos;
  } catch {
    // Sin almacenamiento disponible: se vuelve a pedir.
  }
  return null;
}

function loadGithubRepos() {
  const cached = readGithubCache();
  if (cached) return Promise.resolve(cached);
  if (githubRequest) return githubRequest;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  githubRequest = fetch(
    `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
    {
      signal: controller.signal,
      headers: { Accept: "application/vnd.github+json" },
    },
  )
    .then((response) => {
      if (!response.ok) throw new Error(response.status === 403 ? "limit" : "http");
      return response.json();
    })
    .then((list) => {
      const repos = list
        .filter((repo) => !repo.fork)
        .map((repo) => ({
          name: repo.name,
          stars: repo.stargazers_count,
          lang: repo.language,
          pushed: repo.pushed_at,
        }));
      try {
        sessionStorage.setItem(GITHUB_CACHE_KEY, JSON.stringify({ at: Date.now(), repos }));
      } catch {
        // La caché es opcional.
      }
      return repos;
    })
    .finally(() => {
      clearTimeout(timer);
      githubRequest = null;
    });
  return githubRequest;
}

const githubRelative = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
function githubAgo(date) {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return githubRelative.format(Math.round(seconds / size), unit);
  }
  return "ahora mismo";
}

function githubSummary(repos) {
  const languages = {};
  repos.forEach((repo) => repo.lang && (languages[repo.lang] = (languages[repo.lang] || 0) + 1));
  const top = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
  const latest = [...repos].sort((a, b) => new Date(b.pushed) - new Date(a.pushed))[0];
  return {
    count: repos.length,
    stars: repos.reduce((sum, repo) => sum + repo.stars, 0),
    top,
    latest,
  };
}

const githubWidget = () =>
  `<section class="gh-live" data-gh-live aria-live="polite" aria-busy="true"><div class="gh-live__head"><span class="gh-live__dot" aria-hidden="true"></span><span class="card-kicker">EN DIRECTO DESDE GITHUB</span></div><div class="gh-live__body"><span class="gh-skeleton"></span><span class="gh-skeleton"></span><span class="gh-skeleton"></span></div></section>`;

function paintGithubWidget(box, repos) {
  const s = githubSummary(repos);
  box.setAttribute("aria-busy", "false");
  q(".gh-live__body", box).innerHTML =
    `<dl class="gh-live__stats"><div><dt>Repos públicos</dt><dd>${s.count}</dd></div><div><dt>Lenguajes más usados</dt><dd class="gh-live__langs">${s.top.join(" · ") || "—"}</dd></div><div><dt>Último cambio</dt><dd class="gh-live__latest">${s.latest ? `${s.latest.name}<small>${githubAgo(s.latest.pushed)}</small>` : "—"}</dd></div></dl><a class="gh-live__link" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">VER MI PERFIL ↗</a>`;
}

function failGithubWidget(box) {
  box.setAttribute("aria-busy", "false");
  box.classList.add("is-error");
  q(".gh-live__body", box).innerHTML =
    `<p>No he podido cargar los datos de GitHub ahora mismo. Los proyectos siguen disponibles abajo.</p><a class="gh-live__link" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">VER MI PERFIL ↗</a>`;
}

// Rellena el widget y las fechas «actualizado» que haya dentro de root.
function hydrateGithub(root) {
  const box = q("[data-gh-live]", root);
  const stamps = qa("[data-gh-pushed]", root);
  if (!box && !stamps.length) return;
  loadGithubRepos()
    .then((repos) => {
      if (!root.isConnected) return;
      if (box) paintGithubWidget(box, repos);
      stamps.forEach((el) => {
        const repo = repos.find((r) => r.name === el.dataset.ghPushed);
        if (repo) el.textContent = `Último cambio ${githubAgo(repo.pushed)}`;
      });
    })
    .catch(() => {
      if (root.isConnected && box) failGithubWidget(box);
    });
}
window.hydrateGithub = hydrateGithub;
