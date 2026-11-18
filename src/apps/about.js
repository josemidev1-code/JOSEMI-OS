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
      </div>
      <section class="about-section" aria-labelledby="about-stack">
        <span class="card-kicker">05 / STACK</span>
        <h3 id="about-stack">Con qué trabajo</h3>
        <p>Sin porcentajes inventados: estas son las tecnologías que he usado de verdad en mis proyectos.</p>
        <div class="chips">${["HTML", "CSS", "JavaScript", "Git y GitHub", "Python", "PowerShell", "C# y Unity", "Three.js", "APIs REST"].map((x) => `<span class="chip">${x}</span>`).join("")}</div>
      </section>
      <div class="content-grid">
        <article class="content-card">
          <span class="card-kicker">06 / FORMACIÓN</span>
          <h3>DAM en el IES Dr. Lluís Simarro</h3>
          <p>Estudio <strong>Desarrollo de Aplicaciones Multiplataforma</strong> en Xàtiva: programación, bases de datos y creación de aplicaciones. En clase trabajamos por proyectos y con agentes de IA.</p>
        </article>
        <article class="content-card">
          <span class="card-kicker">07 / LO QUE QUIERO APRENDER</span>
          <h3>IA y automatización</h3>
          <p>Quiero integrar IA en aplicaciones y automatizar procesos repetitivos. Milo (asistente con APIs) y SparkTune (recomendaciones con IA) son mis primeros pasos reales en esa dirección.</p>
        </article>
      </div>`,
  size: [860, 760],
};
