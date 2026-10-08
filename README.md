# JOSEMI-OS

Portfolio de José Miguel Miralles Gandia, estudiante de DAM. Landing personal y escritorio interactivo con iconos pixel art, juegos, Secret Vault y Milo, un asistente con respuestas locales.

## Tres archivos de la web

- index.html: presentación, proyectos, aficiones, contacto y estructura del escritorio y del chat.
- style.css: variables de colores, landing, ventanas, pixel art y adaptación a móvil.
- script.js: aplicaciones, ventanas, desbloqueos, preferencias, respuestas de Milo y motores de juegos.

No requiere instalar dependencias ni ejecutar una compilación. Abre index.html para explorar la versión local. Para futuras APIs, usa un servidor local como Live Server.

## Decisiones de arquitectura

1. Situación: había scripts superpuestos, configuración de servidor y una integración anterior de música. Decisión: usar solo HTML, CSS y JavaScript para la web y retirar la integración antigua. Consecuencia: una base más fácil de editar en clase; las APIs se conectarán después.
2. Situación: un visitante necesita saber quién soy antes de explorar un escritorio. Decisión: mostrar primero una landing con seis bloques y entrada voluntaria al escritorio. Consecuencia: presentación y contacto visibles sin aprender la interfaz.
3. Situación: el asistente debe funcionar antes de tener una API. Decisión: getLocalReply contiene respuestas públicas; getAssistantReply es el punto de futura conexión. Consecuencia: Milo funciona sin claves ni conexión a un modelo, y admite una integración posterior sin rehacer el chat.

## Trabajar en clase

Busca PUNTO DE CONEXIÓN PARA CLASE en script.js. getAssistantReply recibe el mensaje y devuelve un objeto con text y un app opcional. RAMAS contiene las respuestas locales. Pide a la IA del centro cambios concretos, conserva una copia, prueba en el navegador y guarda cada mejora real con un commit descriptivo.

El PDF personal de preparación de clase se entrega fuera del repositorio.

## Publicación

URL prevista: https://josemidev1-code.github.io/JOSEMI-OS/

En Settings > Pages, configura Deploy from a branch, main y / (root). .nojekyll desactiva el procesado de Jekyll. Los enlaces a los estilos y al script son relativos. La publicación y la consola deben comprobarse en la URL real; una prueba local no confirma producción.

## Verificación realizada

Pruebas locales en navegador: landing y escritorio, ventanas, minimizar/restaurar, respuestas incorrectas y correctas de la bóveda, persistencia tras recargar, inicio de los tres juegos, chat y texto tratado como texto, diseño a 390 px. Sin errores de JavaScript en esas pruebas.

Pendientes: auditoría Lighthouse en producción, foto y vídeo propios, API meteorológica y conexión de Milo a una IA. No se afirma una nota ni una puntuación Lighthouse sin medirla.

## Medios y créditos

Iconos y mascota: SVG inline construidos con cuadrículas de píxeles. Monitor: ilustración CSS. Juegos: motores conservados del proyecto original; JOSEMI Run usa niveles y dibujos propios como homenaje a los juegos de plataformas.

El fondo de God of War es la imagen externa elegida por Josemi:
https://i.pinimg.com/736x/f4/e8/4e/f4e84ea8a1b943cd82b816f685c04ef7.jpg
Se carga solo al activar el premio. Sus derechos pertenecen a sus titulares; el enlace no acredita autoría propia ni permiso de reutilización.

Las llaves y preferencias se guardan con localStorage en este navegador. La Secret Vault es un juego, no un sistema de seguridad. El chat guarda solo una conversación limitada en la página y no envía mensajes a un servidor en esta versión.
