# Video de RIP PACKS

Escena 3D (Three.js) que se renderiza cuadro por cuadro y se exporta a `public/brand/rip.webm|mp4|-poster.webp`.

1. `npm i three@0.170.0` en esta carpeta y copia a `assets/`: `pack.webp` (sobre), `hit.png` (carta hit), `back.jpg` (reverso).
2. Renombra `scene.html` a `index.html` y sírvela: `python3 -m http.server 8811`.
3. `node render.js ./frames` (5 subcuadros por cuadro para el desenfoque de movimiento).
4. Promedia los subcuadros por cuadro y codifica con ffmpeg (VP9 crf 33 y H.264 crf 22, 30 fps).

Tiempos (2.9 s, el último cuadro = el primero): tira abierta y glow creciendo 0–0.45 s · sale el sobre 0.45 · sube el reverso 0.46–0.58 · flota con destellos · volteo 1.04–1.15 · hit hasta 2.28 · se guarda 2.28–2.42 · regresa el sobre 2.40–2.62 · la tira se reabre 2.55–2.85.
