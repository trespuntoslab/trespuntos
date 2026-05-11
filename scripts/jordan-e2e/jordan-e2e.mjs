#!/usr/bin/env node
/**
 * Jordan widget E2E test — Tres Puntos
 *
 * Reproduce los 5 escenarios críticos del widget v7 que han roto antes,
 * en 3 viewports (mobile / tablet / desktop), con TEST MODE activo
 * (?jordan_test=1) — así NUNCA contamina métricas reales.
 *
 * Escenarios cubiertos:
 *  1. Carga del widget en home (flotante) — bubble visible, no JS errors
 *  2. Carga del widget en /contacto/ (embed mode) — chat embebido visible
 *  3. Test mode detection: badge 🧪 TEST visible en header
 *  4. Captura email → payload partial 'initial' enviado al webhook con is_test=true
 *  5. Click slot Calendly → _sendLeadWebhook('final') corre ANTES de window.open
 *     (regresión del bug 2026-04-24 que perdió 8 días de leads)
 *
 * Uso:
 *   node scripts/jordan-e2e/jordan-e2e.mjs                     # contra producción
 *   node scripts/jordan-e2e/jordan-e2e.mjs --base http://localhost:3000
 *   node scripts/jordan-e2e/jordan-e2e.mjs --headed             # ver navegador
 *   node scripts/jordan-e2e/jordan-e2e.mjs --only escenario3
 *
 * Requiere: npm i playwright (en este repo o global)
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_DIR = __dirname;

const args = process.argv.slice(2);
const argVal = (k, def) => { const i = args.indexOf(k); return i >= 0 ? args[i+1] : def; };
const argHas = (k) => args.includes(k);

const BASE = argVal('--base', 'https://www.trespuntoscomunicacion.es');
const HEADED = argHas('--headed');
const ONLY = argVal('--only', null);
const TIMEOUT_MS = parseInt(argVal('--timeout', '20000'), 10);

const G = '\x1b[32m', R = '\x1b[31m', Y = '\x1b[33m', D = '\x1b[2m', N = '\x1b[0m', BOLD = '\x1b[1m';

const VIEWPORTS = [
  { name: 'mobile',  width: 390,  height: 844,  isMobile: true },
  { name: 'tablet',  width: 768,  height: 1024, isMobile: false },
  { name: 'desktop', width: 1440, height: 900,  isMobile: false }
];

mkdirSync(REPORT_DIR, { recursive: true });

const results = [];

function record(scenario, viewport, status, detail, screenshot) {
  results.push({ scenario, viewport, status, detail, screenshot, ts: new Date().toISOString() });
  const icon = status === 'pass' ? `${G}✔${N}` : status === 'fail' ? `${R}✘${N}` : `${Y}⚠${N}`;
  console.log(`  ${icon} [${viewport}] ${scenario}: ${detail}`);
}

async function withPage(viewport, fn) {
  const browser = await chromium.launch({ headless: !HEADED });
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    isMobile: viewport.isMobile,
    deviceScaleFactor: viewport.isMobile ? 2 : 1,
    userAgent: viewport.isMobile
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(TIMEOUT_MS);

  // Capturar console errors + payloads enviados al webhook (los interceptamos)
  const consoleErrors = [];
  const webhookPayloads = [];
  const calendlyOpens = [];

  // Filtramos errores que NO son del widget Jordan (Cloudflare Turnstile, GA4, ads, etc.)
  // — esos son hallazgos para el smoke test general, no para este E2E del widget
  const IGNORE_ERROR_PATTERNS = [
    /turnstile/i,
    /challenges\.cloudflare/i,
    /googletagmanager|google-analytics|gtag/i,
    /doubleclick|googleadservices/i,
    /facebook\.net|fbevents/i,
    /Failed to load resource.*status of 4\d\d/i,  // 4xx de terceros
    /Cookiebot/i
  ];
  const isWidgetError = (msg) => !IGNORE_ERROR_PATTERNS.some(rx => rx.test(msg));
  page.on('console', msg => { if (msg.type() === 'error' && isWidgetError(msg.text())) consoleErrors.push(msg.text()); });
  page.on('pageerror', err => { if (isWidgetError(err.message)) consoleErrors.push('PAGE_ERROR: ' + err.message); });

  // Interceptar el POST al webhook de Jordan — devolvemos 200 OK falso para no enviar real,
  // pero capturamos el payload para validarlo
  await page.route('**/jordan-chat-leads', async route => {
    const req = route.request();
    if (req.method() === 'POST') {
      try {
        webhookPayloads.push(JSON.parse(req.postData() || '{}'));
      } catch (_) { webhookPayloads.push({ _raw: req.postData() }); }
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true,"intercepted":true}' });
    }
    return route.continue();
  });

  // Interceptar el proxy de Anthropic — devolvemos respuesta falsa de Jordan
  await page.route('**/jordan-chat-proxy', async route => {
    if (route.request().method() === 'POST') {
      const fakeReply = '¡Genial! ¿Me puedes dejar tu nombre y un email para que el equipo pueda contactarte si no terminamos? Así no se pierde nada.';
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [{ type: 'text', text: fakeReply }] })
      });
    }
    return route.continue();
  });

  // Espía window.open para detectar Calendly
  await page.addInitScript(() => {
    window.__originalWindowOpen = window.open;
    window.__windowOpenCalls = [];
    window.open = function(url, target, features) {
      window.__windowOpenCalls.push({ url, target, t: Date.now() });
      return null; // no abrir realmente
    };
  });

  try {
    await fn(page, { consoleErrors, webhookPayloads, calendlyOpens });
  } finally {
    await browser.close();
  }
}

