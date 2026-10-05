# JOSEMI-OS

> **Primer proyecto personal como desarrollador de José Miguel Miralles Gandia.**

JOSEMI-OS es mi portfolio convertido en un pequeño sistema operativo interactivo. No quería hacer una página típica de “sobre mí + proyectos + contacto”, así que decidí construir un espacio que se pueda explorar, abrir, tocar y descubrir.

## ¿Quién soy?

Soy **José Miguel Miralles Gandia**, estudiante de DAM (Desarrollo de Aplicaciones Multiplataforma) en el IES DR. Lluís Simarro y desarrollador de software en proceso.

Ahora mismo estoy trabajando especialmente con **HTML, CSS y JavaScript**, porque este portfolio es uno de los proyectos con los que estoy aprendiendo y mejorando. Me interesa mucho la informática, la inteligencia artificial y el potencial de combinar software, automatización y creatividad.

A largo plazo aspiro a desarrollar **automatizaciones y aplicaciones para grandes empresas**, apoyándome en la IA como herramienta para crear soluciones útiles, originales y cada vez mejores.

Fuera del código me gusta entrenar en el gimnasio, hacer deporte, practicar boxeo y salir a correr. También experimento con e-commerce y dropshipping.

## ¿Qué es esta web?

- Un **portfolio interactivo** presentado como un sistema operativo propio.
- Una forma de enseñar quién soy, qué estoy aprendiendo y qué construyo.
- Un laboratorio para practicar frontend, interacción, diseño y JavaScript.
- Un lugar con pequeñas aplicaciones, una terminal y un Arcade.
- Un proyecto que seguirá cambiando a medida que yo mejore como desarrollador.

## Cómo explorar JOSEMI-OS

- Haz **doble clic** en los iconos del escritorio para abrir aplicaciones.
- Arrastra las ventanas, minimízalas, maximízalas y redimensiónalas.
- Haz **clic derecho** sobre el escritorio para abrir acciones rápidas.
- Abre la **Terminal** y escribe `ayuda` para descubrir comandos.
- Entra en **Arcade** si te apetece jugar un rato.

## Escritorio animado

Abre **Ajustes** para elegir entre siete temas, cinco cursores, tres tamaños y la intensidad del movimiento. La intro empieza en negro con «Wake up, Neo» y «The Matrix has you», y después construye **JOSEMI-OS** con ruido digital, partículas orbitales y una onda de luz. Se puede saltar con Enter. **ASCII Studio** permite probar ocho efectos; **Ctrl+K** busca aplicaciones y juegos.

Hay ocho fondos animados: tormenta con rayos de `//`, lluvia, aurora, constelaciones, paisaje topográfico y tres variantes Matrix: verde clásico, verde con cian y profundidad. Sus columnas tienen velocidades, longitudes y brillo independientes. Puedes regular densidad y velocidad, ocultar la bienvenida y reducir el movimiento. Los fondos descansan mientras juegas o cambias de pestaña.

En Arcade hay Tetris, Pac-Man y **Mario Bros · JOSEMI Run**, un homenaje de plataformas con gráficos y tres mundos originales. Incluye salto de altura variable, correr, monedas, enemigos, escudo, puntos de control y controles táctiles. Sustituye al shooter anterior.

Las referencias y decisiones están documentadas en [DESIGN.md](DESIGN.md). Para verificar la lógica: `node tests/arcade.cjs`, `node tests/shell.cjs` y `node tests/platformer.cjs`.

## Cómo estudiar el código para clase

Los comentarios en español explican los bloques importantes sin repetir cada instrucción. Léelos siguiendo el orden de carga:

1. **index.html**: estructura del escritorio y orden de estilos y scripts.
2. **style.css**: estilos de base. **shell.css**: temas, ventanas, iconos y ajustes. **experience.css**: intro Matrix y presentación del nuevo juego.
3. **script.js**: datos del portfolio, registro de aplicaciones, gestor de ventanas, terminal, Tetris y Pac-Man.
4. **upgrade.js**: récords, pausa automática, firma del nombre, Arcade y Secret Vault.
5. **platformer.js**: datos de los mundos, física, colisiones, cámara, dibujo y entrada de teclado/táctil.
6. **shell.js**: personalización, intro, efectos del nombre, fondos animados, buscador y salvapantallas.

Para cada bloque pregúntate: **qué datos recibe, qué cambia y qué muestra**. `render()` construye la vista; `bind()` conecta los eventos. En el juego, `stepPlatform()` calcula y `draw()` dibuja. Las preferencias se guardan en el navegador; la web simula un escritorio y no controla el sistema operativo real.

## Easter eggs y acertijos

Hay secretos escondidos por el sistema: comandos que no están a simple vista, interacciones poco obvias, referencias geek y algún que otro acertijo.

No voy a poner aquí las soluciones. Si encuentras algo raro, probablemente no sea un bug.

## Proyecto

**Estado:** en desarrollo  
**Tecnologías principales:** HTML, CSS y JavaScript  
**GitHub:** `josemidev1-code`  
**Contacto:** `josemidev1@gmail.com`

---

`JOSEMI-OS // build, learn, repeat.`
