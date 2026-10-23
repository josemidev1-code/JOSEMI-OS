// src/apps/about.js: fuente de JOSEMI-OS.
Apps.about = {
  title: "Sobre mí",
  icon: pixelIcon("about"),
  render: () => `
      <section class="profile-hero">
        <div class="profile-hero__terminal"><span>josemi@portfolio</span><b>DESARROLLADOR EN PROCESO</b></div>
        <h2>${PROFILE.nombre}</h2>
        <p>${PROFILE.bio}</p>
        <div class="chips">${PROFILE.gustos.map((x) => `<span class="chip">${x}</span>`).join("")}</div>
      </section>
      <div class="content-grid">
        <article class="content-card">
          <span class="card-kicker">01 / AHORA</span>
          <h3>Qué estoy haciendo</h3>
          <p>Estudio <strong>DAM</strong> en <strong>IES Dr. Lluís Simarro</strong>. Trabajo en HTML, CSS, JavaScript, Git y GitHub con este portfolio y proyectos de formación.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">02 / MOTIVACIÓN</span>
          <h3>De jugar a construir</h3>
          <p>Desde pequeño me apasiona la tecnología. Empezó con videojuegos, televisión, móvil y ordenador; ahora quiero entender el código y crear mis propias ideas.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">03 / VIRTUDES</span>
          <h3>Cómo trabajo</h3>
          <p>Disciplina, motivación, ganas de aprender y compromiso con lo que hago. Prefiero progreso real y pruebas honestas antes que exagerar experiencia.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">04 / FUERA DEL CÓDIGO</span>
          <h3>Aficiones</h3>
          <p>Gimnasio, deporte, programar, proyectos, ciencia ficción, cine y lectura.</p>
        </article>
      </div>`,
};
