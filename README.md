# JOSEMI-OS

Portfolio de José Miguel Miralles Gandia, estudiante de Desarrollo de Aplicaciones Multiplataforma. Una web con escritorio, ventanas y estética pixel art.

[Abrir JOSEMI-OS](https://josemidev1.site/) · [GitHub](https://github.com/josemidev1-code) · [Contacto](mailto:josemidev1@gmail.com)

## Funciones

- Arranque Matrix y escritorio con ventanas que se pueden mover, minimizar y cerrar.
- Sobre mí, proyectos, habilidades y contacto.
- Terminal, buscador de aplicaciones y monitor del sistema.
- Arcade con Tetris, Pac-Man y JOSEMI Run.
- Secret Vault con acertijos y fondos desbloqueables.
- Diez fondos pixel art, iconos personalizados y salvapantallas ASCII.
- Milo, un ajolote con respuestas locales sobre el portfolio.
- Preferencias guardadas en el navegador y adaptación a móvil.

## Estructura

La web utiliza HTML, CSS y JavaScript, sin proceso de compilación.

| Archivo | Contenido |
| --- | --- |
| `index.html` | Arranque y estructura del escritorio |
| `style.css` | Diseño, ventanas, iconos y adaptación a pantallas |
| `script.js` | Aplicaciones, juegos, fondos, preferencias y asistente |

`CNAME` configura el dominio. `.nojekyll` permite publicar la web estática con GitHub Pages y `.gitignore` excluye configuración privada y archivos locales.

## Arquitectura

**Archivos separados.** La estructura, el diseño y la interacción se mantienen en HTML, CSS y JavaScript para facilitar el mantenimiento y publicar directamente en GitHub Pages.

**Estado local.** Los ajustes, récords y llaves de Secret Vault utilizan `localStorage`. Se conservan al recargar en el mismo navegador y no requieren una cuenta ni un servidor. Los acertijos son una función de juego, no un sistema de autenticación.

**Recursos gráficos integrados.** Los iconos y fondos pixel art se dibujan con SVG; el salvapantallas utiliza Canvas y texto ASCII. La galería mantiene el encuadre centrado y respeta las opciones de movimiento reducido.

Milo utiliza respuestas predefinidas. Actualmente no realiza consultas a un modelo de IA ni a un servicio meteorológico.

## Publicación

GitHub Pages publica la raíz de la rama `main`. Las rutas de los estilos y scripts son relativas y el dominio es [josemidev1.site](https://josemidev1.site/).

## Referencias gráficas

Los fondos reinterpretan estéticas de ciencia ficción y videojuegos mediante dibujos propios de bloques. Milo se inspira en el ajolote de Minecraft y el terminal ASCII en el salvapantallas de Omarchy.

El fondo fotográfico desbloqueable de God of War utiliza una [imagen externa](https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg). Las fuentes proceden de Google Fonts.
