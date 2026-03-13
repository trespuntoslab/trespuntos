# Auditoría Mobile UX/UI — trespuntoscomunicacion.es

**Fecha:** 13 marzo 2026
**Viewport testado:** iPhone 14 Pro (393×852 @3x)
**Breakpoints detectados:** 768px, 900px, 960px, 1024px

---

## Resumen ejecutivo

La web tiene una base responsive aceptable (single-column layout en mobile, hamburger menu visible), pero presenta problemas significativos de UX móvil que afectan la experiencia del usuario y probablemente la tasa de conversión. Los problemas más graves son: el menú móvil sin animación ni efecto visual, los testimonios completamente rotos (se muestran como columnas de texto ilegibles sin carrusel funcional), y la falta de interacción táctil (swipe/drag) en elementos que lo requieren.

---

## 1. Menú Móvil

### Estado actual
El menú se abre con `display:none → display:flex` instantáneo. Sin transición, sin animación, sin efecto visual. Solo una lista plana de enlaces con bordes inferiores sobre fondo negro.

### Problemas detectados

| Hallazgo | Severidad | Descripción |
|----------|-----------|-------------|
| Sin animación de apertura/cierre | 🔴 Crítico | El menú aparece/desaparece instantáneamente. No hay feedback visual de la transición. Sensación de "roto". |
| Sin efecto visual diferenciador | 🔴 Crítico | Menú genérico sin personalidad de marca. No aprovecha el design system (particles, mint glow, etc.) |
| Sin animación staggered en links | 🟡 Moderado | Los enlaces aparecen todos a la vez. No hay reveal secuencial. |
| Hamburger no tiene feedback táctil | 🟡 Moderado | El botón hamburger → X funciona pero sin transición suave visible. |
| No hay CTA "Cuéntanos tu proyecto" en el menú | 🟡 Moderado | Se pierde el CTA principal al abrir el menú móvil. |

### Propuesta de cambios
- Animación de apertura: slide-down + fade con backdrop blur progresivo (300ms)
- Particle dots canvas de fondo (igual que el hero) activándose al abrir el menú
- Links con animación staggered (fadeInUp, 50ms delay entre cada uno)
- Glow mint sutil en hover de cada enlace
- Botón CTA "Cuéntanos tu proyecto" fijo en la parte inferior del menú
- Cierre con animación inversa (slide-up + fade-out)

---

## 2. Carrusel de Testimonios

### Estado actual
**ROTO EN MOBILE.** El carrusel muestra 3 tarjetas visibles simultáneamente (VISIBLE=3 en el JS), pero en un viewport de 393px esto resulta en 3 columnas de texto extremadamente estrechas (~120px cada una) que son completamente ilegibles. El texto se parte palabra por palabra y no se puede leer ningún testimonio.

### Problemas detectados

| Hallazgo | Severidad | Descripción |
|----------|-----------|-------------|
| Testimonios ilegibles en mobile | 🔴 Crítico | 3 tarjetas de ~120px de ancho cada una. Texto imposible de leer. |
| Sin soporte swipe/drag | 🔴 Crítico | No hay touch gestures. El carrusel solo se controla con botones prev/next y timer. |
| Sin adaptación de VISIBLE count a mobile | 🔴 Crítico | Siempre muestra 3 cards. Debería ser 1 en mobile. |
| Botones prev/next difíciles de tocar | 🟡 Moderado | 38px de diámetro, justo en el límite del target táctil mínimo (44px). |
| Dots de navegación demasiado pequeños | 🟡 Moderado | 6px de diámetro. Difícil de tocar con precisión. |

### Propuesta de cambios
- VISIBLE=1 en viewports ≤768px (mostrar 1 testimonio completo a la vez)
- Implementar swipe/drag nativo con inercia y snap
- Aumentar tamaño de touch targets (dots: 12px, botones: 48px)
- Añadir indicador visual de "swipeable" (sombra lateral, peek de siguiente card)
- Transición suave entre cards con efecto de profundidad

---

## Resumen de prioridades

### 🔴 Críticos (hacer inmediatamente)
1. **Testimonios carrusel roto** — VISIBLE=1 en mobile + implementar swipe/drag
2. **Menú móvil sin animación** — Añadir transición wow + particles + staggered links

### 🟡 Moderados (hacer en segunda fase)
3. **Tarjetas UX/UI 2-col demasiado juntas** — Single column bajo 500px
4. **Casos de negocio sin carrusel** — Convertir a horizontal swipe en mobile
5. **Proceso texto cortado** — Ajustar padding derecho
6. **Visualizaciones de servicios cortadas** — Escalar al viewport
7. **Logo section espacio vacío** — Limpiar layout intermedio

---

*Auditoría generada con screenshots reales en viewport iPhone 14 Pro (393×852 @3x)*