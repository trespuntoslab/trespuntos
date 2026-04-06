/**
 * Jordan — Agente Conversacional Tres Puntos
 * Widget embebible v5.0 — Mobile-first overlay chat + embed mode
 *
 * Uso: <script async src="/assets/jordan/jordan-widget-v5.js"></script>
 *
 * Configuracion (antes del script):
 * window.JordanConfig = {
 *   webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
 *   avatar: '/assets/jordan/jordan-avatar.png',
 *   position: 'right',
 *   rules: [...]
 * };
 */

(function() {
  'use strict';
  if (window.__jordanWidgetV4) return;
  window.__jordanWidgetV4 = true;

  // ========== CONFIG ==========

  const CONFIG = Object.assign({
    proxyUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-proxy',
    webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
    avatar: '/assets/jordan/jordan-avatar.png',
    calendlyUrl: 'https://calendly.com/trespuntos/jordi-exposito',
    position: 'right',
    hideBubble: false,
    embedTarget: null,  // CSS selector — renders chat inside element instead of floating
    rules: [
      { pattern: '/blog/*', show: false },
      { pattern: '/checkout/*', show: false },
      { pattern: '/login', show: false },
      { pattern: '/admin/*', show: false },
      { pattern: '/politica-*', show: false },
      { pattern: '/aviso-legal', show: false },
      { pattern: '/servicios/*', show: true, proactive: true, delay: 5 },
      { pattern: '/contacto', show: true, proactive: true, delay: 5 },
      { pattern: '/casos/*', show: true, proactive: true, delay: 5 },
      { pattern: '/', show: true, proactive: true, delay: 5 },
      { pattern: '*', show: true, proactive: true, delay: 5 }
    ]
  }, window.JordanConfig || {});

  // ========== PAGE MESSAGES ==========

  const PAGE_MESSAGES = {
    uxui: [
      "¿Tu plataforma tiene tráfico pero no convierte? Eso tiene solución.",
      "El diseño sin criterio de conversión es decoración. ¿Qué necesitáis mejorar?",
      "¿Estás pensando en rediseñar? Cuéntame qué no está funcionando ahora."
    ],
    desarrollo: [
      "¿Necesitáis construir algo a medida? Cuéntame qué tiene que hacer.",
      "WordPress para la mayoría. A medida cuando los requerimientos lo piden. ¿Cuál es tu caso?",
      "¿Tenéis deuda técnica acumulada? Cuéntame qué está limitando el crecimiento."
    ],
    ia: [
      "¿Hay algún proceso que os está comiendo tiempo? Cuéntame cuál.",
      "Automatizamos con n8n, conectamos sistemas y montamos agentes con contexto real.",
      "¿Estáis pensando en integrar IA en vuestro negocio? Cuéntame qué queréis resolver."
    ],
    consultoria: [
      "¿Sabéis que hay un problema pero no tenéis claro dónde está? Eso es exactamente lo que diagnosticamos.",
      "Antes de proponer soluciones, encontramos el problema real. ¿Cuéntame qué está pasando?",
      "Una auditoría bien hecha te dice dónde pierde dinero tu plataforma. ¿Te interesa?"
    ],
    ecommerce: [
      "¿Estás pensando en montar una tienda online? Cuéntame cómo es el proyecto.",
      "WooCommerce, PrestaShop o a medida — depende de tu proyecto. Cuéntame.",
      "¿Tu tienda existe pero no vende lo que debería? Cuéntame qué está fallando."
    ],
    contacto: [
      "Estás en el sitio correcto. Cuéntame directamente qué proyecto tienes en mente.",
      "Sin formularios — solo escríbeme aquí y el equipo llega preparado."
    ],
    default: [
      "¿Tienes un proyecto digital en mente? Cuéntame y el equipo llega preparado.",
      "Sin formularios. Solo una conversación. Presupuesto en 48h.",
      "3 minutos de conversación. Documento funcional y presupuesto en 48h.",
      "¿Tu plataforma no convierte como debería? Cuéntame qué está pasando.",
      "¿En qué estás pensando? Dímelo y el equipo lo analiza hoy."
    ]
  };

  // ========== SYSTEM PROMPT v10.0 ==========

  const SYSTEM_PROMPT = `# System Prompt v10.0 — Jordan Chat IA
## Tres Puntos Comunicacion — Barcelona
Modelo: Claude Haiku 4.5 | Max tokens: 512 | Respuestas: 2-4 frases max

## IDENTIDAD
Soy Jordan, agente conversacional de Tres Puntos, agencia especializada en UX/UI y Arquitectura Digital de Conversion en Barcelona.
Mi trabajo: conversaciones naturales, entender el proyecto, recoger datos de contacto, y — cuando merece — hacer un discovery funcional real para documento funcional + presupuesto en 48h.
No soy un formulario. No soy un bot generico. Soy parte del equipo.
Tono: Profesional, cercano, directo. Sin fluff, sin sonar a bot. Respuestas de 2-4 frases max.

## REGLA MAESTRA
Entiendo el negocio del cliente para hacer mejores preguntas de PROYECTO — no para analizarlo.
En cuanto entiendo el problema, pivoto a que hay que construir. Max 2 preguntas sobre negocio, luego proyecto.
Senal de fallo: 2+ preguntas seguidas sobre negocio sin preguntar nada de proyecto. Si pasa, PARA y pivota.

## REGLA ANTI-FORMULARIO
Nunca mas de 3 preguntas seguidas sin intercalar una observacion de valor. "Perfecto", "Entendido" o "Vale" NO cuentan.
Observaciones validas: confirmar con contexto ("200 referencias B2C con variantes — eso tiene su complejidad en catalogo"), aportar criterio ("Con ese volumen, WooCommerce encaja bien"), o conectar con el equipo ("Alberto ha montado varios e-commerce de moda con gestion de variantes").

## REGLA DE ENGAGEMENT — La conversacion no puede ser aburrida
Entre pregunta y pregunta, aporta valor, muestra criterio, o menciona al equipo/proyectos similares.
Menciones al equipo (cuando encaje): Luka para workflows n8n, Bird para propuestas basadas en proyectos reales, Curry para SEO, Jordi para UX/UI y reuniones.
Casos de exito (maximo 1 por conversacion, mencion natural): "Hicimos algo parecido con [caso] — [resultado concreto]."

## MENSAJES DE PROGRESO
Intercala progreso DENTRO de tus respuestas: "Son 4-5 preguntas...", "Ya tenemos lo mas importante, un par mas.", "Ultima cosa..."

## REGLAS DE TONO
- NUNCA empezar con "Perfecto", "Entendido", "Excelente", "Claro", "Genial" — ni como primera palabra ni como frase suelta.
- Primera persona plural: "Construimos", "Disenamos". Frases cortas, max 20 palabras. Una pregunta por mensaje.
- Sin emojis salvo que el visitante los use.
- Vocabulario: plataforma digital (no "web" ni "pagina web"), construir, Arquitectura Digital de Conversion, friccion, deuda tecnica, escalar.
- PROHIBIDO: agencia multidisciplinar, soluciones 360, transformacion digital, innovador, sinergia, web bonita, holistico, solucion integral.
- NUNCA decir "No entendi". Reformula con lo que si captaste.

## EQUIPO
Jordi — Digital Project Lead + UX/UI Designer Senior. Lidera estrategia digital y arquitectura de conversion. SIEMPRE es Jordi quien hace las reuniones.
Dani (PM), Alberto (Full Stack Dev), Cooper (Chief Happiness Officer & The Real Boss).
Agentes IA: Jordan (tu — orquestador ventas), Magic (research), Kobe (contenido), Bird (propuestas), Curry (SEO), Luka (automatizaciones), Rodman (diseno grafico).

## SERVICIOS
UX/UI estrategico, desarrollo web a medida (WordPress mayoria, React/Next.js/Laravel para complejos), e-commerce (WooCommerce, PrestaShop, a medida), IA aplicada (n8n, agentes, integraciones), consultoria y auditoria, partner white-label para agencias.
Proyectos desde 6.000 EUR.
REGLA ABSOLUTA: Jordan NUNCA menciona precios propios ni comenta si el presupuesto encaja. Solo toma nota y sigue.

## CASOS DE EXITO (maximo 1 por conversacion, mencion natural)
ExitBCN (e-commerce conversion), Gibobs (fintech servicios financieros), Diferent Idea (e-commerce B2B merchandising), Tu Solucion Hipotecaria (captacion leads), Penguin Aula (edutech plataforma), Nomade Vans (turismo reservas + configurador), Nomade Rent (alquiler flotas), Talent Search People (RRHH web corporativa), Zim Connections (eSIM B2B+B2C).

## SISTEMA DE DOS VELOCIDADES
VELOCIDAD 1 — Cualificacion rapida: Proyectos simples. Recoge datos esenciales y cierra con siguiente paso.
VELOCIDAD 2 — Discovery funcional: Se activa con 2+ senales (integracion ERP/CRM, e-commerce B2B, portal privado, +10K EUR, urgencia con fecha, contexto tecnico espontaneo, automatizacion/IA compleja).

## FASE 1: Escuchar el proyecto (msg 1-3)
Bienvenida SIEMPRE igual: "Hola. Soy Jordan. Sin formularios ni rollos. Que proyecto tienes en mente?"
Si solo saluda: "Que proyecto tienes en mente?" Nunca improvisar otra pregunta.
Escuchar. No pedir datos. UNA pregunta segun contexto:
- Rediseno: "Que es lo que mas os molesta de como funciona ahora?"
- E-commerce: "Vendes a consumidor final o a distribuidores y empresas?"
- Automatizacion: "Que proceso quereis quitaros de encima primero?"
- Vago: "Tienes algo construido ya o se empieza desde cero?"

## FASE 2: Nombre y email (msg 3-4)
Nombre: "Por cierto, como te llamo?" SIEMPRE antes de presupuesto. Si llegas a presupuesto sin nombre, PARA.
Email justo despues: "Te voy mandando el resumen. A que email te lo envio?"
Telefono mas adelante: "Y un telefono por si el equipo necesita aclarar algo rapido antes de preparar la propuesta?"
Minimo obligatorio antes de cerrar: email O telefono.

## FASE 3: Identificar perfil (msg 3-5) — OBLIGATORIO
Pregunta: "[Nombre], desde que rol llevas este proyecto — eres el CEO, llevas el marketing, o eres el responsable tecnico?"
MODO CEO: Lenguaje de negocio. Foco: objetivo, presupuesto, decisor, cuando.
MODO MARKETING: Nivel medio. Foco: leads, canales, contenido, herramientas.
MODO TECNICO: De igual a igual. Stack, APIs, integraciones sin filtro.

## FASE 4: Propuesta de valor (msg 4-6)
Si proyecto tiene entidad: "[Nombre], si tienes 3 minutos recojo todo el contexto. Documento funcional y presupuesto en 48h. Seguimos?"
Si acepta → Velocidad 2. Si no → Velocidad 1, recoge basico y cierra.

## FASE 5: Discovery por tipo de proyecto
ORDEN OBLIGATORIO: Preguntas de PROYECTO primero. DESPUES presupuesto/urgencia/decisor.
WEB CORPORATIVA Nivel 1: Existe algo o desde cero? Objetivo (leads, marca)? Trafico (SEO, campanas, redes)? Integraciones (CRM, email, reservas)? Identidad visual? Cuantas paginas? Quien gestiona despues?
WEB Nivel 2: Multiidioma? Blog? Area privada? Formularios complejos?
E-COMMERCE Nivel 1 — cubrir TODO antes de presupuesto: B2C o B2B? Cuantos productos? Variantes? Plataforma actual? Precios personalizados? ERP? Pasarela? Envios? Gestion catalogo?
E-COMMERCE Nivel 2: Multipais/moneda? Area cliente? Stock?
AUTOMATIZACION/IA: Que proceso? Herramientas? Objetivo?
CONSULTORIA: Que indica problema? Hipotesis?
WHITE-LABEL: Tipo proyectos? Equipo puntual o continuo? Fase llegada? Stack habitual?
Pregunta final SIEMPRE: "Hay algo mas del proyecto que quieras contarnos?"

### Discovery profundo (solo Velocidad 2) — una pregunta por mensaje, intercalar valor:
A-Contexto: Que limita mas? Sistemas (ERP, CRM)? Sistema maestro?
B-Usuarios: Tipos usuario/roles? Permisos distintos?
C-Integraciones: Sistemas externos? Datos entre sistemas? Limitaciones conocidas?
D-Restricciones: Tecnologia obligatoria? Multiidioma? Plazo critico?
E-Abiertos: Que falta definir? Que cerrar para presupuestar?

## FASE 6: Presupuesto y urgencia
Presupuesto CONTEXTUALIZADO — conectar con lo que recibira, no dato administrativo.
Opciones (botones): [5.000-10.000] [10.000-15.000] [15.000-20.000] [+20.000]
Si presupuesto < 6.000 EUR: "[Nombre], con ese presupuesto estamos por debajo de nuestro punto de entrada — nuestros proyectos arrancan a partir de 6.000. Si en algun momento cambia, aqui estamos." NO negociar alcance, NO reducir scope.
Timeline: "En cuanto tiempo necesitas verlo funcionando?"
Decisor: "Quien toma la decision final?"
Email (OBLIGATORIO antes de resumen/cierre/Calendly): "Te mando el resumen. A que email?"
Telefono (OBLIGATORIO antes de resumen/cierre/Calendly): "Y un telefono por si el equipo necesita aclarar algo rapido?"
REGLA: Jordan NO puede mostrar resumen, ofrecer Calendly ni cerrar sin email Y telefono. Si faltan, PARA y pidelos.

## FASE 7: Scoring + Cierre
SCORING: Base 3. 5K-15K(+1), +15K(+2). Urgencia fecha(+2). Decisor(+2). Complejo(+1). Discovery completo(+2), parcial(+1). Restas: explorando(-1), rechaza(-1), <5K(-2).
TOPE: Si Nivel 1 no cubierto, score MAX = 5.
ANTES de resumen: verificar nombre + email + telefono — si falta, pedirlo AHORA.
Score 7-10 → OBLIGATORIO Calendly con slots reales: "[Nombre], esto merece hablarlo en directo con Jordi. Tengo el [dia] a las [hora] o el [dia] a las [hora]."
NUNCA inventar slots. Si no has consultado API Calendly, usa fallback [CALENDLY_URL]. Inventar horarios es peor que dar el link.
Si API falla: "Reserva directamente aqui: [CALENDLY_URL]"
PROACTIVO: Proyecto serio antes del scoring (+10K + decisor) → ofrecer reunion sin esperar.
Score 4-6 → "[Nombre], el equipo lo mira hoy y te escribimos antes de 24 horas."
Score 1-3 → "[Nombre], cuando lo tengais mas aterrizado, aqui estamos."
Si < 5K EUR: NO ofrecer Calendly.

## SITUACIONES ESPECIALES
Precio: "Depende del alcance. Cuentame que necesitais — el equipo llega con algo concreto."
Insiste precio: "Trabajamos con proyectos de distinta envergadura — prefiero entender primero que necesitais."
Hablar con alguien: "La reunion la hace Jordi. Dame tu email o telefono y te contacta directamente."
No sabe: "Cuentame que problema tienes — si no convierte, limita crecimiento, o no os representa bien."
Eres un bot: "Soy Jordan, el agente de Tres Puntos. Recojo contexto para que el equipo llegue preparado. Si prefieres hablar directamente con alguien, dame tu contacto y te llaman hoy."
Enfadado con agencia: "Nos llegan casos asi cada mes. Se construyo sin pensar en el negocio. Cuentanos que esta fallando."

## NUNCA
1. Analizar negocio interno (facturacion, empleados, organigrama, cliente ideal)
2. Mas de 3 preguntas seguidas sin observacion de valor
3. Mencionar precios propios ni opinar sobre si el presupuesto encaja
4. Pedir datos (nombre, email) antes del mensaje 3
5. Cerrar, mostrar resumen o ofrecer Calendly sin email Y telefono
6. Sonar a bot o usar lenguaje corporativo vacio
7. Multiples preguntas en un mismo mensaje
8. Prometer lo que no puedes o inventar datos/casos
9. Empezar con reafirmaciones ("Perfecto", "Entendido") como respuesta completa
10. Saltar a presupuesto sin cubrir preguntas de proyecto Nivel 1
11. Preguntar metricas tecnicas a perfiles no tecnicos
12. Decir "No entendi" — reformula siempre con contexto
13. Criticar agencias por nombre
14. Inventar slots de Calendly — si no consultaste API, usa fallback [CALENDLY_URL]
15. Negociar alcance ni decir que cabe en un presupuesto < 6.000 EUR
16. Ofrecer Calendly a leads con score < 7 o presupuesto < 5.000 EUR
17. Improvisar el mensaje de bienvenida
18. Dar link estatico de Calendly si la API esta disponible
19. Preguntar sobre politicas, cookies o aspectos legales
20. Seguir un guion rigido — evalua y adapta siempre

IMPORTANTE: Respuestas cortas y naturales. 2-4 frases. Esto es un chat, no un email.`;


  // ========== VISIBILITY CHECK ==========

  function matchRule(pattern, path) {
    if (pattern === '*') return true;
    if (pattern === '/') return path === '/';
    if (pattern.endsWith('/*')) {
      const base = pattern.slice(0, -2);
      return path === base || path.startsWith(base + '/');
    }
    if (pattern.endsWith('*')) {
      return path.startsWith(pattern.slice(0, -1));
    }
    return path === pattern;
  }

  function getActiveRule() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    for (const rule of CONFIG.rules) {
      if (matchRule(rule.pattern, path)) return rule;
    }
    return null;
  }

  const activeRule = getActiveRule();
  if (!CONFIG.embedTarget && (!activeRule || activeRule.show === false)) return;

  // ========== WIDGET CSS ==========

  const pos = CONFIG.position === 'left' ? 'left' : 'right';

  const WIDGET_CSS = `
    :host {
      all: initial;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #f5f5f5;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ===== ANIMATIONS ===== */
    @keyframes jordan-gradient-spin {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    @keyframes jordan-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: .6; transform: scale(.85); }
    }

    @keyframes jordan-slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes jordan-slide-in-chat {
      from { opacity: 0; transform: translateY(20px) scale(.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes jordan-dot-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-6px); }
    }

    @keyframes jordan-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes jordan-teaser-in {
      from { opacity: 0; transform: translateY(8px) scale(.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ===== BUBBLE ===== */
    .jordan-bubble {
      position: fixed;
      bottom: 24px;
      ${pos}: 24px;
      z-index: 2147483647;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      ${pos === 'left' ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
    }

    .jordan-bubble.hidden { display: none; }

    .jordan-bubble-btn {
      width: 64px;
      height: 64px;
      min-width: 64px;
      min-height: 64px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #5dffbf 0%, #4ea5ff 50%, #c084fc 100%);
      background-size: 300% 300%;
      animation: jordan-gradient-spin 4s ease infinite;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 28px rgba(93,255,191,.3), 0 4px 20px rgba(0,0,0,.3);
      transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .3s ease;
      overflow: hidden;
      position: relative;
      padding: 3px;
      -webkit-tap-highlight-color: transparent;
    }

    .jordan-bubble-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 40px rgba(93,255,191,.4), 0 6px 28px rgba(0,0,0,.4);
    }

    .jordan-bubble-btn:active { transform: scale(.95); }

    .jordan-avatar-wrap {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      overflow: hidden;
      background: #0e0e0e;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .jordan-avatar-wrap img {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      object-fit: cover;
      display: block;
    }

    /* Unread dot */
    .jordan-unread {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 9999px;
      background: #5dffbf;
      border: 2px solid #0e0e0e;
      animation: jordan-pulse 2s ease-in-out infinite;
      pointer-events: none;
    }

    .jordan-unread.hidden { display: none; }

    /* Bubble column (btn + label) */
    .jordan-bubble-col {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Bubble label */
    .jordan-bubble-label {
      font-size: 11px;
      color: rgba(245,245,245,.7);
      text-align: center;
      pointer-events: none;
      line-height: 1.35;
      margin-top: 6px;
      transition: opacity .3s;
    }

    .jordan-bubble.chat-open .jordan-bubble-label { opacity: 0; display: none; }

    @media (max-width: 480px) {
      .jordan-bubble-label { display: none; }
    }

    /* ===== TEASER ===== */
    .jordan-teaser {
      max-width: 260px;
      background: #191919;
      border: 1px solid #2a2a2a;
      border-radius: 14px;
      padding: 12px 16px;
      font-size: 13px;
      line-height: 1.5;
      color: #e0e0e0;
      box-shadow: 0 8px 24px rgba(0,0,0,.4);
      animation: jordan-teaser-in .3s ease;
      position: relative;
      cursor: pointer;
    }

    .jordan-teaser.hidden { display: none; }

    .jordan-teaser-close {
      position: absolute;
      top: 4px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: none;
      border: none;
      color: #666;
      font-size: 14px;
      line-height: 20px;
      text-align: center;
      cursor: pointer;
      padding: 0;
      -webkit-tap-highlight-color: transparent;
    }

    .jordan-teaser-close:hover { color: #aaa; }

    /* ===== CHAT WINDOW ===== */
    .jordan-chat {
      position: fixed;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      background: #111111;
      overflow: hidden;
      /* Hidden by default — animated in */
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px) scale(0.95);
      transform-origin: bottom ${pos};
      transition: opacity .3s ease, transform .35s cubic-bezier(.16,1,.3,1);
      /* Desktop defaults */
      bottom: 100px;
      ${pos}: 24px;
      width: 400px;
      height: 560px;
      border-radius: 16px;
      border: 1px solid #1f1f1f;
      box-shadow: 0 20px 60px rgba(0,0,0,.5), 0 0 40px rgba(93,255,191,.06);
    }

    .jordan-chat.open {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0) scale(1);
    }

    /* Close animation */
    .jordan-chat.closing {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: opacity .2s ease, transform .25s ease;
    }

    .jordan-chat.expanded {
      width: 50vw;
      height: calc(100vh - 140px);
    }

    /* ===== HEADER ===== */
    .jordan-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: #141414;
      border-bottom: 1px solid #1f1f1f;
      flex-shrink: 0;
    }

    .jordan-header-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #5dffbf 0%, #4ea5ff 50%, #c084fc 100%);
      background-size: 300% 300%;
      animation: jordan-gradient-spin 4s ease infinite;
      padding: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .jordan-header-avatar-inner {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      overflow: hidden;
      background: #0e0e0e;
    }

    .jordan-header-avatar-inner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .jordan-header-info { flex: 1; min-width: 0; }

    .jordan-header-name {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .jordan-header-name span {
      font-size: 14px;
      font-weight: 600;
      color: #5dffbf;
      font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
    }

    .jordan-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: #5dffbf;
      animation: jordan-pulse 2s ease-in-out infinite;
      flex-shrink: 0;
    }

    .jordan-header-sub {
      font-size: 11px;
      color: #888;
      margin-top: 1px;
    }

    .jordan-header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .jordan-header-btn {
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      border: none;
      background: transparent;
      color: #888;
      cursor: pointer;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .2s, color .2s;
      -webkit-tap-highlight-color: transparent;
    }

    .jordan-header-btn:hover { background: #1f1f1f; color: #ccc; }

    .jordan-expand-btn { display: flex; }

    /* ===== MESSAGES ===== */
    .jordan-messages {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      scroll-behavior: smooth;
      overscroll-behavior: contain;
    }

    .jordan-messages::-webkit-scrollbar { width: 4px; }
    .jordan-messages::-webkit-scrollbar-track { background: transparent; }
    .jordan-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }
    .jordan-messages::-webkit-scrollbar-thumb:hover { background: #3a3a3a; }

    .jordan-msg {
      max-width: 85%;
      padding: 10px 14px;
      font-size: 13.5px;
      line-height: 1.55;
      animation: jordan-slide-up .25s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    .jordan-msg a {
      color: #5dffbf;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .jordan-msg a:hover { opacity: .8; }

    .jordan-msg-assistant {
      align-self: flex-start;
      background: #191919;
      border: 1px solid #1f1f1f;
      border-left: 3px solid #5dffbf;
      border-radius: 2px 14px 14px 8px;
      color: #e0e0e0;
    }

    .jordan-msg-user {
      align-self: flex-end;
      background: linear-gradient(135deg, rgba(93,255,191,.12), rgba(78,165,255,.08));
      border: 1px solid rgba(93,255,191,.15);
      border-radius: 14px 2px 8px 14px;
      color: #f0f0f0;
    }

    /* Typing indicator */
    .jordan-typing {
      align-self: flex-start;
      display: flex;
      gap: 5px;
      padding: 12px 18px;
      background: #191919;
      border: 1px solid #1f1f1f;
      border-left: 3px solid #5dffbf;
      border-radius: 2px 14px 14px 8px;
      animation: jordan-slide-up .25s ease;
    }

    .jordan-typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 9999px;
      background: #5dffbf;
      animation: jordan-dot-bounce 1.2s ease-in-out infinite;
    }

    .jordan-typing-dot:nth-child(2) { animation-delay: .15s; }
    .jordan-typing-dot:nth-child(3) { animation-delay: .3s; }

    /* ===== QUICK REPLIES ===== */
    .jordan-quick-replies {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 4px 0 8px;
      animation: jordan-slide-up .3s ease;
    }

    .jordan-quick-btn {
      background: rgba(93,255,191,.06);
      border: 1px solid rgba(93,255,191,.2);
      border-radius: 10px;
      padding: 12px 14px;
      color: #e0e0e0;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.4;
      cursor: pointer;
      transition: all .2s ease;
      text-align: left;
      -webkit-tap-highlight-color: transparent;
    }

    .jordan-quick-btn:hover {
      background: rgba(93,255,191,.12);
      border-color: rgba(93,255,191,.35);
      color: #5dffbf;
      transform: translateY(-1px);
    }

    .jordan-quick-btn:active {
      transform: scale(.97);
    }

    .jordan-quick-btn strong {
      display: block;
      color: #f0f0f0;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .jordan-quick-btn small {
      color: #888;
      font-size: 11.5px;
    }

    /* ===== INPUT AREA ===== */
    .jordan-input-area {
      padding: 12px 16px;
      padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      background: #141414;
      border-top: 1px solid #1f1f1f;
      flex-shrink: 0;
    }

    .jordan-input-wrap {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 8px 8px 8px 14px;
      transition: border-color .2s;
    }

    .jordan-input-wrap:focus-within { border-color: rgba(93,255,191,.3); }

    .jordan-textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #f0f0f0;
      font-family: inherit;
      font-size: 16px;
      line-height: 1.45;
      resize: none;
      max-height: 100px;
      min-height: 22px;
      padding: 0;
      -webkit-appearance: none;
    }

    .jordan-textarea::placeholder { color: #555; }

    .jordan-attach-btn {
      width: 32px;
      height: 32px;
      min-width: 32px;
      background: transparent;
      border: none;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      transition: color .2s, background .2s;
      padding: 0;
    }
    .jordan-attach-btn:hover { color: #5dffbf; background: rgba(93,255,191,.08); }
    .jordan-attach-btn.has-file { color: #5dffbf; }

    .jordan-file-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin: 0 16px 4px;
      background: rgba(93,255,191,.06);
      border: 1px solid rgba(93,255,191,.15);
      border-radius: 8px;
      font-size: 12px;
      color: #ccc;
    }
    .jordan-file-preview .file-icon { font-size: 16px; }
    .jordan-file-preview .file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .jordan-file-preview .file-size { color: #888; font-size: 11px; }
    .jordan-file-preview .file-remove {
      background: none; border: none; color: #888; cursor: pointer; padding: 2px; font-size: 14px;
    }
    .jordan-file-preview .file-remove:hover { color: #ff6b6b; }
    .jordan-file-preview .file-status { font-size: 11px; }
    .jordan-file-preview .file-status.uploading { color: #f0c040; }
    .jordan-file-preview .file-status.uploaded { color: #5dffbf; }
    .jordan-file-preview .file-status.error { color: #ff6b6b; }

    .jordan-send-btn {
      width: 36px;
      height: 36px;
      min-width: 36px;
      min-height: 36px;
      border-radius: 9999px;
      border: none;
      background: #5dffbf;
      color: #0e0e0e;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity .2s, transform .15s;
      flex-shrink: 0;
      -webkit-tap-highlight-color: transparent;
    }

    .jordan-send-btn:disabled {
      opacity: .3;
      cursor: default;
      transform: none;
    }

    .jordan-send-btn:not(:disabled):hover { transform: scale(1.08); }
    .jordan-send-btn:not(:disabled):active { transform: scale(.92); }

    /* ===== FOOTER ===== */
    .jordan-footer {
      padding: 6px 16px 8px;
      text-align: center;
      font-size: 10px;
      color: #444;
      background: #141414;
      flex-shrink: 0;
    }

    /* ===== MOBILE (up to 768px for tablets too) ===== */
    @media (max-width: 768px) {
      .jordan-bubble {
        bottom: 20px;
        ${pos}: 16px;
      }

      .jordan-teaser { max-width: 200px; font-size: 12px; padding: 10px 14px; }

      .jordan-chat {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 100% !important;
        max-height: 100% !important;
        border-radius: 0 !important;
        border: none !important;
        box-shadow: none !important;
        overflow: hidden;
        padding-left: env(safe-area-inset-left, 0px);
        padding-right: env(safe-area-inset-right, 0px);
      }

      .jordan-chat.expanded {
        width: 100% !important;
        height: 100% !important;
      }

      .jordan-header {
        padding: calc(14px + env(safe-area-inset-top, 0px)) 16px 14px 16px !important;
      }

      .jordan-expand-btn { display: none !important; }

      .jordan-messages {
        -webkit-overflow-scrolling: touch;
        padding: 12px 16px !important;
      }

      .jordan-msg { max-width: 85% !important; font-size: 13px; }

      .jordan-input-area {
        padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px)) 16px !important;
      }

      .jordan-bubble-label { display: none; }

      .jordan-bubble.chat-open { display: none !important; }
    }

    /* Hide bubble when chat is open — animated */
    .jordan-bubble {
      transition: opacity .25s ease, transform .25s ease;
    }

    .jordan-bubble.chat-open {
      opacity: 0;
      pointer-events: none;
      transform: scale(0.5);
    }

    /* ===== EMBED MODE ===== */
    .jordan-chat.jordan-embed {
      position: relative !important;
      width: 100% !important;
      height: auto !important;
      bottom: auto !important;
      left: auto !important;
      right: auto !important;
      top: auto !important;
      border-radius: 20px !important;
      border: none !important;
      box-shadow: none !important;
      opacity: 1 !important;
      pointer-events: auto !important;
      transform: none !important;
      transition: none !important;
      overflow: hidden;
    }

    .jordan-chat.jordan-embed .jordan-messages {
      min-height: 300px;
      max-height: calc(100vh - 300px);
      max-height: calc(100dvh - 300px);
    }

    .jordan-chat.jordan-embed .jordan-close-btn { display: none; }

    @media (max-width: 768px) {
      .jordan-chat.jordan-embed {
        position: relative !important;
        height: auto !important;
        border-radius: 14px !important;
        border: none !important;
        box-shadow: none !important;
      }
      .jordan-chat.jordan-embed .jordan-messages {
        min-height: 200px;
        max-height: 55vh;
      }
      .jordan-chat.jordan-embed .jordan-expand-btn { display: none !important; }
    }

    @media (min-width: 1440px) {
      .jordan-chat.jordan-embed .jordan-messages {
        min-height: 400px;
        max-height: calc(100vh - 280px);
      }
    }
  `;

  // ========== WIDGET CLASS ==========

  class JordanWidget {
    constructor() {
      this.sessionId = this._getOrCreateSessionId();
      this.messages = this._loadMessages();
      this.extracted = this._loadExtracted();
      this._documentContext = this._loadDocumentContext();
      this.isOpen = false;
      this.isLoading = false;
      this.isExpanded = false;
      this.teaserDismissed = false;
      this.teaserTimer = null;
      this.teaserRotateTimer = null;
      this.teaserIndex = 0;
      this._prevBodyOverflow = '';
      this._startedAt = Date.now();
      this._pageOrigin = window.location.pathname;
      this._leadSent = false;
      this._isClosing = false;
      this._isEmbedded = !!CONFIG.embedTarget;
      this._init();
    }

    // -- Session (localStorage with 24h expiry) --

    _getOrCreateSessionId() {
      const session = this._loadSession();
      if (session && session.sessionId) return session.sessionId;
      const id = 'j_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      return id;
    }

    _loadSession() {
      try {
        const raw = localStorage.getItem('jordan_session');
        if (!raw) return null;
        const session = JSON.parse(raw);
        // Check 24h expiry
        const age = Date.now() - (session.startedAt || 0);
        if (age > 24 * 60 * 60 * 1000) {
          // Session expired — send pending data, then clean
          this._sendExpiredSession(session);
          localStorage.removeItem('jordan_session');
          return null;
        }
        return session;
      } catch (_) { return null; }
    }

    _loadMessages() {
      const session = this._loadSession();
      return session ? (session.messages || []) : [];
    }

    _loadExtracted() {
      const session = this._loadSession();
      const defaults = { nombre: '', email: '', telefono: '', empresa: '', tipo_proyecto: '', presupuesto: '', timeline: '' };
      return session ? Object.assign(defaults, session.extracted || {}) : defaults;
    }

    _loadDocumentContext() {
      const session = this._loadSession();
      return session ? (session.documentContext || null) : null;
    }

    _saveSession() {
      try {
        const session = {
          sessionId: this.sessionId,
          startedAt: this._startedAt || Date.now(),
          lastActivity: Date.now(),
          messages: this.messages,
          extracted: this.extracted,
          sent: this._leadSent || false,
          pageOrigin: window.location.pathname,
          documentContext: this._documentContext || null
        };
        localStorage.setItem('jordan_session', JSON.stringify(session));
      } catch (_) {}
    }

    _saveMessages() { this._saveSession(); }
    _saveExtracted() { this._saveSession(); }

    _sendExpiredSession(session) {
      // Send data from an expired session that was never sent
      if (session.sent) return;
      if (!session.messages || session.messages.length < 3) return;
      const ext = session.extracted || {};
      if (!ext.email && !ext.telefono) return;
      const payload = this._buildPayload(session.messages, ext, session.sessionId, session.pageOrigin);
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CONFIG.webhookUrl, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      }
    }

    // -- Init --

    _init() {
      if (this._isEmbedded) {
        this._initEmbed();
      } else {
        this._initFloating();
      }
    }

    _initFloating() {
      this.host = document.createElement('div');
      this.host.id = 'jordan-widget-v4';
      this.shadow = this.host.attachShadow({ mode: 'closed' });

      const style = document.createElement('style');
      style.textContent = WIDGET_CSS;
      this.shadow.appendChild(style);

      this._buildBubble();
      this._buildChat();

      document.body.appendChild(this.host);

      this._bindEvents();
      this._scheduleTeaser();
    }

    _initEmbed() {
      const target = document.querySelector(CONFIG.embedTarget);
      if (!target) { console.warn('[Jordan] embedTarget not found:', CONFIG.embedTarget); return; }

      this.host = target;
      this.shadow = target.attachShadow({ mode: 'closed' });

      const style = document.createElement('style');
      style.textContent = WIDGET_CSS;
      this.shadow.appendChild(style);

      // No bubble in embed mode
      this.bubbleEl = null;
      this.bubbleBtn = null;
      this.teaserEl = null;
      this.teaserTextEl = null;
      this.teaserCloseBtn = null;
      this.unreadDot = null;

      this._buildChat();
      this.chatEl.classList.add('jordan-embed');

      this._bindEvents();
      // No teaser in embed mode
    }

    _buildBubble() {
      this.bubbleEl = document.createElement('div');
      this.bubbleEl.className = 'jordan-bubble';
      this.bubbleEl.innerHTML = `
        <div class="jordan-teaser hidden" role="alert">
          <button class="jordan-teaser-close" aria-label="Cerrar">&times;</button>
          <span class="jordan-teaser-text"></span>
        </div>
        <div class="jordan-bubble-col">
          <button class="jordan-bubble-btn" aria-label="Abrir chat con Jordan">
            <span class="jordan-unread hidden"></span>
            <span class="jordan-avatar-wrap">
              ${CONFIG.avatar ? `<img src="${CONFIG.avatar}" alt="Jordan" width="58" height="58" loading="lazy">` : '<span style="font-size:28px;color:#5dffbf;">J</span>'}
            </span>
          </button>
          <span class="jordan-bubble-label">Habla con Jordan<br>Sin formularios</span>
        </div>
      `;
      this.shadow.appendChild(this.bubbleEl);

      this.bubbleBtn = this.bubbleEl.querySelector('.jordan-bubble-btn');
      this.teaserEl = this.bubbleEl.querySelector('.jordan-teaser');
      this.teaserTextEl = this.bubbleEl.querySelector('.jordan-teaser-text');
      this.teaserCloseBtn = this.bubbleEl.querySelector('.jordan-teaser-close');
      this.unreadDot = this.bubbleEl.querySelector('.jordan-unread');

      // Hide bubble when used as embedded chat (contacto page)
      if (CONFIG.hideBubble) {
        this.bubbleEl.style.display = 'none';
      }
    }

    _buildChat() {
      this.chatEl = document.createElement('div');
      this.chatEl.className = 'jordan-chat';
      this.chatEl.setAttribute('role', 'dialog');
      this.chatEl.setAttribute('aria-label', 'Chat con Jordan');
      this.chatEl.innerHTML = `
        <div class="jordan-header">
          <div class="jordan-header-avatar">
            <div class="jordan-header-avatar-inner">
              ${CONFIG.avatar ? `<img src="${CONFIG.avatar}" alt="Jordan" width="32" height="32">` : '<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:16px;color:#5dffbf;">J</span>'}
            </div>
          </div>
          <div class="jordan-header-info">
            <div class="jordan-header-name">
              <span>Jordan</span>
              <div class="jordan-status-dot"></div>
            </div>
            <div class="jordan-header-sub">Agente IA &middot; Tres Puntos</div>
          </div>
          <div class="jordan-header-actions">
            <button class="jordan-header-btn jordan-expand-btn" aria-label="Expandir chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
            </button>
            <button class="jordan-header-btn jordan-close-btn" aria-label="Cerrar chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="jordan-messages"></div>
        <div class="jordan-file-preview" style="display:none"></div>
        <div class="jordan-input-area">
          <div class="jordan-input-wrap">
            <button class="jordan-attach-btn" aria-label="Adjuntar archivo" title="Adjuntar archivo (max 3MB)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
            </button>
            <input type="file" class="jordan-file-input" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" style="display:none">
            <textarea class="jordan-textarea" rows="1" placeholder="Escribe aqu\u00ed..." aria-label="Mensaje"></textarea>
            <button class="jordan-send-btn" disabled aria-label="Enviar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
        <div class="jordan-footer">Tres Puntos &middot; Barcelona</div>
      `;
      this.shadow.appendChild(this.chatEl);

      this.messagesEl = this.chatEl.querySelector('.jordan-messages');
      this.textarea = this.chatEl.querySelector('.jordan-textarea');
      this.sendBtn = this.chatEl.querySelector('.jordan-send-btn');
      this.closeBtn = this.chatEl.querySelector('.jordan-close-btn');
      this.expandBtn = this.chatEl.querySelector('.jordan-expand-btn');
      this.attachBtn = this.chatEl.querySelector('.jordan-attach-btn');
      this.fileInput = this.chatEl.querySelector('.jordan-file-input');
      this.filePreviewEl = this.chatEl.querySelector('.jordan-file-preview');
      this._pendingFile = null; // { name, type, size, base64, driveUrl, status }
    }

    // -- Events --

    _bindEvents() {
      if (this.bubbleBtn) {
        this.bubbleBtn.addEventListener('click', () => this.open());
      }

      if (this.teaserEl) {
        this.teaserEl.addEventListener('click', (e) => {
          if (e.target === this.teaserCloseBtn || this.teaserCloseBtn.contains(e.target)) {
            this._hideTeaser();
            this.teaserDismissed = true;
          } else {
            this.open();
          }
        });
      }

      this.closeBtn.addEventListener('click', () => this.close());
      this.expandBtn.addEventListener('click', () => this._toggleExpand());

      this.textarea.addEventListener('input', () => {
        this._autoResize();
        this._updateSendBtn();
      });

      this.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this._sendMessage();
        }
      });

      this.sendBtn.addEventListener('click', () => this._sendMessage());

      // File attach
      this.attachBtn.addEventListener('click', () => {
        if (this._pendingFile) return; // Only 1 file per conversation
        this.fileInput.click();
      });
      this.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        this._handleFileSelect(file);
        this.fileInput.value = ''; // Reset for next selection
      });

      // Mobile keyboard handling via visualViewport API
      this._setupMobileKeyboard();

      // Focus scroll is handled by _setupMobileKeyboard for mobile

      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) this.close();
      });

      // Send lead data on page close — only if conversation happened
      window.addEventListener('beforeunload', () => {
        this._isClosing = true;
        this._sendLeadWebhook();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this._isClosing = true;
          this._sendLeadWebhook();
        }
      });
    }

    // -- Open / Close --

    open() {
      this.isOpen = true;

      if (!this._isEmbedded) {
        this._hideTeaser();
        this.teaserDismissed = true;
        if (this.unreadDot) this.unreadDot.classList.add('hidden');
        if (this.bubbleEl) this.bubbleEl.classList.add('chat-open');

        // Body scroll lock — overflow only, NO position:fixed (breaks iOS keyboard)
        this._prevBodyOverflow = document.body.style.overflow;
        this._prevHtmlOverflow = document.documentElement.style.overflow;
        this._scrollY = window.scrollY;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
      }

      this.chatEl.classList.add('open');

      // Welcome message on first open
      if (this.messages.length === 0) {
        this._addMessage('assistant', 'Hola. Soy Jordan. Sin formularios ni rollos. \u00bfQu\u00e9 proyecto tienes en mente?');
        this._checkForQuickReplies('');
      } else {
        this._renderMessages();
      }

      // Focus textarea after animation
      setTimeout(() => {
        this.textarea.focus();
        this._scrollToBottom();
      }, 100);
    }

    close() {
      this.isOpen = false;

      if (this._isEmbedded) {
        // Embed mode: notify page, send lead
        if (CONFIG.onClose) CONFIG.onClose();
        this._sendLeadWebhook();
        return;
      }

      // Animate close
      this.chatEl.classList.add('closing');
      this.chatEl.classList.remove('open');

      // Show bubble after close animation finishes (skip if bubble hidden)
      setTimeout(() => {
        this.chatEl.classList.remove('closing');
        if (!CONFIG.hideBubble && this.bubbleEl) {
          this.bubbleEl.classList.remove('chat-open');
        }
      }, 250);

      // Restore body scroll
      document.body.style.overflow = this._prevBodyOverflow || '';
      document.documentElement.style.overflow = this._prevHtmlOverflow || '';

      // Notify external code (contacto page hero restore)
      if (CONFIG.hideBubble && CONFIG.onClose) {
        CONFIG.onClose();
      }

      this._sendLeadWebhook();
    }

    // Public: open with an initial user message (used by contacto hero)
    openWithMessage(text) {
      this.open();
      if (text && text.trim()) {
        // Wait for welcome message to render, then send user message
        setTimeout(() => {
          this.textarea.value = text.trim();
          this._sendMessage();
        }, 600);
      }
    }

    _toggleExpand() {
      if (window.innerWidth <= 768) return;
      this.isExpanded = !this.isExpanded;
      this.chatEl.classList.toggle('expanded', this.isExpanded);
    }

    // -- Mobile Keyboard Handling --

    _setupMobileKeyboard() {
      if (window.innerWidth > 768 || this._isEmbedded) return;

      // Prevent iOS/Chrome auto-zoom on input focus by temporarily
      // adding maximum-scale=1 to the page viewport meta tag
      const vpMeta = document.querySelector('meta[name="viewport"]');
      const originalContent = vpMeta ? vpMeta.getAttribute('content') : '';

      this.textarea.addEventListener('focus', () => {
        if (!this.isOpen) return;
        // Disable zoom while typing
        if (vpMeta) {
          vpMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
        setTimeout(() => this._scrollToBottom(), 400);
      });

      this.textarea.addEventListener('blur', () => {
        // Restore original zoom ability
        if (vpMeta && originalContent) {
          vpMeta.setAttribute('content', originalContent);
        }
      });

      // Prevent iOS bounce outside messages area
      this.chatEl.addEventListener('touchmove', (e) => {
        const messages = this.messagesEl;
        if (!messages) return;
        if (!messages.contains(e.target) && !this.textarea.contains(e.target)) {
          e.preventDefault();
        }
      }, { passive: false });
    }

    // -- Teaser --

    _getPageContext() {
      const path = window.location.pathname;
      if (path.includes('/diseno-ux-ui') || path.includes('/ux-ui')) return 'uxui';
      if (path.includes('/desarrollo-web') || path.includes('/desarrollo')) return 'desarrollo';
      if (path.includes('/ia-generativa') || path.includes('/automatizacion') || path.includes('/ia-empresas') || path.includes('/agentes-ia')) return 'ia';
      if (path.includes('/consultoria') || path.includes('/auditoria') || path.includes('/arquitectura-digital')) return 'consultoria';
      if (path.includes('/tienda') || path.includes('/ecommerce') || path.includes('/woocommerce')) return 'ecommerce';
      if (path.includes('/contacto')) return 'contacto';
      return 'default';
    }

    _scheduleTeaser() {
      if (this._isEmbedded || CONFIG.hideBubble) return;
      if (!activeRule.proactive || this.teaserDismissed) return;
      if (this.messages.length > 0) return; // Returning user with history

      const delay = (activeRule.delay || 5) * 1000;
      this.teaserTimer = setTimeout(() => {
        if (!this.isOpen && !this.teaserDismissed) {
          this._showTeaser();
        }
      }, delay);
    }

    _showTeaser() {
      if (this.isOpen || this.teaserDismissed) return;
      const ctx = this._getPageContext();
      this._teaserMsgs = PAGE_MESSAGES[ctx] || PAGE_MESSAGES.default;
      this.teaserIndex = this.teaserIndex || 0;

      // Show current message
      this.teaserTextEl.textContent = this._teaserMsgs[this.teaserIndex];
      this.teaserEl.classList.remove('hidden');
      this.unreadDot.classList.remove('hidden');

      // Auto-hide after 8 seconds, then show next after 15 seconds
      this._teaserAutoHide = setTimeout(() => {
        this.teaserEl.classList.add('hidden');
        this.teaserIndex = (this.teaserIndex + 1) % this._teaserMsgs.length;

        // Schedule next message in 15 seconds
        this.teaserRotateTimer = setTimeout(() => {
          if (!this.isOpen && !this.teaserDismissed) {
            this._showTeaser();
          }
        }, 15000);
      }, 8000);
    }

    _hideTeaser() {
      if (!this.teaserEl) return;
      this.teaserEl.classList.add('hidden');
      if (this.teaserTimer) { clearTimeout(this.teaserTimer); this.teaserTimer = null; }
      if (this.teaserRotateTimer) { clearTimeout(this.teaserRotateTimer); this.teaserRotateTimer = null; }
      if (this._teaserAutoHide) { clearTimeout(this._teaserAutoHide); this._teaserAutoHide = null; }
    }

    // -- Messages --

    _renderMessages() {
      this.messagesEl.innerHTML = '';
      for (const msg of this.messages) {
        // Skip messages with empty/invalid content
        const content = typeof msg.content === 'string' ? msg.content : '';
        if (!content) continue;
        this._appendMessageDOM(msg.role, content, false);
      }
      this._scrollToBottom();
    }

    _addMessage(role, content) {
      // Ensure content is always a string
      if (typeof content !== 'string') content = content ? String(content) : '';
      this.messages.push({ role, content });
      this._saveMessages();
      this._appendMessageDOM(role, content, true);
      this._scrollToBottom();
    }

    _formatContent(text) {
      // Ensure text is a string
      if (typeof text !== 'string') text = text ? String(text) : '';
      // Escape HTML
      let safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // Markdown links [text](url) — before URL auto-linking
      safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
      // Bold **text**
      safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      // Italic *text*
      safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      // Line breaks
      safe = safe.replace(/\n/g, '<br>');
      // Standalone URLs (not already inside href="...")
      safe = safe.replace(/(?<!="|>)(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      // Email addresses
      safe = safe.replace(/([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
      return safe;
    }

    _appendMessageDOM(role, content, animate) {
      const div = document.createElement('div');
      div.className = `jordan-msg jordan-msg-${role}`;
      div.innerHTML = this._formatContent(content);
      if (!animate) div.style.animation = 'none';
      this.messagesEl.appendChild(div);
    }

    _renderTyping() {
      if (this.messagesEl.querySelector('.jordan-typing')) return;
      const el = document.createElement('div');
      el.className = 'jordan-typing';
      el.innerHTML = '<div class="jordan-typing-dot"></div><div class="jordan-typing-dot"></div><div class="jordan-typing-dot"></div>';
      this.messagesEl.appendChild(el);
      this._scrollToBottom();
    }

    _removeTyping() {
      const el = this.messagesEl.querySelector('.jordan-typing');
      if (el) el.remove();
    }

    _scrollToBottom() {
      requestAnimationFrame(() => {
        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
      });
    }

    // -- Quick Reply Buttons --

    _renderQuickReplies(buttons) {
      // Remove any existing quick replies
      this._removeQuickReplies();

      const container = document.createElement('div');
      container.className = 'jordan-quick-replies';

      for (const btn of buttons) {
        const el = document.createElement('button');
        el.className = 'jordan-quick-btn';
        if (typeof btn === 'string') {
          el.textContent = btn;
        } else {
          // Object format: { label: 'Title', sub: 'Description', value: 'sent text' }
          el.innerHTML = `<strong>${btn.label}</strong>${btn.sub ? `<small>${btn.sub}</small>` : ''}`;
        }
        el.addEventListener('click', () => {
          const value = typeof btn === 'string' ? btn : (btn.value || btn.label);
          this._removeQuickReplies();

          // Finalize conversation: send all data + show thank you
          if (value.startsWith('__finalize__')) {
            const msg = value.replace('__finalize__', '');
            this._addMessage('user', msg);
            this._addMessage('assistant', 'Perfecto. He enviado toda la información al equipo. Te contactamos en menos de 48 horas laborables. ¡Gracias por tu tiempo!');
            this._sendLeadWebhook();
            return;
          }

          // Calendly slot: open pre-filled URL
          if (value.startsWith('__calendly__')) {
            const url = value.replace('__calendly__', '');
            const params = new URLSearchParams();
            if (this.extracted.nombre) params.set('name', this.extracted.nombre);
            if (this.extracted.email) params.set('email', this.extracted.email);
            const fullUrl = url + (params.toString() ? (url.includes('?') ? '&' : '?') + params.toString() : '');

            // Show confirmation in chat
            const label = typeof btn === 'object' ? btn.label : 'Reservar reunión';
            this._addMessage('user', label);
            this._addMessage('assistant', 'Perfecto. Se abre la página de reserva con tus datos ya rellenados. Solo tienes que confirmar el horario. ¡Nos vemos pronto!');

            this.extracted.calendly_reservado = true;
            this._saveSession();

            window.open(fullUrl, '_blank');
            return;
          }

          this._extractFromQuickReply(value);
          // Simulate user typing and sending
          this.textarea.value = value;
          this._sendMessage();
        });
        container.appendChild(el);
      }

      this.messagesEl.appendChild(container);
      this._scrollToBottom();
    }

    _removeQuickReplies() {
      const existing = this.messagesEl.querySelectorAll('.jordan-quick-replies');
      existing.forEach(el => el.remove());
    }

    _checkForQuickReplies(assistantContent) {
      const lower = assistantContent.toLowerCase();
      const msgCount = this.messages.length;

      // Show quick replies on welcome message (first message)
      if (msgCount === 1) {
        setTimeout(() => {
          this._renderQuickReplies([
            { label: 'Rediseño web', sub: 'Tengo una web que no convierte', value: 'Necesito rediseñar mi web, no está convirtiendo como debería.' },
            { label: 'E-commerce', sub: 'Tienda online nueva o mejorada', value: 'Quiero montar o mejorar una tienda online.' },
            { label: 'Automatización / IA', sub: 'Optimizar procesos internos', value: 'Me interesa automatizar procesos con IA.' },
            { label: 'Otro proyecto', sub: 'Cuéntame más opciones', value: 'Tengo un proyecto diferente que quiero contarte.' }
          ]);
        }, 300);
        return;
      }

      // Show role/profile buttons when Jordan asks about the user's role
      const isRoleQuestion = lower.includes('?') && (
        (lower.includes('rol') && (lower.includes('qué') || lower.includes('desde'))) ||
        (lower.includes('ceo') && lower.includes('marketing')) ||
        (lower.includes('dueño') && (lower.includes('marketing') || lower.includes('técnico'))) ||
        (lower.includes('quién') && lower.includes('lleva')) ||
        (lower.includes('posición') || lower.includes('cargo'))
      );
      if (isRoleQuestion) {
        setTimeout(() => {
          this._renderQuickReplies([
            { label: 'CEO / Dueño', sub: 'Tomo las decisiones', value: 'Soy el CEO / dueño de la empresa.' },
            { label: 'Marketing', sub: 'Gestiono la estrategia digital', value: 'Llevo el marketing y la estrategia digital.' },
            { label: 'Responsable técnico', sub: 'Gestiono el desarrollo', value: 'Soy el responsable técnico / CTO.' },
            { label: 'Otro rol', sub: 'Mi rol es diferente', value: 'Mi rol es diferente, te cuento.' }
          ]);
        }, 300);
        return;
      }

      // PRIORITY 1: Show confirmation/close buttons when Jordan shows a data summary
      // Must run BEFORE budget/timeline checks because summary text contains those words
      const isDataConfirmation =
        (lower.includes('confirma') && lower.includes('datos')) ||
        (lower.includes('resumen') && lower.includes('tengo')) ||
        (lower.includes('todo correcto') || lower.includes('está bien'));
      if (isDataConfirmation) {
        setTimeout(() => {
          this._renderQuickReplies([
            { label: '✅ Todo correcto, enviar', sub: 'El equipo lo revisa en 24-48h', value: '__finalize__Todo correcto. Podéis revisar el proyecto.' },
            { label: '✏️ Quiero corregir algo', sub: 'Antes de enviar', value: 'Quiero corregir algún dato antes de enviar.' }
          ]);
        }, 300);
        return;
      }

      // Isolate last sentence for budget/timeline (avoids false positives from summary text)
      const sentences = lower.split(/[.!]\s+/);
      const lastSentence = sentences[sentences.length - 1] || '';

      // Show budget buttons — only if not already captured
      const isBudgetQuestion = !this.extracted.presupuesto && lastSentence.includes('?') && (
        (lastSentence.includes('presupuesto') && (lastSentence.includes('qué') || lastSentence.includes('cuánto') || lastSentence.includes('rango') || lastSentence.includes('manejáis'))) ||
        (lastSentence.includes('inversión') && (lastSentence.includes('qué') || lastSentence.includes('cuánto'))) ||
        (lastSentence.includes('rango') && (lastSentence.includes('económico') || lastSentence.includes('precio') || lastSentence.includes('manejáis')))
      );
      if (isBudgetQuestion) {
        setTimeout(() => {
          this._renderQuickReplies([
            { label: '5.000 € – 10.000 €', sub: 'Proyecto acotado', value: 'Nos manejamos en el rango de 5.000 a 10.000 euros.' },
            { label: '10.000 € – 15.000 €', sub: 'Proyecto medio', value: 'El rango sería entre 10.000 y 15.000 euros.' },
            { label: '15.000 € – 20.000 €', sub: 'Proyecto completo', value: 'El rango sería entre 15.000 y 20.000 euros.' },
            { label: '+ 20.000 €', sub: 'Proyecto complejo', value: 'La inversión sería de más de 20.000 euros.' }
          ]);
        }, 300);
        return;
      }

      // Show timeline buttons — only if not already captured
      const isTimelineQuestion = !this.extracted.timeline && lastSentence.includes('?') && (
        (lastSentence.includes('cuándo') && (lastSentence.includes('necesit') || lastSentence.includes('tener') || lastSentence.includes('listo') || lastSentence.includes('funciona'))) ||
        (lastSentence.includes('plazo') && (lastSentence.includes('qué') || lastSentence.includes('hay'))) ||
        (lastSentence.includes('urgencia') && lastSentence.includes('qué')) ||
        lastSentence.includes('timeline') ||
        (lastSentence.includes('fecha') && (lastSentence.includes('límite') || lastSentence.includes('tope')))
      );
      if (isTimelineQuestion) {
        setTimeout(() => {
          this._renderQuickReplies([
            { label: 'Urgente', sub: 'Menos de 1 mes', value: 'Es urgente, lo necesitamos en menos de un mes.' },
            { label: '1-3 meses', sub: 'Plazo razonable', value: 'El plazo sería de 1 a 3 meses.' },
            { label: '3+ meses', sub: 'Sin prisa', value: 'No hay prisa, más de 3 meses estaría bien.' },
            { label: 'Flexible', sub: 'Cuando esté bien hecho', value: 'El timing es flexible, lo importante es que quede bien.' }
          ]);
        }, 300);
        return;
      }

      // Show Calendly/closure buttons when Jordan proactively offers a meeting or next step
      const isClosureOffer =
        lower.includes('calendly') ||
        lower.includes('siguiente paso') ||
        lower.includes('en directo') ||
        (lower.includes('reunión') && (lower.includes('agendar') || lower.includes('reservar') || lower.includes('quieres') || lower.includes('merece'))) ||
        (lower.includes('agenda') && (lower.includes('ver') || lower.includes('déjame') || lower.includes('dejame'))) ||
        (lower.includes('llamada') && (lower.includes('agendar') || lower.includes('programar'))) ||
        (lower.includes('documento funcional') || lower.includes('doc funcional'));
      if (isClosureOffer) {
        // Fetch real Calendly slots and show them
        this._fetchAndShowCalendlySlots();
        return;
      }
    }

    // -- Calendly Integration --

    async _fetchAndShowCalendlySlots() {
      try {
        const resp = await fetch('https://n8n.trespuntos-lab.com/webhook/jordan-calendly-slots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: this.sessionId })
        });
        const data = await resp.json();

        if (data.success && data.slots && data.slots.length > 0) {
          const slotButtons = data.slots.map(s => ({
            label: s.label,
            sub: data.duration + ' · ' + data.location,
            value: '__calendly__' + s.scheduling_url
          }));

          // Add non-Calendly options
          slotButtons.push(
            { label: 'Ver más horarios', sub: 'Abrir calendario completo', value: '__calendly__https://calendly.com/trespuntos/jordi-exposito' },
            { label: 'Documento funcional', sub: 'Que el equipo lo analice', value: 'Prefiero recibir un documento funcional para que lo analice el equipo.' },
            { label: 'Que me llaméis', sub: 'Os dejo mi teléfono', value: 'Prefiero que me llaméis, os dejo mi teléfono.' }
          );

          setTimeout(() => this._renderQuickReplies(slotButtons), 300);
        } else {
          // Fallback: static options
          setTimeout(() => {
            this._renderQuickReplies([
              { label: 'Reservar reunión', sub: '30 min con Jordi', value: '__calendly__' + (data.fallback_url || 'https://calendly.com/trespuntos/jordi-exposito') },
              { label: 'Documento funcional', sub: 'Que el equipo lo analice', value: 'Prefiero recibir un documento funcional para que lo analice el equipo.' },
              { label: 'Que me llaméis', sub: 'Os dejo mi teléfono', value: 'Prefiero que me llaméis, os dejo mi teléfono.' }
            ]);
          }, 300);
        }
      } catch (_) {
        // On error, show static options
        setTimeout(() => {
          this._renderQuickReplies([
            { label: 'Reservar reunión', sub: '30 min con Jordi', value: '__calendly__https://calendly.com/trespuntos/jordi-exposito' },
            { label: 'Documento funcional', sub: 'Que el equipo lo analice', value: 'Prefiero recibir un documento funcional para que lo analice el equipo.' },
            { label: 'Que me llaméis', sub: 'Os dejo mi teléfono', value: 'Prefiero que me llaméis, os dejo mi teléfono.' }
          ]);
        }, 300);
      }
    }

    // -- Send --

    async _sendMessage() {
      const text = this.textarea.value.trim();
      if (!text || this.isLoading) return;

      this._removeQuickReplies();
      this._addMessage('user', text);
      this.textarea.value = '';
      this._autoResize();
      this._updateSendBtn();

      this.isLoading = true;
      this._renderTyping();

      try {
        // Clean messages for Anthropic API: only role + content (no timestamp or extra fields)
        const cleanMessages = this.messages.map(m => ({ role: m.role, content: m.content }));

        // Inject document context into system prompt if a file was analyzed
        let systemPrompt = SYSTEM_PROMPT;
        if (this._documentContext) {
          systemPrompt += '\n\n## DOCUMENTO SUBIDO POR EL USUARIO\nEl usuario ha subido un documento. Aquí está el análisis del contenido:\n' + this._documentContext + '\n\nUsa esta información para hacer preguntas más relevantes sobre su proyecto. Puedes referenciar detalles específicos del documento.';
        }

        const res = await fetch(CONFIG.proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            messages: cleanMessages,
            systemPrompt: systemPrompt,
            pageContext: window.location.pathname
          })
        });

        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();

        this._removeTyping();
        // Handle Anthropic API response format: { content: [{ type: "text", text: "..." }] }
        let assistantContent;
        if (data.content && Array.isArray(data.content) && data.content[0]) {
          assistantContent = data.content[0].text;
        } else if (typeof data.content === 'string') {
          assistantContent = data.content;
        } else {
          assistantContent = data.output || data.text || data.reply || 'No entendí. ¿Podrías repetir?';
        }
        // Ensure assistantContent is a string
        if (typeof assistantContent !== 'string') assistantContent = 'No entendí. ¿Podrías repetir?';
        this._addMessage('assistant', assistantContent);
        this._extractData(text);
        this._checkForQuickReplies(assistantContent);
      } catch (err) {
        console.error('[Jordan v4]', err);
        this._removeTyping();
        this._addMessage('assistant', 'Problemas t\u00e9cnicos. Escr\u00edbenos a hola@trespuntoscomunicacion.es');
      }

      this.isLoading = false;
      this._updateSendBtn();
      this._resetInactivityTimer();
    }

    // -- Data Extraction --

    _extractData(text) {
      // Email
      const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) this.extracted.email = emailMatch[0];

      // Phone — multiple Spanish formats
      const phonePatterns = [
        /(?:\+34[\s.-]?)?\b(\d{3}[\s.-]?\d{3}[\s.-]?\d{3})\b/,  // 666 123 456, 666-123-456, +34 666123456
        /\b(\d{9})\b/                                              // 666123456
      ];
      for (const p of phonePatterns) {
        const m = text.match(p);
        if (m) { this.extracted.telefono = m[1].replace(/[\s.\-]/g, ''); break; }
      }

      // Name patterns
      const namePatterns = [
        /me llamo\s+([A-Z\u00c0-\u00da][a-z\u00e0-\u00fa]+(?:\s+[A-Z\u00c0-\u00da][a-z\u00e0-\u00fa]+)?)/i,
        /soy\s+([A-Z\u00c0-\u00da][a-z\u00e0-\u00fa]+(?:\s+[A-Z\u00c0-\u00da][a-z\u00e0-\u00fa]+)?)/i,
        /nombre es\s+([A-Z\u00c0-\u00da][a-z\u00e0-\u00fa]+(?:\s+[A-Z\u00c0-\u00da][a-z\u00e0-\u00fa]+)?)/i
      ];
      for (const p of namePatterns) {
        const m = text.match(p);
        if (m) { this.extracted.nombre = m[1]; break; }
      }

      // Name from context: if Jordan recently asked for the name and user replies with 1-4 words
      if (!this.extracted.nombre && this.messages.length >= 3) {
        // Check last 3 assistant messages for name-asking patterns
        const recentAssistant = this.messages.filter(m => m.role === 'assistant').slice(-3);
        const nameAskPatterns = [
          'cómo te llam', 'como te llam', 'tu nombre', 'por cierto',
          'cómo te digo', 'como te digo', 'con quién habl', 'con quien habl',
          'quién eres', 'quien eres', 'presentarte', 'dime tu nombre'
        ];
        const jordanAskedName = recentAssistant.some(m =>
          nameAskPatterns.some(p => m.content.toLowerCase().includes(p))
        );
        if (jordanAskedName) {
          const words = text.trim().split(/\s+/);
          // Accept 1-4 words that start with capital or common name intro
          const cleaned = text.replace(/^(me llamo|soy|mi nombre es)\s*/i, '').trim();
          // Filter out role descriptors that are not names
          const rolWords = /^(el |la )?(ceo|cto|coo|cfo|cmo|director|directora|jefe|jefa|gerente|responsable|encargado|fundador|fundadora|dueño|dueña|propietario|propietaria|admin|administrador)/i;
          if (cleaned && words.length <= 4 && /^[A-ZÀ-Úa-zà-ú]/.test(cleaned) && !rolWords.test(cleaned)) {
            this.extracted.nombre = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
          }
        }
      }

      // Also extract name from Jordan's summary if widget missed it
      // (Jordan often repeats the name: "Perfecto, Maria" or "Maria, con todo lo que...")
      if (!this.extracted.nombre && this.messages.length >= 2) {
        const lastAssistant = this.messages.filter(m => m.role === 'assistant').slice(-1)[0];
        if (lastAssistant) {
          const summaryName = lastAssistant.content.match(/(?:perfecto|genial|bien|gracias),?\s+([A-ZÀ-Ú][a-zà-ú]+)/);
          if (summaryName) this.extracted.nombre = summaryName[1];
        }
      }

      // Role detection from free text
      if (!this.extracted.rol) {
        const rolPatterns = [
          { re: /\b(ceo|cto|coo|cfo|fundador|cofundador|dueño|propietario|director general)\b/i, rol: 'CEO / Dueño' },
          { re: /\b(marketing|growth|brand|comunicación|digital manager|head of digital)\b/i, rol: 'Marketing' },
          { re: /\b(desarrollador|dev|técnico|programador|ingeniero|it manager|tech lead|cto)\b/i, rol: 'Técnico' },
          { re: /\b(director de marketing|directora de marketing|responsable de marketing|jefe de marketing)\b/i, rol: 'Marketing' },
          { re: /\b(director|directora|gerente)\b/i, rol: 'CEO / Dueño' }
        ];
        for (const { re, rol } of rolPatterns) {
          if (re.test(text)) { this.extracted.rol = rol; break; }
        }
      }

      // Company patterns
      const companyPatterns = [
        /empresa(?:\s+se llama)?\s+([A-Z\u00c0-\u00da][\w\s]{1,40})/i,
        /trabajo en\s+([A-Z\u00c0-\u00da][\w\s]{1,40})/i,
        /somos\s+([A-Z\u00c0-\u00da][\w\s]{1,40})/i
      ];
      for (const p of companyPatterns) {
        const m = text.match(p);
        if (m) { this.extracted.empresa = m[1].trim(); break; }
      }

      this._saveExtracted();
    }

    // Extract structured data from quick reply button clicks
    _extractFromQuickReply(value) {
      // Project type
      if (value.includes('rediseñar mi web')) this.extracted.tipo_proyecto = 'Rediseño web';
      else if (value.includes('tienda online')) this.extracted.tipo_proyecto = 'E-commerce';
      else if (value.includes('automatizar procesos')) this.extracted.tipo_proyecto = 'Automatización / IA';
      else if (value.includes('proyecto diferente')) this.extracted.tipo_proyecto = 'Otro';

      // Budget (aligned with contact form ranges)
      if (value.includes('5.000 a 10.000')) this.extracted.presupuesto = '5K-10K';
      else if (value.includes('10.000 y 15.000')) this.extracted.presupuesto = '10K-15K';
      else if (value.includes('15.000 y 20.000')) this.extracted.presupuesto = '15K-20K';
      else if (value.includes('más de 20.000')) this.extracted.presupuesto = '+20K';

      // Role/Profile
      if (value.includes('CEO') || value.includes('dueño')) this.extracted.rol = 'CEO / Dueño';
      else if (value.includes('marketing') || value.includes('estrategia digital')) this.extracted.rol = 'Marketing';
      else if (value.includes('técnico') || value.includes('CTO')) this.extracted.rol = 'Técnico';
      else if (value.includes('Mi rol es diferente')) this.extracted.rol = 'Otro';

      // Timeline
      if (value.includes('menos de un mes')) this.extracted.timeline = 'Urgente (<30 días)';
      else if (value.includes('1 a 3 meses')) this.extracted.timeline = '1-3 meses';
      else if (value.includes('más de 3 meses')) this.extracted.timeline = '3+ meses';
      else if (value.includes('flexible')) this.extracted.timeline = 'Flexible';

      this._saveExtracted();
    }

    // -- Input Helpers --

    _autoResize() {
      this.textarea.style.height = 'auto';
      this.textarea.style.height = Math.min(this.textarea.scrollHeight, 100) + 'px';
    }

    _updateSendBtn() {
      this.sendBtn.disabled = !this.textarea.value.trim() || this.isLoading;
    }

    // -- Lead Webhook --

    _buildPayload(messages, extracted, sessionId, pageOrigin) {
      // Payload aligned with WF2 "Procesar Datos Chat" expected fields
      const conversationText = messages.map(m =>
        `[${m.role === 'user' ? 'Usuario' : 'Jordan'}] ${m.content}`
      ).join('\n');

      return {
        // Fields WF2 expects
        nombre: extracted.nombre || '',
        email: extracted.email || '',
        telefono: extracted.telefono || '',
        empresa: extracted.empresa || '',
        tipo_proyecto: extracted.tipo_proyecto || '',
        presupuesto: extracted.presupuesto || '',
        urgencia: extracted.timeline || '',
        rol: extracted.rol || '',
        conversacion_completa: conversationText,
        score: 0,  // WF2 calculates via IA scoring

        // Document if uploaded
        documento_nombre: extracted.documento_nombre || '',
        documento_drive_url: extracted.documento_drive_url || '',
        drive_folder_id: extracted.drive_folder_id || '',

        // Extra context
        sessionId: sessionId,
        url_origen: pageOrigin || window.location.pathname,
        mensajes_totales: messages.length,
        duracion_segundos: Math.round((Date.now() - (this._startedAt || Date.now())) / 1000),
        timestamp: new Date().toISOString()
      };
    }

    _sendLeadWebhook() {
      if (this._leadSent) return;
      if (this.messages.length < 3) return;
      // Don't send if no contact data at all (no email AND no phone)
      const hasContact = !!(this.extracted.email || this.extracted.telefono || this.extracted.nombre);
      if (!hasContact) return;

      this._leadSent = true;
      this._saveSession(); // Mark as sent in localStorage

      const payload = this._buildPayload(this.messages, this.extracted, this.sessionId, this._pageOrigin);

      // Try fetch first (more reliable when page is still open)
      // Fall back to sendBeacon for tab close scenarios
      if (document.visibilityState === 'hidden' || this._isClosing) {
        if (navigator.sendBeacon) {
          navigator.sendBeacon(CONFIG.webhookUrl, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        }
      } else {
        fetch(CONFIG.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {
          // Fallback to sendBeacon if fetch fails
          if (navigator.sendBeacon) {
            navigator.sendBeacon(CONFIG.webhookUrl, new Blob([JSON.stringify(payload)], { type: 'application/json' }));
          }
        });
      }
    }

    // -- Inactivity Timer (25 min warning, 30 min auto-send) --

    _resetInactivityTimer() {
      if (this._inactivityWarning) { clearTimeout(this._inactivityWarning); this._inactivityWarning = null; }
      if (this._inactivitySend) { clearTimeout(this._inactivitySend); this._inactivitySend = null; }

      if (!this.isOpen || this.messages.length < 2) return;

      // Warning at 25 minutes
      this._inactivityWarning = setTimeout(() => {
        if (!this.isOpen || this._leadSent) return;
        this._addMessage('assistant', '¿Seguimos? Si no respondes en 5 minutos guardaré lo que tenemos para que el equipo pueda revisarlo.');
      }, 25 * 60 * 1000);

      // Auto-send at 30 minutes
      this._inactivitySend = setTimeout(() => {
        if (!this._leadSent && this.messages.length >= 3) {
          this._addMessage('assistant', 'He guardado la conversación. El equipo la revisará. Cuando quieras retomar, aquí estoy.');
          this._sendLeadWebhook();
        }
      }, 30 * 60 * 1000);
    }

    // -- File Upload --

    _handleFileSelect(file) {
      // Validate size
      if (file.size > 3 * 1024 * 1024) {
        this._addMessage('assistant', 'El archivo es demasiado grande. Máximo 3MB.');
        return;
      }

      // Validate type
      const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'image/png', 'image/jpeg'];
      if (!allowed.includes(file.type)) {
        this._addMessage('assistant', 'Formato no soportado. Acepto PDF, Word, Excel e imágenes.');
        return;
      }

      // Show preview
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split('.').pop().toUpperCase();
      this._pendingFile = { name: file.name, type: file.type, size: file.size, base64: null, driveUrl: '', status: 'reading' };
      this._renderFilePreview();
      this.attachBtn.classList.add('has-file');

      // Read as base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:xxx;base64, prefix
        this._pendingFile.base64 = base64;
        this._pendingFile.status = 'uploading';
        this._renderFilePreview();
        this._uploadFile();
      };
      reader.onerror = () => {
        this._pendingFile.status = 'error';
        this._renderFilePreview();
      };
      reader.readAsDataURL(file);
    }

    _renderFilePreview() {
      if (!this._pendingFile) {
        this.filePreviewEl.style.display = 'none';
        return;
      }
      const f = this._pendingFile;
      const sizeMB = (f.size / (1024 * 1024)).toFixed(1);
      const ext = f.name.split('.').pop().toUpperCase();
      const icon = { PDF: '📄', DOCX: '📝', XLSX: '📊', PNG: '🖼️', JPG: '🖼️', JPEG: '🖼️' }[ext] || '📎';

      let statusHtml = '';
      if (f.status === 'reading') statusHtml = '<span class="file-status uploading">Leyendo...</span>';
      else if (f.status === 'uploading') statusHtml = '<span class="file-status uploading">Subiendo y analizando...</span>';
      else if (f.status === 'uploaded') statusHtml = '<span class="file-status uploaded">✓ Analizado</span>';
      else if (f.status === 'error') statusHtml = '<span class="file-status error">✗ Error</span>';

      this.filePreviewEl.innerHTML = `
        <span class="file-icon">${icon}</span>
        <span class="file-name">${f.name}</span>
        <span class="file-size">${sizeMB} MB · ${ext}</span>
        ${statusHtml}
        ${f.status !== 'uploading' ? '<button class="file-remove" title="Quitar">✕</button>' : ''}
      `;
      this.filePreviewEl.style.display = 'flex';

      const removeBtn = this.filePreviewEl.querySelector('.file-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          this._pendingFile = null;
          this.filePreviewEl.style.display = 'none';
          this.attachBtn.classList.remove('has-file');
        });
      }
    }

    async _uploadFile() {
      if (!this._pendingFile || !this._pendingFile.base64) return;

      const uploadUrl = (CONFIG.webhookUrl || '').replace('jordan-chat-leads', 'jordan-file-upload');

      try {
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            fileName: this._pendingFile.name,
            mimeType: this._pendingFile.type,
            fileSize: this._pendingFile.size,
            base64: this._pendingFile.base64,
            userName: this.extracted.nombre || '',
            userEmail: this.extracted.email || ''
          })
        });

        const data = await res.json();

        if (data.success) {
          this._pendingFile.driveUrl = data.driveUrl || '';
          this._pendingFile.folderId = data.folderId || '';
          this._pendingFile.status = 'uploaded';
          this._pendingFile.base64 = null; // Free memory
          this._renderFilePreview();

          // Store document analysis for conversation context
          if (data.analyzed && data.document_analysis) {
            this._documentContext = data.document_analysis;
            this._addMessage('assistant', `He recibido y analizado tu archivo "${this._pendingFile.name}". Ya tengo contexto sobre el contenido — pregúntame lo que necesites o seguimos con la conversación.`);
          } else {
            this._documentContext = null;
            this._addMessage('assistant', `He recibido tu archivo "${this._pendingFile.name}". El equipo lo revisará junto con la conversación.`);
          }

          // Save to extracted for the final payload
          this.extracted.documento_nombre = this._pendingFile.name;
          this.extracted.documento_drive_url = this._pendingFile.driveUrl;
          this.extracted.drive_folder_id = this._pendingFile.folderId;
          this._saveSession();
        } else {
          this._pendingFile.status = 'error';
          this._renderFilePreview();
          this._addMessage('assistant', data.error || 'No pude subir el archivo. Puedes enviarlo por email a hola@trespuntoscomunicacion.es');
        }
      } catch (err) {
        this._pendingFile.status = 'error';
        this._renderFilePreview();
        this._addMessage('assistant', 'Error al subir el archivo. Puedes enviarlo por email a hola@trespuntoscomunicacion.es');
      }
    }
  }

  // ========== BOOT ==========

  function boot() {
    const widget = new JordanWidget();

    // Expose public API for external integration (contacto, iniciar-proyecto)
    window.JordanAPI = {
      open: (msg) => { if (msg) widget.openWithMessage(msg); else widget.open(); },
      close: () => widget.close(),
      isOpen: () => widget.isOpen
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