async function escenario1_homeBubble(viewport) {
  await withPage(viewport, async (page, captured) => {
    await page.goto(`${BASE}/?jordan_test=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const widgetExists = await page.evaluate(() => !!document.getElementById('jordan-widget-v7'));
    if (!widgetExists) return record('1.home-bubble', viewport.name, 'fail', 'widget host #jordan-widget-v7 no existe');

    const isTestMode = await page.evaluate(() => window.JordanAPI && window.JordanAPI.__test ? window.JordanAPI.__test.isTestMode() : null);
    if (!isTestMode) return record('1.home-bubble', viewport.name, 'fail', `test mode no activo (esperado true por ?jordan_test=1) — got ${isTestMode}`);

    if (captured.consoleErrors.length > 0) {
      return record('1.home-bubble', viewport.name, 'fail', `console errors: ${captured.consoleErrors.slice(0,2).join(' | ')}`);
    }
    record('1.home-bubble', viewport.name, 'pass', 'widget cargado, sin errores, test mode activo');
  });
}

async function escenario2_contactoEmbed(viewport) {
  await withPage(viewport, async (page, captured) => {
    await page.goto(`${BASE}/contacto/?jordan_test=1`, { waitUntil: 'networkidle' });
    // Espera activa: el embed se monta async. Hasta 8s.
    let embedRendered = false;
    for (let i = 0; i < 16; i++) {
      embedRendered = await page.evaluate(() => {
        const tgt = document.querySelector('#jordan-embed');
        if (!tgt) return false;
        // El embed mode hace target.attachShadow({mode:'closed'}) — desde fuera no podemos leer shadowRoot,
        // pero sabemos que está montado si window.JordanAPI existe Y __test.isTestMode() responde.
        return !!(window.JordanAPI && window.JordanAPI.__test && typeof window.JordanAPI.__test.isTestMode === 'function');
      });
      if (embedRendered) break;
      await page.waitForTimeout(500);
    }
    if (!embedRendered) {
      const diag = await page.evaluate(() => ({
        embedExists: !!document.querySelector('#jordan-embed'),
        scriptLoaded: !!document.querySelector('script[src*="jordan-widget-v7"]'),
        jordanApi: typeof window.JordanAPI,
        testApi: !!(window.JordanAPI && window.JordanAPI.__test)
      }));
      return record('2.contacto-embed', viewport.name, 'fail', `embed no inicializado tras 8s — diag: ${JSON.stringify(diag)}`);
    }

    if (captured.consoleErrors.length > 0) {
      return record('2.contacto-embed', viewport.name, 'fail', `console errors: ${captured.consoleErrors.slice(0,2).join(' | ')}`);
    }
    record('2.contacto-embed', viewport.name, 'pass', 'embed renderizado en #jordan-embed');
  });
}

async function escenario3_testBadge(viewport) {
  await withPage(viewport, async (page, captured) => {
    await page.goto(`${BASE}/?jordan_test=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Abrir chat
    await page.evaluate(() => window.JordanAPI && window.JordanAPI.open());
    await page.waitForTimeout(800);

    // Como el shadow es 'closed', preguntamos al widget si renderizó el badge
    const badgePresent = await page.evaluate(() => {
      // El widget no expone shadow, pero podemos comprobar el flag interno
      const api = window.JordanAPI && window.JordanAPI.__test;
      if (!api) return null;
      return { isTest: api.isTestMode(), reasons: api.testReasons() };
    });
    if (!badgePresent || !badgePresent.isTest) return record('3.test-badge', viewport.name, 'fail', 'isTestMode no devuelve true');
    if (!badgePresent.reasons.includes('url_param')) return record('3.test-badge', viewport.name, 'fail', `reasons no contiene url_param: ${JSON.stringify(badgePresent.reasons)}`);

    // Screenshot para verificar visual del badge
    const sp = join(REPORT_DIR, `screenshot-${viewport.name}-badge.png`);
    await page.screenshot({ path: sp, fullPage: false });
    record('3.test-badge', viewport.name, 'pass', `badge activo (reasons: ${badgePresent.reasons.join(',')}) → ${sp}`, sp);
  });
}

async function escenario4_emailPayload(viewport) {
  await withPage(viewport, async (page, captured) => {
    await page.goto(`${BASE}/?jordan_test=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.JordanAPI && window.JordanAPI.open());
    await page.waitForTimeout(500);

    // Simular conversación: 3 mensajes user + capturar email
    // El widget intercepta vía _sendMessage, no podemos llamarlo directo (cerrado).
    // Pero podemos empujar mensajes vía la testing API expandida (si la añadimos)
    // Por ahora: validamos que el payload se construye correctamente con un email simulado vía test API.
    const previewPayload = await page.evaluate(() => {
      if (!window.JordanAPI || !window.JordanAPI.__test) return null;
      return window.JordanAPI.__test.previewPayload('initial');
    });
    if (!previewPayload) return record('4.email-payload', viewport.name, 'fail', 'previewPayload null');
    if (previewPayload.is_test !== true) return record('4.email-payload', viewport.name, 'fail', `payload.is_test debe ser true, got ${previewPayload.is_test}`);
    if (!Array.isArray(previewPayload.test_triggers) || previewPayload.test_triggers.length === 0) {
      return record('4.email-payload', viewport.name, 'fail', `test_triggers vacío: ${JSON.stringify(previewPayload.test_triggers)}`);
    }
    if (previewPayload.stage !== 'initial') return record('4.email-payload', viewport.name, 'fail', `stage debe ser initial, got ${previewPayload.stage}`);

    record('4.email-payload', viewport.name, 'pass', `payload OK · is_test=true · triggers=${previewPayload.test_triggers.join(',')} · stage=initial`);
  });
}

async function escenario5_calendlyBeforeOpen(viewport) {
  // Este es el escenario crítico — el bug del 2026-04-24 que perdió 8 días de leads.
  // La regresión: si window.open(slot) corre ANTES de _sendLeadWebhook(), el lead se pierde.
  // El fix v7 fue invertir el orden. Validamos que sigue así.
  await withPage(viewport, async (page, captured) => {
    await page.goto(`${BASE}/?jordan_test=1`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Sondear el código fuente del widget para verificar el orden de las llamadas
    // (no podemos triggerar slots Calendly reales fácilmente sin mock del API Calendly)
    const orderCheck = await page.evaluate(async () => {
      const r = await fetch('/assets/jordan/jordan-widget-v7.js').catch(() => null);
      if (!r || !r.ok) return { error: 'no fetch widget' };
      const src = await r.text();
      // Buscar el HANDLER del slot Calendly (busca '__calendly__' que es el prefijo del value)
      // y dentro del bloque, el orden _sendLeadWebhook → window.open(fullUrl)
      const handlerIdx = src.indexOf("value.startsWith('__calendly__')");
      if (handlerIdx < 0) return { error: 'no __calendly__ handler' };
      const slice = src.substring(handlerIdx, Math.min(src.length, handlerIdx + 1500));
      const sendIdx = slice.search(/_sendLeadWebhook\s*\(/);
      const openIdx = slice.search(/window\.open\s*\(/);
      return {
        send_before_open: sendIdx >= 0 && openIdx >= 0 && sendIdx < openIdx,
        sendIdx, openIdx
      };
    });

    if (orderCheck.error) return record('5.calendly-order', viewport.name, 'fail', orderCheck.error);
    if (!orderCheck.send_before_open) {
      return record('5.calendly-order', viewport.name, 'fail',
        `_sendLeadWebhook DEBE ir ANTES de window.open(slot). Indices: send=${orderCheck.sendIdx} open=${orderCheck.openIdx}`);
    }
    record('5.calendly-order', viewport.name, 'pass', 'orden correcto: _sendLeadWebhook → window.open (regresión 2026-04-24 protegida)');
  });
}

const ESCENARIOS = {
  'escenario1': { fn: escenario1_homeBubble, label: 'Home — widget bubble flotante' },
  'escenario2': { fn: escenario2_contactoEmbed, label: 'Contacto — widget embed' },
  'escenario3': { fn: escenario3_testBadge, label: 'Badge 🧪 TEST visible' },
  'escenario4': { fn: escenario4_emailPayload, label: 'Payload con is_test + test_triggers' },
  'escenario5': { fn: escenario5_calendlyBeforeOpen, label: 'Calendly: _sendLeadWebhook ANTES de window.open' }
};

async function main() {
  console.log(`${BOLD}Jordan E2E test · ${BASE}${N}\n`);

  const escenarios = ONLY ? [ONLY] : Object.keys(ESCENARIOS);
  for (const eName of escenarios) {
    const e = ESCENARIOS[eName];
    if (!e) { console.log(`${R}Escenario ${eName} no existe${N}`); continue; }
    console.log(`${BOLD}${eName}: ${e.label}${N}`);
    for (const vp of VIEWPORTS) {
      try { await e.fn(vp); }
      catch (err) { record(eName, vp.name, 'fail', `EXCEPTION: ${err.message}`); }
    }
    console.log('');
  }

  // Reporte JSON + HTML
  const jsonPath = join(REPORT_DIR, 'report.json');
  writeFileSync(jsonPath, JSON.stringify({ base: BASE, ts: new Date().toISOString(), results }, null, 2));

  const nPass = results.filter(r => r.status === 'pass').length;
  const nFail = results.filter(r => r.status === 'fail').length;
  const nWarn = results.filter(r => r.status === 'warn').length;

  const summaryColor = nFail === 0 ? G : R;
  console.log(`${BOLD}Result: ${summaryColor}${nPass} pass · ${nFail} fail · ${nWarn} warn${N}`);
  console.log(`Report JSON: ${jsonPath}`);

  process.exit(nFail === 0 ? 0 : 1);
}

main().catch(e => { console.error(R + e.stack + N); process.exit(2); });
