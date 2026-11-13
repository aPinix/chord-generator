async (page) => {
  const dir = '/Users/apinix/git/aPinix/apps/chord-generator/.github/assets';
  const browser = page.context().browser();
  const done = [];
  const ONLY = ['__none__'];

  const open = async (theme, opts = {}) => {
    const ctx = await browser.newContext({
      viewport: opts.viewport ?? { width: 1440, height: 900 },
      deviceScaleFactor: 2,
      colorScheme: theme,
      hasTouch: !!opts.touch,
      isMobile: !!opts.touch,
    });
    await ctx.addInitScript((t) => {
      try { localStorage.setItem('theme', t); } catch {}
    }, theme);
    const p = await ctx.newPage();
    await p.goto('http://localhost:3000/');
    await p.waitForTimeout(2500);
    await p.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
    await p.getByRole('button', { name: theme === 'dark' ? 'Dark theme' : 'Light theme' }).first().click();
    await p.mouse.move(5, 5);
    await p.waitForTimeout(400);
    return { ctx, p };
  };
  const load = async (p, q) => {
    const input = p.getByPlaceholder(/Find a chord/);
    await input.fill(q);
    await p.waitForTimeout(500);
    await input.press('Enter');
    await p.waitForTimeout(500);
    await p.mouse.move(5, 5);
  };

  // Dark hero
  if (ONLY.length === 0 || ONLY.includes('// Dark hero'))
  {
    const { ctx, p } = await open('dark');
    await load(p, 'Cmaj7');
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${dir}/hero-dark.png` });
    done.push('hero-dark');
    await ctx.close();
  }

  // Fingering suggestion with preview
  if (ONLY.length === 0 || ONLY.includes('// Fingering suggestion with preview'))
  for (const theme of ['light', 'dark']) {
    const { ctx, p } = await open(theme);
    await p.getByRole('button', { name: 'A string, fret 2', exact: true }).first().click();
    await p.getByRole('button', { name: 'D string, fret 2', exact: true }).first().click();
    await p.mouse.move(5, 5);
    await p.waitForTimeout(600);
    await p.getByRole('button', { name: /Use the usual/ }).hover();
    await p.waitForTimeout(600);
    const callout = await p.getByRole('button', { name: /Use the usual/ }).boundingBox();
    const legend = await p.getByRole('button', { name: /Mute all|Open all/ }).boundingBox();
    const top = callout.y - 28;
    await p.screenshot({
      path: `${dir}/suggestion-${theme}.png`,
      clip: { x: legend.x - 28, y: top, width: 820, height: 400 },
    });
    done.push('suggestion-' + theme);
    await ctx.close();
  }

  // Browse dialog
  if (ONLY.length === 0 || ONLY.includes('// Browse dialog'))
  for (const theme of ['light', 'dark']) {
    const { ctx, p } = await open(theme);
    await p.keyboard.press('Meta+k');
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${dir}/browse-${theme}.png` });
    done.push('browse-' + theme);
    await ctx.close();
  }

  // Tuning menu
  if (ONLY.length === 0 || ONLY.includes('// Tuning menu'))
  for (const theme of ['light', 'dark']) {
    const { ctx, p } = await open(theme);
    await load(p, 'D');
    await p.getByRole('button', { name: /^Tuning:/ }).click();
    await p.waitForTimeout(500);
    await p.getByRole('button', { name: /Drop D/ }).click();
    await p.waitForTimeout(500);
    const menu = await p.getByRole('list', { name: 'Preset tunings' }).locator('xpath=ancestor::*[@data-slot="popover-content" or @role="dialog"][1]').boundingBox();
    const trigger = await p.getByRole('button', { name: /^Tuning:/ }).boundingBox();
    const x0 = Math.min(trigger.x, menu.x) - 32, y0 = Math.min(trigger.y, menu.y) - 32;
    const x1 = Math.max(trigger.x + trigger.width, menu.x + menu.width) + 32;
    const y1 = Math.max(trigger.y + trigger.height, menu.y + menu.height) + 32;
    await p.screenshot({
      path: `${dir}/tuning-${theme}.png`,
      clip: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
    });
    done.push('tuning-' + theme);
    await ctx.close();
  }

  // Export panel
  if (ONLY.length === 0 || ONLY.includes('// Export panel'))
  for (const theme of ['light', 'dark']) {
    const { ctx, p } = await open(theme);
    await load(p, 'Am7');
    const heading = p.getByRole('heading', { name: /Your chord diagram/ });
    await heading.scrollIntoViewIfNeeded();
    await p.waitForTimeout(1200);
    await p.evaluate(() => window.scrollBy(0, 1e4));
    await p.waitForTimeout(600);
    const h = await heading.boundingBox();
    const mat = await p.locator('.preview-mat').boundingBox();
    await p.screenshot({
      path: `${dir}/export-${theme}.png`,
      fullPage: true,
      clip: { x: 0, y: h.y + (await p.evaluate(() => window.scrollY)) - 48, width: 1440, height: mat.y + mat.height - h.y + 96 },
    });
    done.push('export-' + theme);
    await ctx.close();
  }

  // Zen mode
  if (ONLY.length === 0 || ONLY.includes('// Zen mode'))
  {
    const { ctx, p } = await open('dark');
    await load(p, 'G');
    await p.getByRole('button', { name: /Zen mode/ }).click();
    await p.waitForTimeout(1200);
    await p.mouse.move(820, 520);
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${dir}/zen.png` });
    done.push('zen');
    await ctx.close();
  }

  // Phone
  for (const theme of ['light', 'dark']) {
    const { ctx, p } = await open(theme, { viewport: { width: 390, height: 844 }, touch: true });
    await load(p, 'Am');
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${dir}/mobile-${theme}.png` });
    done.push('mobile-' + theme);
    await ctx.close();
  }

  return done;
}
