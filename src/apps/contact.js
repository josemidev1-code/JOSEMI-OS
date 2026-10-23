// src/apps/contact.js: fuente de JOSEMI-OS.
Apps.contact = {
  title: "Contacto",
  icon: pixelIcon("contact"),
  render: () => `
      <div class="contact contact--modern">
        <span class="card-kicker">CONTACTO / NETWORK</span>
        <h2>¿Construimos algo?</h2>
        <p>Estoy aprendiendo y abierto a oportunidades, feedback y proyectos reales.</p>
        <div class="links">
          <a class="clink" href="https://github.com/josemidev1-code" target="_blank" rel="noopener"><span class="g">GH</span><span><b>GitHub</b><small>@josemidev1-code</small></span><i>↗</i></a>
          <a class="clink" href="https://www.linkedin.com/in/jose-miguel-miralles-gandia-74347b43a/" target="_blank" rel="noopener"><span class="g">IN</span><span><b>LinkedIn</b><small>José Miguel Miralles Gandia</small></span><i>↗</i></a>
          <a class="clink" href="mailto:josemidev1@gmail.com"><span class="g">@</span><span><b>Email</b><small>josemidev1@gmail.com</small></span><i>↗</i></a>
          <a class="clink" href="https://github.com/josemidev1-code/JOSEMI-OS" target="_blank" rel="noopener"><span class="g">OS</span><span><b>JOSEMI-OS</b><small>Repositorio del portfolio</small></span><i>↗</i></a>
          <a class="clink" href="https://github.com/josemidev1-code/portafolio-web" target="_blank" rel="noopener"><span class="g">◈</span><span><b>Museu grec</b><small>portafolio-web</small></span><i>↗</i></a>
        </div>
        <button class="btn btn--accent" id="copy-email">COPIAR EMAIL</button>
      </div>`,
  bind(b) {
    $("#copy-email", b).addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("josemidev1@gmail.com");
        toast("Email copiado al portapapeles.");
      } catch {
        toast("No se ha podido acceder al portapapeles.");
      }
    });
  },
};
