# Capilclinic — Cover ChatGPT (bento hub)

**Web:** https://www.capilclinic.es · **Sector:** Salud · Clínica capilar · **Glow:** mint green `#5dffbf`

## Pasos
1. Toma un screenshot del hero de https://www.capilclinic.es en desktop (~1920×1080), recortado SIN scroll, SIN cookies banner. Guárdalo en esta misma carpeta como `source.png`.
2. Abre ChatGPT (modelo con generación de imágenes, ej. GPT-4o / GPT Image).
3. Sube `source.png` y pega el prompt de abajo.
4. Cuando ChatGPT devuelva la imagen, descárgala a esta carpeta como `cover.png`.
5. Vuelve a Claude Code y ejecuta `/case-study cover capilclinic` para que la convierta a WebP y la coloque en producción.

## Prompt para ChatGPT

```
Premium Salud · Clínica capilar case-study cover image.

Compose a floating MacBook Pro at a dynamic 3/4 left angle in the upper-left
of the frame, with the attached screenshot displayed on its screen pixel-
perfectly. To its lower-right, place a floating iPhone 15 Pro at a slight
opposite angle, showing the mobile version (a vertical crop of the same hero).
Both devices appear to float in dark space with a sense of depth — the
MacBook slightly back, the iPhone slightly forward.

Background: pure black (#0a0a0a) with a mint green (#5dffbf) ambient rim
light radiating from behind the devices, subtle volumetric haze, deep vignette.

Style: photographic realism, sharp focus on screens, subtle reflections,
cinematic studio lighting. No watermarks, no logos floating in space, no
added UI overlays, no text added by you.

CRITICAL: The website content shown on the screen(s) must remain a 100%
faithful reproduction of the input screenshot — do not redraw, alter, or
hallucinate any text, images, or UI elements from the source.

Portrait 2:3 aspect ratio (1024×1536). Devices fill 70-80% of the frame.
Leave a small clean dark area at the bottom for typography overlay (do NOT
add any text).
```
