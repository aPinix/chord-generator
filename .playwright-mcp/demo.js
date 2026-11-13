async (page) => {
  const browser = page.context().browser();
  const dir = '/Users/apinix/git/aPinix/apps/chord-generator/.playwright-mcp/video';
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  // A visible cursor, since recordings don't show the real one
  await ctx.addInitScript(() => {
    const install = () => {
      if (document.getElementById('demo-cursor')) return;
      const c = document.createElement('div');
      c.id = 'demo-cursor';
      c.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(16,37,30,.28);border:2px solid rgba(255,255,255,.95);box-shadow:0 1px 4px rgba(0,0,0,.35);pointer-events:none;z-index:2147483647;transition:transform .12s ease, background .12s ease;';
      document.documentElement.appendChild(c);
      addEventListener('mousemove', (e) => { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; }, true);
      addEventListener('mousedown', () => { c.style.transform = 'scale(.7)'; c.style.background = 'rgba(225,29,72,.5)'; }, true);
      addEventListener('mouseup', () => { c.style.transform = ''; c.style.background = 'rgba(16,37,30,.28)'; }, true);
      const s = document.createElement('style');
      s.textContent = 'nextjs-portal{display:none!important}';
      document.documentElement.appendChild(s);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install); else install();
  });
  const p = await ctx.newPage();
  const wait = (ms) => p.waitForTimeout(ms);
  // Move like a hand would: in steps, towards the centre of an element
  let pos = { x: 640, y: 400 };
  const moveTo = async (x, y, steps = 18) => { await p.mouse.move(x, y, { steps }); pos = { x, y }; };
  const goto = async (locator, steps = 18) => {
    const b = await locator.boundingBox();
    await moveTo(b.x + b.width / 2, b.y + b.height / 2, steps);
    return b;
  };
  const click = async (locator, pause = 500) => { await goto(locator); await wait(120); await p.mouse.down(); await wait(70); await p.mouse.up(); await wait(pause); };

  await p.goto('http://localhost:3000/');
  await p.getByRole('button', { name: 'Light theme' }).first().click();
  await p.mouse.move(640, 400);
  await wait(1500);

  // Frames, as fast as the page allows; their file times pace the video
  let recording = true;
  let frame = 0;
  const recorder = (async () => {
    while (recording) {
      const name = String(frame++).padStart(5, '0');
      try { await p.screenshot({ path: `${dir}/f${name}.jpg`, type: 'jpeg', quality: 88 }); } catch {}
    }
  })();
  await wait(600);

  // Popular chords play as you pick them
  for (const n of ['G', 'C', 'D', 'Em']) {
    await click(p.getByRole('button', { name: new RegExp(`^${n}, frets`) }), 900);
  }

  // Build a chord by hand; the usual fingering is offered
  await click(p.getByRole('button', { name: 'Clear' }), 500);
  await click(p.getByRole('button', { name: 'A string, fret 2', exact: true }).first(), 350);
  await click(p.getByRole('button', { name: 'D string, fret 2', exact: true }).first(), 700);
  await goto(p.getByRole('button', { name: /Use the usual/ }), 22);
  await wait(1300);
  await click(p.getByRole('button', { name: /Use the usual/ }), 900);
  await click(p.getByRole('button', { name: 'Strum', exact: true }), 1200);

  // Browse the library
  await goto(p.getByRole('button', { name: /Browse/ }));
  await wait(200);
  await p.keyboard.press('Meta+k');
  await wait(900);
  await p.keyboard.type('maj7', { delay: 110 });
  await wait(700);
  await p.keyboard.press('ArrowDown'); await wait(250);
  await p.keyboard.press('ArrowRight'); await wait(250);
  await p.keyboard.press('ArrowRight'); await wait(350);
  await p.keyboard.press('Space'); await wait(900);
  await p.keyboard.press('Enter'); await wait(1100);

  // Tuning
  await click(p.getByRole('button', { name: /^Tuning:/ }), 700);
  await click(p.getByRole('button', { name: /Drop D/ }), 700);
  await p.keyboard.press('Escape'); await wait(600);
  await click(p.getByRole('button', { name: 'Back to standard tuning' }), 700);

  // Dark mode
  await click(p.getByRole('button', { name: 'Dark theme' }).first(), 1000);

  // Zen mode: strum with the pick
  await click(p.getByRole('button', { name: /^G, frets/ }), 600);
  await click(p.getByRole('button', { name: /Zen mode/ }), 1300);
  await moveTo(640, 170, 20); await wait(300);
  for (let i = 0; i < 3; i++) {
    await p.mouse.down(); await moveTo(660, 640, 22); await p.mouse.up(); await wait(450);
    await moveTo(640, 170, 14); await wait(250);
  }
  await wait(600);
  await p.keyboard.press('Escape');
  await wait(1200);

  recording = false;
  await recorder;
  await ctx.close();
  return frame;
}
