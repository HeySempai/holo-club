const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const D = process.argv[2]; const FPS = 30, SUB = 5, SHUTTER = 0.6;
  const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1440, height: 640 } });
  await p.goto('http://localhost:8811/index.html'); await p.waitForFunction(()=>window.ready, null, {timeout: 60000});
  const T = await p.evaluate(()=>window.T); const N = Math.round(T * FPS);
  for (let f = 0; f < N; f++) {
    for (let k = 0; k < SUB; k++) {
      const t = (f + (k / SUB - 0.5) * SHUTTER) / FPS;
      const buf = await p.evaluate((t) => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/png'); }, t);
      fs.writeFileSync(`${D}/f${String(f).padStart(3,'0')}_${k}.png`, Buffer.from(buf.split(',')[1], 'base64'));
    }
  }
  console.log('frames', N); await b.close();
})();
