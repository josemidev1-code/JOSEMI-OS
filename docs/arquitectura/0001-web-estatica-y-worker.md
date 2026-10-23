# ADR 001 · Web estática y API en un Worker

Estado: implementado; documentado el 23 de octubre de 2026.

**Situación.** El portfolio necesita publicarse como archivos estáticos y utilizar APIs con credenciales. Una clave incluida en JavaScript público sería visible para cualquiera.

**Decisión implementada.** GitHub Pages sirve HTML, CSS, JavaScript y medios desde `main`. `milo-ai.js` llama al Worker de Cloudflare; `worker.js` consulta Groq, Tavily y Open-Meteo. Las claves se configuran como Secrets fuera del repositorio. Las órdenes conocidas de la interfaz se ejecutan localmente con una lista de acciones permitidas.

**Consecuencias.** El frontend se publica sin compilación y no contiene claves de proveedores. La parte remota depende de Cloudflare y de las APIs: debe manejar errores, límites y tiempos máximos. CORS no es autenticación; el limitador por IP es aproximado y no una cuota global de gasto. El cliente y el servidor deben mantener sincronizado el contrato de herramientas, cubierto por pruebas.

**Alternativa.** Un servidor único podría servir página y APIs, pero requeriría mantener otra infraestructura. Un frontend que llamase directamente a las APIs con claves las expondría y no es aceptable.
