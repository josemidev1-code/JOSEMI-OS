# Guía para defender JOSEMI-OS

Guion para practicar con tus palabras. Las frases son una ayuda; leerlas no demuestra que domines el código. No presentes como tuyas habilidades que todavía no puedas explicar.

## Recorrido de cinco minutos

**0:00–0:45 · Quién soy.** Abre Inicio: «Soy José Miguel, estudio DAM en el IES Dr. Lluís Simarro y me interesa convertir mi curiosidad por la tecnología en aplicaciones. Mi portfolio tiene forma de escritorio porque relaciona mi interés por los videojuegos con lo que estoy aprendiendo a programar».

**0:45–1:30 · Casos reales.** Abre Proyectos: siete proyectos reales con reto, solución y resultado. Elige uno que domines (por ejemplo System Plast: 21 fichas generadas con Python desde un único JSON) y cuéntalo en tres frases. Los datos de cada caso salen de su repositorio; no presentes como clientes a System Plast ni a Nuria Cerdá si no lo son. Enseña también el bloque «En directo desde GitHub»: en F12 → Red aparece la petición a `api.github.com/users/josemidev1-code/repos`, responde 200 y el widget pinta el número de repos, los lenguajes y el último cambio. Recorrido: navegador → URL → JSON → campo → pantalla, sin claves.

**1:30–2:30 · Una petición de datos.** Abre Milo y pregunta «¿Qué tiempo hace en Xàtiva?». En F12 → Red, filtra por `/weather`. Enseña una petición que termine en 200 y los campos `city`, `temperature_c` y `source`. Si no aparece, no finjas: comprueba la petición real y explica el fallo. El recorrido es navegador → Worker → geocodificación de Open-Meteo → previsión → JSON → respuesta visible. Una pregunta libre pasa por `/chat` y Groq; una búsqueda, por `/search` y Tavily.

**2:30–3:15 · Estado e interacción.** Cambia un ajuste y recarga para demostrar que se conserva. Abre Bloc de notas o Calculadora. Explica que las preferencias y notas se guardan en ese navegador, no en una cuenta en la nube. No borres datos para la demostración sin guardarlos antes.

**3:15–4:15 · Diseño y medios.** Enseña la entrada de Arcade con moneda y su alternativa con botón, los iconos y la demo MP4 del proyecto. Todos los iconos (y el favicon) salen de `src/core/pixel-icons.js`: una paleta cerrada de 27 colores y mapas de 16×16 caracteres con contorno, luz desde arriba a la izquierda y tres tonos por color. Puedes abrir el archivo y señalar cómo una letra es un color. Explica que cada escena pixel art utiliza su propia animación y que «Reducir movimiento» permite detenerla. La demo tiene controles, subtítulos, descripción y `preload="none"`: no se descarga sola al abrir el proyecto.

**4:15–5:00 · Proceso y límites.** Abre el historial y las PR #13 y #14: muestran simplificación del escritorio, auditorías y pruebas. Enseña las decisiones de arquitectura y los informes Lighthouse archivados. Reconoce lo pendiente: la fotografía personal, la organización futura del código y lo que todavía estés aprendiendo.

## Diez preguntas que debes poder responder

1. **¿Dónde está el HTML?** `index.html` monta el arranque y el escritorio. Los contenidos de las ventanas se generan desde el registro `Apps` en JavaScript. Los estilos están separados en CSS.
2. **¿Qué hace JavaScript?** Abre y mueve ventanas, responde a eventos, mantiene estado, dibuja animaciones y conecta Milo con datos externos.
3. **¿Qué es una API?** Una interfaz para pedir datos o acciones a otro servicio. En este proyecto el navegador envía JSON al Worker y recibe JSON para mostrarlo.
4. **¿Por qué hay un Worker?** GitHub Pages sirve archivos estáticos. El Worker realiza las consultas que necesitan claves y aplica controles de uso. Las claves viven en Secrets de Cloudflare.
5. **¿Milo siempre consulta una IA?** No. Órdenes conocidas como «abre proyectos» se resuelven localmente. Las conversaciones libres utilizan Groq; buscar y consultar el tiempo usan otros servicios. La demo muestra una orden local.
6. **¿Puede controlar mi ordenador?** No. Sus acciones están limitadas a aplicaciones y ajustes de esta web mediante listas permitidas. No ejecuta comandos del sistema.
7. **¿Hay un login real?** No. El arranque imita un sistema operativo. Secret Vault es un juego con acertijos, no autenticación ni un lugar para documentos privados.
8. **¿Qué guarda localStorage?** Ajustes, notas y progreso local. Persiste en ese navegador, puede borrarse y no sincroniza dispositivos. Nunca guardamos ahí claves privadas de APIs.
9. **¿Qué pasa si una API falla?** Hay mensajes de error, tiempos máximos y límites de peticiones. El limitador de Cloudflare es aproximado por IP y ubicación; no garantiza un techo global de gasto.
10. **¿Has utilizado IA para programar?** Sí: la IA ha ayudado a generar y revisar código. La defensa debe explicar qué se ha cambiado, cómo se ha comprobado y qué limitaciones quedan. No atribuyas a una prueba automática comprobaciones manuales que no has hecho.

## Antes de entregar

- Abre la URL pública, no solo la vista local; prueba móvil, contacto y Milo.
- Comprueba F12 sin errores y una respuesta real de API; no confundas una respuesta local con una llamada externa.
- Lleva los informes y un enlace al repositorio. Lighthouse es una medición puntual, no garantía de accesibilidad completa.
- Practica el recorrido sin memorizar todo. Si no puedes explicar una parte, repásala antes de defenderla.
- Añade una foto personal o de tu espacio de trabajo solo si quieres publicarla y tienes derecho a hacerlo. No se ha inventado ninguna fotografía propia.
