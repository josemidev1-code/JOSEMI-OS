# JOSEMI Music

Per funcionar a GitHub Pages sense el PC encés, segueix **CLOUDFLARE-SETUP.md**. La configuració pública viu en el bloc `BEGIN music-config.js` del script únic.

## Prova local opcional

Des de l’arrel:

```bash
node tools/local/music-server.cjs
```

Obri http://localhost:3000. Pots pegar un enllaç YouTube. Per a cerca local, el servidor necessita YOUTUBE_API_KEY en l’entorn; no té endpoint Gemini local. Per a IA, configura la URL de Workers i el seu ALLOWED_ORIGIN adequat a l’origen des d’on proves.

Si només vols servir el frontend:

```bash
python3 -m http.server 3000
```

Python servix fitxers; no executa les rutes del servidor. L’objectiu de producció continua sent Pages + Worker.

## Comportament

Vídeo visible i targeta amb miniatura, títol i canal. Clic en Reproducir si autoplay es bloqueja. Ordres locals pausa/continua/volumen N. Tancar el panell deté la música i canviar de pestanya la pausa. No s’extrau àudio.

La benvinguda és una finestra tancable; no és un panell de fons ni un temporitzador. El tancament es recorda per navegador/origen.
