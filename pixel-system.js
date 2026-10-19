/* Pixel-art system layer. Existing apps, content, games and Milo stay in place. */
(() => {
  document.body.classList.add('pixel-system');
  const originalApply=applyTheme;
  applyTheme=function () {
    originalApply();
    const wallpaper=PIXEL_WALLPAPERS[state.wallpaper];
    if(wallpaper)document.body.style.setProperty('--pixel-wallpaper',`url("${wallpaper.url}")`);
  };
  // Recover the original palette only for visitors of the retired desktop.
  if(state.macShellVersion) {
    state.theme='night';state.accent='#8be9a8';state.bg='#090e14';
    if(state.wallpaper==='horizon') {state.wallpaper='matrixCity';state.atmosphere='matrix';state.wp=0;}
    delete state.macShellVersion;
    save();applyTheme();
  }
  if(state.pixelSystemVersion!==3) {
    if(!state.wallpaper||state.wallpaper==='static')state.wallpaper='matrixCity';
    if(state.cursor==='system')state.cursor='pixel';
    state.pixelSystemVersion=3;save();
  }
  applyTheme();
  const desktop=document.querySelector('#desktop');
  const topbar=document.createElement('header');
  topbar.className='pixel-system-bar';
  topbar.innerHTML=`<div class="pixel-brand"><span class="pixel-brand-mark" aria-hidden="true">J</span><strong>JOSEMI-OS</strong><span class="pixel-bar-divider"></span><span class="pixel-current-app">ESCRITORIO</span></div><nav aria-label="Herramientas del sistema"><button data-pixel-open="projects">ARCHIVOS</button><button data-pixel-open="readme">AYUDA</button><button data-pixel-search>BUSCAR <kbd>CTRL K</kbd></button></nav><span class="pixel-system-caption">UN PEQUEÑO UNIVERSO DIGITAL</span>`;
  desktop.prepend(topbar);
  const dock=document.createElement('div');
  dock.className='pixel-pinned';
  const pinned=['welcome','projects','terminal','arcade','contact'];
  function renderDock() {
    dock.innerHTML=pinned.map(id=>`<button data-pixel-dock="${id}" aria-label="${id==='welcome'?'Inicio':Apps[id].title}" title="${id==='welcome'?'Inicio':Apps[id].title}">${Apps[id].icon}<span>${id==='welcome'?'Inicio':Apps[id].title}</span><i aria-hidden="true"></i></button>`).join('');
  }
  document.querySelector('.taskbar__apps').before(dock);
  dock.addEventListener('click',e=>{
    const id=e.target.closest('[data-pixel-dock]')?.dataset.pixelDock;
    if(!id)return;
    const chip=document.querySelector(`.tb-app[data-id="${id}"]`);
    if(chip)chip.click();else openWindow(id);
  });
  const hiddenChips=document.createElement('style');
  hiddenChips.textContent=pinned.map(id=>`.pixel-system .tb-app[data-id="${id}"]`).join(',')+'{display:none}';
  document.head.append(hiddenChips);

  Apps.welcome={
    title:'Inicio // JOSEMI-OS',icon:Apps.readme.icon,size:[900,640],
    render:()=>`<div class="pixel-home"><div class="pixel-home-status"><span><i></i>MODO EXPLORACIÓN</span><span>PERSONAL / INTERACTIVO</span></div><div class="pixel-home-hero"><div class="pixel-profile-frame"><div class="pixel-portrait">${Apps.about.icon}</div><span>JOSEMI</span><small>ESTUDIANTE DE DAM</small><div class="pixel-profile-lights" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div></div><div class="pixel-home-copy"><span class="pixel-kicker">HOLA, MUNDO_</span><h1>Mi pequeño<br>universo digital<span class="pixel-cursor">_</span></h1><p>Soy José Miguel Miralles Gandia.<br>Aprendo a construir software y convierto mis ideas en proyectos que puedes explorar.</p><div class="pixel-home-actions"><button class="btn btn--accent" data-pixel-open="projects">ABRIR PROYECTOS →</button><button class="btn" data-pixel-open="about">SOBRE MÍ</button></div></div></div><div class="pixel-section-label"><span>SELECCIONA TU SIGUIENTE PASO</span><span>↓</span></div><div class="pixel-home-launchers"><button data-pixel-open="projects">${Apps.projects.icon}<span><strong>ARCHIVO DE PROYECTOS</strong><small>Código, ideas y aprendizaje.</small></span><b>01</b></button><button data-pixel-open="arcade">${Apps.arcade.icon}<span><strong>ARCADE</strong><small>Una partida antes de seguir.</small></span><b>02</b></button><button data-pixel-milo><span class="pixel-milo-spark" aria-hidden="true">✦</span><span><strong>HABLA CON MILO</strong><small>Tu ajolote con inteligencia artificial.</small></span><b>03</b></button></div><div class="pixel-home-footer"><span>CONSTRUIR · APRENDER · REPETIR</span><button data-pixel-open="contact">¿HABLAMOS? ↗</button></div></div>`,
    bind(body){
      body.addEventListener('click',launch);
    }
  };
  function launch(e) {
    const id=e.target.closest('[data-pixel-open]')?.dataset.pixelOpen;
    if(id)openWindow(id);
    if(e.target.closest('[data-pixel-search]'))togglePalette(true);
    if(e.target.closest('[data-pixel-milo]'))toggleMilo(true);
  }
  topbar.addEventListener('click',launch);
  renderDock();

  let pending=false;
  function synchronize() {
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{
      pending=false;
      const wins=[...desktop.querySelectorAll('.window:not(.minimized):not(.closing)')];
      const active=wins.sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))[0];
      const name=active?Apps[active.dataset.id]?.title:'ESCRITORIO';
      topbar.querySelector('.pixel-current-app').textContent=name||'ESCRITORIO';
      dock.querySelectorAll('[data-pixel-dock]').forEach(button=>{
        const win=desktop.querySelector(`.window[data-id="${button.dataset.pixelDock}"]:not(.closing)`);
        button.classList.toggle('is-open',!!win);
        button.classList.toggle('is-active',win===active);
      });
      desktop.querySelectorAll('.window:not([data-pixel-window])').forEach(win=>{
        win.dataset.pixelWindow='true';
        win.setAttribute('aria-label',Apps[win.dataset.id]?.title||'Ventana');
        if(win.dataset.id==='welcome') {
          win.classList.add('pixel-home-window');
          if(innerWidth>820) {
            win.style.left=Math.max(14,(innerWidth-win.offsetWidth)/2)+'px';
            win.style.top=Math.max(64,(innerHeight-win.offsetHeight-55)/2)+'px';
          }
        }
      });
    });
  }
  new MutationObserver(synchronize).observe(desktop,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  let openedHome=false;
  const startObserver=new MutationObserver(()=>{
    if(!openedHome&&!desktop.classList.contains('hidden')){
      openedHome=true;
      if(!desktop.querySelector('.window[data-id="welcome"]'))openWindow('welcome');
      startObserver.disconnect();synchronize();
    }
  });
  startObserver.observe(desktop,{attributes:true,attributeFilter:['class']});
  let small=innerWidth<=820;
  addEventListener('resize',()=>{
    if(small&&innerWidth>820)desktop.querySelectorAll('.window').forEach(win=>{
      const size=Apps[win.dataset.id]?.size||[640,500];
      const bounds=fitWindowBounds({width:size[0],height:size[1],left:(innerWidth-size[0])/2,top:70},innerWidth,innerHeight);
      Object.entries(bounds).forEach(([key,value])=>win.style[key]=value+'px');
    });
    small=innerWidth<=820;
  });
  document.fonts.ready.then(()=>{
    desktop.querySelectorAll('.boot-logo,.ascii-stage').forEach(el=>{if(typeof fitAsciiText==='function')fitAsciiText(el);});
  });
})();
