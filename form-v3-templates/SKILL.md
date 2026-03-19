---
name: form-v3-templates
description: "Multi-step lead capture form system for Tres Puntos projects. Use when creating lead forms, contact forms, multi-step forms, briefing forms, or any form flow for a Tres Puntos website. Triggers on: 'formulario', 'form', 'lead capture', 'form-v3', 'crear formulario', 'nuevo formulario de captacion', 'paso 1 paso 2', 'multi-step form', 'briefing form'. Always use this skill when building any new form for a Tres Puntos project."
---

# Form V3 Templates — Multi-Step Lead Capture System

This skill provides the complete template system for building multi-step lead capture forms that follow the Tres Puntos design system. The system consists of 4 interconnected HTML pages that form a complete user journey.

## Architecture Overview

The flow works like this:

```
form-step1.html → gracias.html → form-step2.html → briefing-enviado.html
(Contact data)    (Thank you +     (Briefing:        (Final confirmation
                   CTA to step 2)   services, timeline, with status tracker)
                                    audio, files)
```

Data passes between pages via **hash fragments** (not query parameters — the server's clean URL rewrite strips query params). Example: `gracias.html#nombre=X&email=Y`.

## Design System Integration

All form pages follow these core patterns from the Tres Puntos design system:

### Page Structure
```html
<body>
  <div class="glow-orb"></div>    <!-- Animated radial gradient -->
  <div class="page-wrap">
    <nav class="nav">...</nav>     <!-- Sticky nav with logo + back link -->
    <div class="main">             <!-- 2-column grid: 420px | 1fr -->
      <aside class="left-panel">   <!-- Sticky sidebar -->
        <div class="left-top">     <!-- Badge + H1 + description + steps -->
        <div class="left-bottom">  <!-- Trust items -->
      </aside>
      <main class="right-panel">   <!-- Form content, max-width 640-720px -->
      </main>
    </div>
  </div>
</body>
```

### Required CSS Overrides
The design-system.css sets `body{cursor:none}` for a custom cursor, but form pages use their own nav (not `TP.navbar()`), so the custom cursor div is never created. Always include:

```css
body, body * { cursor: auto !important; }
a, button, label, .budget-option, .privacy-row { cursor: pointer !important; }
```

### Background Effects
Every page needs these three layers (noise texture, grid lines, glow orb):

```css
body::before { /* SVG noise texture, opacity .4 */ }
body::after { /* 60px grid lines, rgba(93,255,191,.025) */ }
.glow-orb { /* 600px radial gradient, animated float */ }
```

### CSS Variables Used
- `--mint: #5dffbf` — Primary accent
- `--mint-hover: #49e6a8` — Hover state
- `--bg-base: #0e0e0e` — Page background
- `--bg-surface` — Panel background
- `--bg-subtle` — Card background
- `--border-base`, `--border-strong` — Borders
- `--text-primary`, `--text-secondary`, `--text-muted` — Text hierarchy
- `--font-heading: "Plus Jakarta Sans"` — Headings (weight 700-800)
- `--font-body: "Inter"` — Body text
- `--font-mono: "JetBrains Mono"` — Labels, badges, progress
- `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` — Border radii

### Responsive Breakpoints
- **900px**: Grid collapses to single column, left-panel becomes static header
- **540px**: Reduced padding, smaller headings, budget grid goes single column

## Anti-Spam
Both form pages include:
1. **Honeypot field**: Hidden `<input name="website_url">` — reject if filled
2. **Timestamp check**: `Date.now() - loadTime < 3000` — reject if submitted in < 3 seconds

## URL Parameter Chain (Hash Fragments)
```
form-step1 → redirect with #nombre=X&email=Y
gracias    → parse hash, personalize title, build CTA link with #email=Y&nombre=X
form-step2 → parse hash for email, submit to webhook, redirect with #email=Y&nombre=X
briefing   → parse hash, personalize title
```

Always parse hash first, fallback to query string:
```javascript
var hash = window.location.hash.substring(1);
var params = new URLSearchParams(hash);
if (!params.get('nombre') && !params.get('email')) {
  params = new URLSearchParams(window.location.search);
}
```

## Webhook Endpoints
- Step 1: `https://n8n.trespuntos-lab.com/webhook/leads-step1-v3` (JSON POST)
- Step 2: `https://n8n.trespuntos-lab.com/webhook/briefing-doc-funcional` (FormData POST — for audio/file uploads)

## Template Reference Files

The complete templates are in `/form-v3/` directory:

- **`form-step1.html`** — Contact form (nombre, email, telefono, presupuesto as 2x2 cards, privacy checkbox). Read this for the form field patterns, validation, progress bar, and budget card selection.

- **`gracias.html`** — Success page with CTA card to step 2, timeline showing process steps. Read this for success page patterns and CTA card design.

- **`form-step2.html`** — Briefing form (6 service cards multi-select, 4 timeline cards single-select, web URL, audio recorder with 30s auto-stop, textarea, file upload with drag & drop). Read this for complex input patterns like audio recording, file upload, and card selection.

- **`briefing-enviado.html`** — Final confirmation with 4-step status tracker (2 done, 1 active with pulse animation, 1 pending). Read this for status tracker patterns.

## How to Adapt for a New Project

1. Copy all 4 files from `/form-v3/`
2. Update webhook URLs to point to the new n8n endpoints
3. Modify service cards to match the new project's offerings
4. Update timeline/budget options as needed
5. Adjust left panel content (steps, trust items, headings)
6. Keep the design system integration, cursor overrides, and hash fragment chain
7. Update Google Analytics ID if different
8. Adjust anti-spam timing thresholds if needed

## Icon Style
The project uses inline Heroicons (outline style, stroke-based SVGs). No external icon library. Example:
```html
<svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
  <path d="..."/>
</svg>
```
Never use emojis — always use SVG icons.
