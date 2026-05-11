#!/usr/bin/env node
/**
 * Playwright runner para smoke-test.py
 * Lee JSON por stdin: { base_url, targets:[{path,label}], screenshots_dir }
 * Devuelve JSON por stdout: { url: { checks:{...}, errors:[], warnings:[], screenshot:"path" } }
 *
 * Para cada URL:
 *  - Carga en mobile viewport (390x844)
 *  - Captura console errors y page errors
 *  - Verifica Jordan widget cargó (sin errores)
 *  - Verifica que el navbar/footer se renderizaron (no solo están en HTML)
 *  - Si hay error: screenshot fullPage
 *
 * Uso: echo '{"base_url":"https://...","targets":[...]}' | node _playwright-runner.mjs
 */
import { chromium } from 'playwright';
import { readFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  const stdin = readFileSync(0, 'utf-8');
  const { base_url, targets, screenshots_dir } = JSON.parse(stdin);
  mkdirSync(screenshots_dir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1 TresPuntosSmokeTest/1.0',
  });

  const results = {};

  for (const t of targets) {
    const url = base_url + t.path;
    const result = { checks: {}, errors: [], warnings: [], screenshot: null };
    const page = await ctx.newPage();

    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));
    page.on('requestfailed', req => {
      const u = req.url();
      // ignore well-known noisy 3rd-party fails
      if (u.includes('analytics') || u.includes('googletagmanager') || u.includes('doubleclick')) return;
      failedRequests.push(`${req.failure()?.errorText || 'failed'}: ${u}`);
    });

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    } catch (e) {
      result.errors.push(`Navigate failed: ${e.message}`);
      try {
        const sp = join(screenshots_dir, `FAIL-${slug(t.label)}.png`);
        await page.screenshot({ path: sp, fullPage: true });
        result.screenshot = sp;
      } catch {}
      results[url] = result;
      await page.close();
      continue;
    }

    // wait a bit for components.js to inject navbar/footer + Jordan widget to register
    await page.waitForTimeout(1500);

    // navbar rendered
    const navbarRendered = await page.locator('nav, [role=navigation], .nav, header nav, .navbar').first().isVisible().catch(() => false);
    result.checks['navbar_rendered'] = navbarRendered;
    if (!navbarRendered) result.errors.push('Navbar not visible after JS init');

    // footer rendered
    const footerRendered = await page.locator('footer').first().isVisible().catch(() => false);
    result.checks['footer_rendered'] = footerRendered;
    if (!footerRendered) result.errors.push('Footer not visible');

    // Jordan widget present in DOM (host element or embed)
    const jordanPresent = await page.evaluate(() => {
      return !!document.getElementById('jordan-widget-v7') ||
             !!document.querySelector('[id^="jordan"]') ||
             !!document.querySelector('#jordan-embed iframe, #jordan-embed > *');
    });
    result.checks['jordan_widget_loaded'] = jordanPresent;
    if (!jordanPresent && !t.path.match(/^\/(aviso-legal|politica-|sitemap|robots)/)) {
      result.warnings.push('Jordan widget not found in DOM');
    }

    // console errors
    result.checks['no_console_errors'] = consoleErrors.length === 0;
    if (consoleErrors.length > 0) {
      result.errors.push(`${consoleErrors.length} console error(s): ${consoleErrors.slice(0, 3).join(' | ')}`);
    }

    // page errors (uncaught exceptions)
    result.checks['no_page_errors'] = pageErrors.length === 0;
    if (pageErrors.length > 0) {
      result.errors.push(`${pageErrors.length} page error(s): ${pageErrors.slice(0, 3).join(' | ')}`);
    }

    // failed requests
    if (failedRequests.length > 0) {
      result.warnings.push(`${failedRequests.length} failed request(s): ${failedRequests.slice(0, 3).join(' | ')}`);
    }

    // screenshot only on failure
    if (result.errors.length > 0) {
      const sp = join(screenshots_dir, `FAIL-${slug(t.label)}.png`);
      await page.screenshot({ path: sp, fullPage: true });
      result.screenshot = sp;
    }

    results[url] = result;
    await page.close();
  }

  await browser.close();
  process.stdout.write(JSON.stringify(results));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
