/* Qualify only the staged, source-owned stdlib Space on loopback.
 * Its all-zero source revision is an explicit local fixture, never a release.
 * Requires the existing Playwright dev dependency; does not publish anything.
 * SPDX-License-Identifier: Apache-2.0 */
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '..');
const out = path.resolve(process.env.UNIFY_QA_OUT || path.join(root, 'artifacts/native-frontend'));
const port = Number(process.env.UNIFY_QA_PORT || 7892);
assert.ok(Number.isInteger(port) && port > 1024 && port < 65536);
const origin = `http://127.0.0.1:${port}`;
const checks = [], observations = [];
const check = (name, pass, detail = null) => checks.push({ name, pass: Boolean(pass), detail });
const hash = b => createHash('sha256').update(b).digest('hex');

async function inspect(page, forced = false) {
  return page.evaluate(({ forced }) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    function rgba(value) {
      if (!CSS.supports('color', value)) throw new Error('Unsupported computed color: ' + value);
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
      const c = [...ctx.getImageData(0, 0, 1, 1).data]; c[3] /= 255; return c;
    }
    function over(a, b) { const alpha = a[3] + b[3] * (1 - a[3]); return alpha ? [0, 1, 2].map(i => (a[i] * a[3] + b[i] * b[3] * (1 - a[3])) / alpha).concat(alpha) : [0, 0, 0, 0]; }
    function luminance(c) { return c.slice(0, 3).map(x => x / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4).reduce((n, x, i) => n + x * [.2126, .7152, .0722][i], 0); }
    function ratio(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
    const backgrounds = new WeakMap();
    function backdrop(el) {
      if (!el) return [[255, 255, 255, 1]];
      if (backgrounds.has(el)) return backgrounds.get(el);
      const s = getComputedStyle(el), lower = backdrop(el.parentElement), base = lower.map(c => over(rgba(s.backgroundColor), c));
      const colors = s.backgroundImage === 'none' ? [] : (s.backgroundImage.match(/(?:rgba?|color)\([^()]+\)/g) || []).map(rgba);
      const values = colors.length ? base.flatMap(c => [c, ...colors.map(stop => over(stop, c))]) : base;
      const unique = [...new Map(values.map(c => [c.map(x => Math.round(x)).join(','), c])).values()].slice(0, 24);
      backgrounds.set(el, unique); return unique;
    }
    function visible(el) { return el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) && el.getBoundingClientRect().height > 0; }
    function boundedScroller(el) { for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p), r = p.getBoundingClientRect(); if (/(auto|scroll)/.test(s.overflowX) && r.left >= -1 && r.right <= innerWidth + 1) return true; } return false; }
    const textFailures = [], overflow = [], uncertain = [];
    let textPairs = 0;
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let text; (text = walk.nextNode());) {
      const label = text.textContent.trim(), el = text.parentElement;
      if (!label || !el || el.closest('script,style,svg') || !visible(el) || el.closest('[disabled]')) continue;
      const s = getComputedStyle(el), range = document.createRange(); range.selectNodeContents(text);
      const rect = range.getBoundingClientRect(); if (!rect.width || !rect.height) continue;
      if ((rect.left < -1 || rect.right > innerWidth + 1) && !boundedScroller(el) && !el.closest('.skip-link')) overflow.push({ text: label.slice(0, 90), left: rect.left, right: rect.right });
      if (forced) continue;
      if (Number(s.opacity) !== 1) { uncertain.push(label.slice(0, 70)); continue; }
      const foreground = rgba(s.color), bg = backdrop(el), measured = Math.min(...bg.map(c => ratio(over(foreground, c), c)));
      const large = Number.parseFloat(s.fontSize) >= 24 || (Number.parseFloat(s.fontSize) >= 18.6667 && Number.parseFloat(s.fontWeight) >= 700);
      const minimum = large ? 3 : 4.5; textPairs++;
      if (measured < minimum) textFailures.push({ text: label.slice(0, 110), foreground: s.color, ratio: +measured.toFixed(3), minimum });
    }
    const targets = [], unlabeled = [];
    for (const el of document.querySelectorAll('button,input:not([type="hidden"]),select,textarea,nav a')) {
      if (!visible(el)) continue;
      const box = (el.matches('input[type="checkbox"]') && el.closest('label') || el).getBoundingClientRect();
      if (!el.disabled && (box.width < 43.9 || box.height < 43.9)) targets.push({ text: (el.textContent || el.getAttribute('aria-label') || el.name).trim().slice(0, 90), tag: el.tagName, width: box.width, height: box.height });
      if (el.matches('button,input,select,textarea') && !el.getAttribute('aria-label') && !el.getAttribute('aria-labelledby') && !el.labels?.length && !el.textContent.trim() && !el.getAttribute('title')) unlabeled.push(el.outerHTML.slice(0, 200));
    }
    return { viewport: innerWidth, documentWidth: document.documentElement.scrollWidth, h1Count: [...document.querySelectorAll('h1')].filter(visible).length, textPairs, textFailures, uncertain, overflow, targets, unlabeled, animations: document.getAnimations().filter(a => a.playState === 'running').length };
  }, { forced });
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const runtime = fs.mkdtempSync(path.join(out, 'runtime-'));
  const python = "import os,runpy;from pathlib import Path;p=runpy.run_path('scripts/publish_space.py');d=Path(os.environ['UNIFY_QA_RUNTIME']);files=p['payload']('0'*40);[(d/n).write_bytes(b) for n,b in files.items()];runpy.run_path(str(d/'server.py'),run_name='__main__')";
  const log = fs.createWriteStream(path.join(out, 'preview.log'));
  const server = spawn(process.env.PYTHON || 'python3', ['-B', '-c', python], { cwd: root, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', UNIFY_QA_RUNTIME: runtime, HOST: '127.0.0.1', PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.pipe(log); server.stderr.pipe(log);
  let browser;
  async function open(options = {}, fixture = null) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', ...options });
    const page = await context.newPage(), errors = [], requests = [], refused = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => {
      const r = route.request(), url = new URL(r.url()); requests.push({ method: r.method(), path: url.pathname });
      if (url.origin !== origin || !['GET', 'HEAD'].includes(r.method())) { refused.push(r.method() + ' ' + url.origin + url.pathname); return route.abort(); }
      if (fixture && url.pathname === '/api/build-info') return route.fulfill(fixture);
      return route.continue();
    });
    await page.goto(origin, { waitUntil: 'networkidle', timeout: 15000 });
    return { context, page, errors, requests, refused };
  }
  function traffic(label, current, expectedReads) {
    check(label + ': no errors, external requests or writes', !current.errors.length && !current.refused.length, { errors: current.errors, refused: current.refused });
    check(label + ': bounded source read count', current.requests.filter(r => r.path === '/api/build-info').length === expectedReads, current.requests);
  }
  try {
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      if (server.exitCode !== null) throw new Error('Staged runtime exited');
      try { if ((await fetch(origin, { signal: AbortSignal.timeout(1000), redirect: 'error' })).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, 'Staged runtime must start');
    browser = await chromium.launch({ headless: true, ...(process.env.UNIFY_BROWSER ? { executablePath: process.env.UNIFY_BROWSER } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const width of [2560, 1920, 1440, 1024, 768, 640, 375, 320]) {
      const current = await open({ viewport: { width, height: 1000 } });
      await current.page.getByText('Local source bytes verified', { exact: true }).waitFor();
      for (const theme of ['dark', 'light']) {
        if (theme === 'light') await current.page.getByRole('button', { name: 'Use light appearance' }).click();
        const result = await inspect(current.page);
        observations.push({ width, theme, ...result });
        check(`${width}px ${theme}: reflow, labels, targets, text and reduced motion`, result.documentWidth <= width + 1 && result.h1Count === 1 && !result.overflow.length && !result.targets.length && !result.unlabeled.length && !result.textFailures.length && !result.uncertain.length && !result.animations, result);
        if ([1440, 320].includes(width)) {
          await current.page.screenshot({ path: path.join(out, `${width}-${theme}.png`), fullPage: true });
          await current.page.screenshot({ path: path.join(out, `${width}-${theme}-viewport.png`), fullPage: false });
        }
      }
      traffic(`${width}px`, current, 1);
      await current.context.close();
    }
    const landscape = await open({ viewport: { width: 844, height: 390 } });
    const landscapeResult = await inspect(landscape.page);
    observations.push({ mode: 'landscape', ...landscapeResult });
    check('landscape: responsive viewport without clipped content', landscapeResult.documentWidth <= 845 && !landscapeResult.overflow.length && !landscapeResult.textFailures.length && !landscapeResult.targets.length && !landscapeResult.unlabeled.length, landscapeResult);
    traffic('landscape', landscape, 1);
    await landscape.context.close();
    for (const mode of [{ label: 'forced', forcedColors: 'active' }, { label: 'contrast', contrast: 'more' }, { label: 'no-js', javaScriptEnabled: false }, { label: 'print' }]) {
      const { label, ...options } = mode;
      const current = await open({ viewport: { width: 320, height: 900 }, ...options });
      if (label === 'print') await current.page.emulateMedia({ media: 'print' });
      const result = await inspect(current.page, label === 'forced');
      observations.push({ mode: label, ...result });
      check(`${label}: useful visible source and contained reflow`, result.documentWidth <= 321 && !result.overflow.length && !result.textFailures.length && !result.targets.length && !result.unlabeled.length && await current.page.getByRole('link', { name: 'Open identity JSON' }).isVisible(), result);
      if (label === 'no-js') check('no-js: source declarations remain visible without inert controls', !await current.page.locator('#appearance').isVisible() && !await current.page.locator('#refresh-identity').isVisible() && await current.page.getByRole('heading', { level: 1 }).isVisible());
      traffic(label, current, label === 'no-js' ? 0 : 1);
      await current.page.screenshot({ path: path.join(out, `${label}.png`), fullPage: true });
      await current.context.close();
    }
    const keyboard = await open({ viewport: { width: 320, height: 900 } });
    await keyboard.page.keyboard.press('Tab');
    check('keyboard: skip link is first and visible', await keyboard.page.locator('.skip-link').evaluate(el => document.activeElement === el && el.getBoundingClientRect().top >= 0));
    await keyboard.page.keyboard.press('Enter');
    check('keyboard: skip link focuses main', await keyboard.page.locator('main').evaluate(el => document.activeElement === el));
    await keyboard.page.getByRole('region', { name: 'Source declarations and retained observations' }).focus();
    await keyboard.page.keyboard.press('ArrowRight');
    await keyboard.page.waitForFunction(() => document.querySelector('.evidence-table-wrap').scrollLeft > 0);
    check('keyboard: full source table remains scrollable', await keyboard.page.locator('.evidence-table-wrap').evaluate(el => el.scrollLeft > 0));
    await keyboard.page.getByRole('button', { name: 'Check again' }).click();
    await keyboard.page.getByText('Local source bytes verified', { exact: true }).waitFor();
    check('manual refresh preserves exact source binding', await keyboard.page.locator('#identity-revision').getAttribute('href') === 'https://github.com/szl-holdings/holographic-unify/tree/' + '0'.repeat(40));
    traffic('keyboard and manual refresh', keyboard, 2);
    await keyboard.context.close();
    const identity = { schema: 'szl.build-info/v1', source_repository: 'szl-holdings/holographic-unify', source_revision: 'a'.repeat(40), state: 'LOCAL_BYTES_VERIFIED', build: { state: 'OBSERVED', revision: 'a'.repeat(40) }, receipt_minted: false, signature: 'UNSIGNED-honest' };
    for (const fixture of [
      { label: 'HTTP 503', status: 503, body: '{}' },
      { label: 'invalid JSON', status: 200, body: '<script>unexpected()</script>' },
      { label: 'foreign repository', status: 200, body: JSON.stringify({ ...identity, source_repository: 'untrusted/example' }) },
      { label: 'mismatched revision', status: 200, body: JSON.stringify({ ...identity, source_revision: 'b'.repeat(40) }) },
      { label: 'invented receipt', status: 200, body: JSON.stringify({ ...identity, receipt_minted: true }) },
    ]) {
      const { label, ...response } = fixture;
      const current = await open({ viewport: { width: 375, height: 900 } }, { ...response, contentType: 'application/json' });
      await current.page.getByText('Source binding unavailable', { exact: true }).waitFor();
      check(label + ': no false verification or source link', !await current.page.locator('#identity-revision').isVisible() && !await current.page.getByText('Local source bytes verified', { exact: true }).count());
      traffic(label, current, 1);
      await current.context.close();
    }
    for (const pathname of ['/szl-tokens.css', '/szl-source.json', '/szl-projection.json', '/szl-icon-32.svg', '/favicon.svg', '/apple-touch-icon.png', '/unify.css', '/unify.js']) {
      const response = await fetch(origin + pathname, { redirect: 'error', signal: AbortSignal.timeout(5000) });
      const served = Buffer.from(await response.arrayBuffer());
      check('served bytes ' + pathname, response.ok && hash(served) === hash(fs.readFileSync(path.join(root, 'space', pathname.slice(1)))));
    }
  } finally {
    if (browser) await browser.close();
    server.kill(); log.end();
    await new Promise(resolve => { if (server.exitCode !== null) return resolve(); server.once('exit', resolve); setTimeout(resolve, 3000); });
    fs.rmSync(runtime, { recursive: true, force: true });
    const failures = checks.filter(c => !c.pass);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ schema: 'szl.local-presentation-observation.v1', unsigned: true, scope: 'Staged source UI with an all-zero local-fixture revision; not deployment or model evidence', playwright: require('playwright/package.json').version, createdAt: new Date().toISOString(), checks, observations }, null, 2) + '\n');
    console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failures.length, failures }, null, 2));
    if (failures.length) process.exitCode = 1;
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
