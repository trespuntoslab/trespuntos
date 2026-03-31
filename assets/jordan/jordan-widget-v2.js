/**
 * Jordan — Agente Conversacional Tres Puntos
 * Widget embebible v2.0 — Design System Aligned
 *
 * Uso: <script async src="jordan-widget.js"></script>
 *
 * Configuracion (antes del script):
 * window.JordanConfig = {
 *   // API key is handled server-side via n8n proxy — no key needed here
 *   webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
 *   avatar: '/assets/jordan/jordan-avatar.png',
 *   calendlyUrl: 'https://calendly.com/trespuntos/jordi-exposito',
 *   position: 'right',
 *   rules: [...]
 * };
 */

(function() {
  'use strict';
  if (window.__jordanWidgetLoaded) return;
  window.__jordanWidgetLoaded = true;

  // ========== CONFIG ==========

  const CONFIG = Object.assign({
    proxyUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-proxy',
    webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
    avatar: '',
    avatarVideo: '',
    calendlyUrl: 'https://calendly.com/trespuntos/jordi-exposito',
    position: 'right',
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

  // ========== SYSTEM PROMPT (v7.0 full) ==========

  const SYSTEM_PROMPT = `# Jordan — Agente Conversacional Tres Puntos v7.0
# Analista conversacional de preventa

## Identidad
Eres Jordan, el agente conversacional de Tres Puntos, agencia especializada en UX/UI y Arquitectura Digital de Conversion en Barcelona.
Tu trabajo: conversaciones naturales con visitantes de trespuntos.es, entender su proyecto, recoger datos de contacto de forma natural, y hacer discovery funcional real cuando el proyecto lo merece — base para documento funcional y presupuesto en 48h.
No eres formulario. No eres bot generico. Eres parte del equipo. Tu nombre es Jordan. Presentate siempre con ese nombre.

## Mensaje de bienvenida
Siempre: "Hola. Soy Jordan. Sin formularios ni rollos. Que proyecto tienes en mente?"

## REGLA MAESTRA
Jordan entiende el negocio del cliente para hacer mejores preguntas de PROYECTO — no para analizarlo. En cuanto entiendes el problema, PARA y pivota hacia que hay que construir. No sigas analizando el negocio. No preguntes metricas internas. No actues como consultor de estrategia.
Senal de que fallas: llevas mas de 2 preguntas seguidas sobre el negocio sin preguntar nada del proyecto. Si pasa, para y pivota.

## REGLA DE TONO — Sin reafirmaciones
NUNCA empieces una respuesta con confirmaciones vacias: "Perfecto", "Entendido", "Excelente", "Claro", "Genial", "Fantastico", "Estupendo", "De acuerdo", "Por supuesto". Responde directo al contenido sin acusar recibo.
MAL: "Perfecto. Dentix tiene API, podemos conectarlo." BIEN: "Dentix tiene API — podemos conectarlo."

## Equipo de Tres Puntos
Equipo mixto — personas y agentes IA. Mencionalos solo cuando aporte valor, nunca como catalogo.

Humano: Jordi (Digital Project Lead + UX/UI Senior), Dani (Project Manager), Alberto (Full Stack Developer), Cooper (Chief Happiness Officer).
Agentes IA: Jordan (tu, orquestador), Magic (research), Kobe (contenido), Bird (propuestas), Curry (SEO), Luka (automatizaciones), Rodman (diseno grafico).

## Personalidad y tono
- Experto con criterio: adaptas nivel tecnico al interlocutor
- Directo sin rodeos
- Cercano con autoridad: de profesional a profesional
- Orientado al proyecto
- Adaptable: evaluas y decides, no sigues guion rigido
- Primera persona plural: "Construimos", "Disenamos"
- Voz activa
- Frases cortas: max 20 palabras
- Sin emojis salvo que el visitante los use
- Sin formulas vacias: nada de "estariamos encantados"
- Una pregunta por mensaje, max dos si muy relacionadas
- Sin reafirmaciones al inicio: responde directo, sin acusar recibo

## Vocabulario
Usar: plataforma digital, construir, Arquitectura Digital de Conversion, conversion, friccion, deuda tecnica, escalar, ROI.
Nunca: agencia multidisciplinar, soluciones 360, transformacion digital, innovador, sinergia, web bonita, diseno web barato.

## Tres Puntos
Disenamos y construimos plataformas digitales que convierten trafico en clientes.
Servicios: UX/UI estrategico, desarrollo web a medida (WordPress mayoria, React/Next.js/Laravel para complejos), e-commerce (WooCommerce, PrestaShop, a medida), IA aplicada (n8n, agentes), consultoria, partner white-label.
Para webs corporativas usamos WordPress — autonomia al cliente.
REGLA ABSOLUTA: Jordan NUNCA menciona precios propios ni comenta si el presupuesto encaja.

## Dos velocidades
V1 — Cualificacion rapida: proyectos simples, recoge datos esenciales, cierra con siguiente paso.
V2 — Discovery funcional: leads cualificados. Se activa con 2+ senales: integraciones ERP/CRM/Sage/SAP, e-commerce B2B, multiples usuarios con permisos, presupuesto >10K, urgencia con fecha, contexto tecnico espontaneo, automatizacion/IA.

## Flujo de conversacion

FASE 1 (msg 1-3) — Escuchar: Deja que explique. No pidas datos. UNA pregunta de seguimiento:
- Rediseno: "Que es lo que mas os molesta de como funciona ahora?"
- E-commerce: "Vendes a consumidor final o a distribuidores?"
- Automatizacion: "Que proceso quereis quitaros de encima primero?"
- Vago: "Tienes algo construido ya o se empieza desde cero?"
Max 2 preguntas sobre negocio, luego pivota al proyecto.

FASE 2 (msg 3-4) — Nombre + contacto en secuencia:
1. Nombre: "Por cierto, como te llamo?"
2. Email (justo despues): "Te voy mandando el resumen. A que email te lo envio?"
3. Telefono (un msg despues): "Y un telefono por si el equipo necesita aclarar algo rapido?"
Si a los 5-6 msg no tienes nombre, pidelo. Minimo obligatorio: email O telefono.

FASE 3 (msg 3-5) — Perfil segun rol:
- CEO/Founder: habla de negocio, no tecnico. Que no funciona? Que frena el negocio?
- Marketing: captacion y conversion. Donde se pierden los leads?
- CTO/Tecnico: puedes ir tecnico. Que tecnologia? Mayor problema tecnico?
- E-commerce: ventas y operativa. B2B o B2C? Plataforma actual? Cuello de botella?

FASE 4 (msg 4-6) — Propuesta discovery: "[Nombre], si tienes 3 min recojo todo el contexto. Documento funcional y presupuesto en 48h. Seguimos?"

FASE 5 — Discovery por tipo:
REGLA CRITICA: en cuanto tienes contexto del problema, PARA y pivota a que hay que construir.
Preguntas de proyecto: secciones/modulos, integraciones, identidad visual, contenidos, gestion posterior.
NUNCA preguntar: cuantos empleados, cuanto facturais, cuantos leads/mes, quien es vuestro cliente ideal.

WEB CORPORATIVA — OBLIGATORIO cubrir Nivel 1 ANTES de presupuesto: existe algo o desde cero, objetivo (leads/marca/ambas), integraciones (CRM, email marketing), identidad visual, cuantas secciones. Nivel 2 si justifica: gestion contenidos, idiomas, blog, area privada, formularios complejos.
E-COMMERCE — Clasificar: B2C o B2B. OBLIGATORIO cubrir Nivel 1 ANTES de presupuesto: referencias producto, plataforma actual, precios personalizados, integracion ERP/almacen. Nivel 2: paises, idiomas/monedas, area cliente, stock, pasarela pago. Logica: B2C pequeno=WooCommerce, B2C grande=PrestaShop, B2B complejo=a medida.
AUTOMATIZACION/IA — OBLIGATORIO antes de presupuesto: que proceso, que herramientas conectar, algo en marcha o nuevo, objetivo (tiempo/experiencia/ambas).
AUTOMATIZACION/IA — Que proceso, que herramientas conectar, algo en marcha o nuevo, objetivo (tiempo interno/experiencia cliente/ambas).
CONSULTORIA — Que os hace pensar que hay problema, agencia anterior, hipotesis del fallo.
WHITE-LABEL — Tipo proyectos, equipo puntual o continuo, fase llegada, stack tecnologico.

FASE 5B — Discovery profundo (solo V2): una pregunta por mensaje, intercala observaciones de valor.
Progreso: "Ya tenemos lo importante. Un par mas." / "Casi lo tenemos. Una ultima cosa." / "Perfecto. El equipo ya puede preparar algo concreto."
Bloques: contexto actual + sistemas, usuarios/roles/permisos, integraciones/dependencias, restricciones (tech/idiomas/plazos), puntos abiertos.

FASE 6 — Presupuesto: "Os manejais por debajo de 5K, entre 5K-15K, o mayor inversion?" + urgencia + decisor.
IMPORTANTE: NO preguntar presupuesto hasta haber cubierto las preguntas de Nivel 1 del tipo de proyecto.
NUNCA mencionar precios propios, comentar si encaja, negociar alcance.

FASE 7 — Scoring y cierre:
5K-15K: +1. >15K: +2. Urgencia fecha: +2. Decisor: +2. Complejo: +1. Discovery completo: +2. Parcial: +1. Solo explorando: -1. Sin contacto ni discovery: -1. <5K: -2.
Score 7-10: Calendly. Score 4-6: "equipo te escribe en 24h". Score 1-3: cierre educado. Sin contacto: pedir email/telefono.

## Situaciones especiales
Precio: "Depende del alcance. Cuentame que necesitais — el equipo llega con algo concreto."
Insiste precio: "Trabajamos con proyectos de distinta envergadura — prefiero entender primero que necesitais."
Hablar con alguien: "Claro. Dame tu email o telefono y alguien del equipo te contacta hoy."
No sabe: "Cuentame que problema tienes — si no convierte, limita crecimiento, o no os representa bien."
Enfadado agencia: "Nos llegan casos asi. El problema suele ser que se construyo sin pensar en el negocio. Cuentanos que falla."
Eres un bot: "Soy Jordan, el agente de Tres Puntos. Recojo contexto para que el equipo llegue preparado. Si prefieres hablar directamente, dame tu contacto."

## NUNCA
1. Analizar negocio interno (facturacion, empleados, rentabilidad)
2. Mas de 2 preguntas seguidas sobre negocio sin pivotar
3. Mencionar precios propios
4. Datos antes del mensaje 3
5. Cerrar sin email O telefono
6. Sonar a bot
7. Multiples preguntas seguidas
8. Lenguaje corporativo vacio
9. Metricas tecnicas a no-tecnicos
10. Prometer lo que no puedes
11. Criticar agencias por nombre
12. Inventar datos o casos
13. Calendly a score <7 o presupuesto <5K
14. Guion rigido
15. Legal/cookies/politicas
16. Preguntar cuantos empleados
17. Empezar mensajes con reafirmaciones (Perfecto, Entendido, Excelente, Claro, Genial)
18. Saltarse preguntas de Nivel 1 de web corporativa o e-commerce antes de presupuesto

IMPORTANTE: Respuestas cortas y naturales. 2-4 frases. Esto es un chat, no un email.`;

  // ========== STYLES (Design System Aligned) ==========

  const WIDGET_CSS = `
    /* Fonts inherited from page — Inter + Plus Jakarta Sans already loaded */

    :host {
      all: initial;
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #f5f5f5;
      -webkit-font-smoothing: antialiased;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ===== BUBBLE ===== */
    .jordan-bubble {
      position: fixed;
      bottom: 24px;
      ${CONFIG.position === 'left' ? 'left: 24px;' : 'right: 24px;'}
      z-index: 2147483647;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 12px;
      ${CONFIG.position === 'left' ? 'flex-direction: row;' : 'flex-direction: row-reverse;'}
    }

    @keyframes jordan-gradient-spin {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    .jordan-bubble-btn {
      width: 82px;
      height: 82px;
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
      padding: 3.5px;
    }

    .jordan-bubble-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 0 40px rgba(93,255,191,.4), 0 6px 28px rgba(0,0,0,.4);
    }

    .jordan-bubble-btn .jordan-avatar-wrapper {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      overflow: hidden;
      background: #0e0e0e;
    }

    .jordan-bubble-btn .jordan-avatar {
      width: 100%;
      height: 100%;
      border-radius: 9999px;
      object-fit: cover;
      object-position: center 15%;
      display: block;
    }

    .jordan-bubble-btn video.jordan-avatar {
      object-position: center center;
    }

    .jordan-bubble-btn .jordan-avatar-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #0e0e0e;
      background: #0e0e0e;
      border-radius: 9999px;
    }

    .jordan-bubble-btn .jordan-close-icon {
      position: absolute;
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
      transition: all .3s ease;
    }

    .jordan-bubble-btn.is-open {
      width: 52px;
      height: 52px;
      background: #1f1f1f;
      animation: none;
      box-shadow: 0 4px 16px rgba(0,0,0,.4);
      padding: 0;
    }

    .jordan-bubble-btn.is-open:hover {
      background: #2a2a2a;
    }

    .jordan-bubble-btn.is-open .jordan-avatar-wrapper {
      opacity: 0;
      transform: scale(0.5);
      transition: all .3s ease;
      position: absolute;
    }

    .jordan-bubble-btn.is-open .jordan-close-icon {
      opacity: 1;
      transform: rotate(0) scale(1);
    }

    /* Bubble column layout */
    .jordan-bubble-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .jordan-bubble-label {
      font-size: 11px;
      color: rgba(245,245,245,.75);
      text-align: center;
      pointer-events: none;
      transition: opacity .3s;
      line-height: 1.4;
    }

    .jordan-bubble-btn.is-open ~ .jordan-bubble-label { opacity: 0; display: none; }
    .jordan-bubble-btn.is-open .jordan-unread { display: none; }

    @media (max-width: 480px) {
      .jordan-bubble-label { display: none; }
    }

    /* Teaser */
    .jordan-teaser {
      background: #141414;
      padding: 10px 16px;
      border-radius: 10px;
      border: 1px solid #2a2a2a;
      box-shadow: 0 8px 32px rgba(0,0,0,.6);
      font-size: 13px;
      color: #f5f5f5;
      max-width: 240px;
      line-height: 1.4;
      opacity: 0;
      transform: translateY(8px);
      transition: all .4s cubic-bezier(.34,1.56,.64,1);
      pointer-events: none;
      position: relative;
    }

    .jordan-teaser.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .jordan-teaser-close {
      position: absolute;
      top: -6px;
      ${CONFIG.position === 'left' ? 'right: -6px;' : 'left: -6px;'}
      width: 18px;
      height: 18px;
      border-radius: 9999px;
      background: #2a2a2a;
      border: none;
      color: #8a8a8a;
      font-size: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: background .15s;
    }

    .jordan-teaser-close:hover { background: #3a3a3a; color: #f5f5f5; }

    /* Unread dot */
    .jordan-unread {
      position: absolute;
      top: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      background: #5dffbf;
      border-radius: 9999px;
      border: 2px solid #0e0e0e;
      animation: jordan-pulse 2s infinite;
    }

    @keyframes jordan-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    /* ===== CHAT WINDOW ===== */
    .jordan-chat {
      position: fixed;
      bottom: 110px;
      ${CONFIG.position === 'left' ? 'left: 24px;' : 'right: 24px;'}
      width: 400px;
      height: 560px;
      background: #0e0e0e;
      border-radius: 14px;
      border: 1px solid #2a2a2a;
      box-shadow: 0 8px 32px rgba(0,0,0,.6), 0 2px 8px rgba(0,0,0,.4);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      z-index: 2147483646;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      transform-origin: bottom ${CONFIG.position === 'left' ? 'left' : 'right'};
      transition: all .4s cubic-bezier(.34,1.56,.64,1);
      pointer-events: none;
    }

    .jordan-chat.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }

    /* Header */
    .jordan-header {
      background: #141414;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
      border-bottom: 1px solid #1f1f1f;
    }

    .jordan-header-avatar {
      width: 36px;
      height: 36px;
      border-radius: 9999px;
      overflow: hidden;
      flex-shrink: 0;
      background: linear-gradient(135deg, #5dffbf 0%, #4ea5ff 50%, #c084fc 100%);
      padding: 1.5px;
    }

    .jordan-header-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 20%;
      border-radius: 9999px;
    }

    .jordan-header-avatar .jordan-avatar-sm {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0e0e0e;
      color: #5dffbf;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 800;
      border-radius: 9999px;
    }

    .jordan-header-info h3 {
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 14px;
      font-weight: 700;
      color: #f5f5f5;
      margin: 0;
      letter-spacing: -.01em;
    }

    .jordan-header-info p {
      font-size: 11px;
      color: #8a8a8a;
      margin: 0;
    }

    .jordan-expand {
      background: none;
      border: none;
      color: #8a8a8a;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color .2s, background .2s;
      margin-left: auto;
    }

    .jordan-expand:hover {
      color: #5dffbf;
      background: rgba(93,255,191,.08);
    }

    .jordan-header-status {
      width: 8px;
      height: 8px;
      background: #5dffbf;
      border-radius: 9999px;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(93,255,191,.4);
    }

    /* Expanded mode */
    .jordan-chat.expanded {
      width: 50vw;
      min-width: 480px;
      max-width: 800px;
      height: calc(100vh - 140px);
      bottom: 110px;
      border-radius: 16px;
    }

    .jordan-chat.expanded .jordan-expand svg {
      transform: rotate(180deg);
    }

    /* Messages */
    .jordan-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #0e0e0e;
    }

    .jordan-messages::-webkit-scrollbar { width: 4px; }
    .jordan-messages::-webkit-scrollbar-track { background: transparent; }
    .jordan-messages::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 4px; }

    .jordan-msg {
      max-width: 82%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 13.5px;
      line-height: 1.55;
      word-wrap: break-word;
      animation: jordan-msg-in .3s cubic-bezier(.34,1.56,.64,1);
    }

    @keyframes jordan-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .jordan-msg-assistant {
      align-self: flex-start;
      background: #191919;
      border: 1px solid #1f1f1f;
      color: #f5f5f5;
      border-bottom-left-radius: 4px;
    }

    .jordan-msg-user {
      align-self: flex-end;
      background: linear-gradient(135deg, rgba(93,255,191,.15), rgba(78,165,255,.1));
      border: 1px solid rgba(93,255,191,.2);
      color: #f5f5f5;
      border-bottom-right-radius: 4px;
    }

    /* Typing indicator */
    .jordan-typing {
      align-self: flex-start;
      background: #191919;
      border: 1px solid #1f1f1f;
      padding: 12px 18px;
      border-radius: 14px;
      border-bottom-left-radius: 4px;
    }

    .jordan-typing-dots {
      display: flex;
      gap: 4px;
    }

    .jordan-typing-dots span {
      width: 6px;
      height: 6px;
      background: #5dffbf;
      border-radius: 9999px;
      animation: jordan-typing 1.4s infinite;
    }

    .jordan-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
    .jordan-typing-dots span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes jordan-typing {
      0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
      30% { opacity: 1; transform: translateY(-4px); }
    }

    /* Calendly button */
    .jordan-calendly-btn {
      display: inline-block;
      margin-top: 8px;
      padding: 10px 20px;
      background: linear-gradient(135deg, #5dffbf 0%, #4ea5ff 100%);
      color: #0e0e0e;
      border: none;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all .25s ease;
      box-shadow: 0 0 16px rgba(93,255,191,.2);
    }

    .jordan-calendly-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 0 24px rgba(93,255,191,.3);
    }

    /* Input area */
    .jordan-input-area {
      padding: 12px 16px;
      border-top: 1px solid #1f1f1f;
      display: flex;
      gap: 8px;
      align-items: flex-end;
      background: #141414;
      flex-shrink: 0;
    }

    .jordan-input {
      flex: 1;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      padding: 10px 14px;
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      resize: none;
      outline: none;
      max-height: 100px;
      line-height: 1.4;
      color: #f5f5f5;
      background: #191919;
      transition: border-color .15s;
    }

    .jordan-input:focus { border-color: #5dffbf; }
    .jordan-input::placeholder { color: #8a8a8a; }

    .jordan-send {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: #5dffbf;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all .25s ease;
    }

    .jordan-send:hover { background: #49e6a8; box-shadow: 0 0 16px rgba(93,255,191,.3); }
    .jordan-send:disabled { background: #2a2a2a; cursor: not-allowed; box-shadow: none; }
    .jordan-send svg { width: 16px; height: 16px; }

    /* Powered by */
    .jordan-powered {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #8a8a8a;
      background: #141414;
      border-top: 1px solid #1f1f1f;
    }

    .jordan-powered a { color: #5dffbf; text-decoration: none; }

    /* ===== MOBILE ===== */
    @media (max-width: 480px) {
      .jordan-chat {
        width: 100vw;
        height: 100dvh;
        bottom: 0;
        left: 0;
        right: 0;
        top: 0;
        border-radius: 0;
        border: none;
        transform-origin: bottom center;
        padding: 0;
        max-height: 100dvh;
        padding-bottom: max(12px, env(safe-area-inset-bottom));
      }

      .jordan-header {
        padding: 12px 16px;
        padding-top: max(12px, env(safe-area-inset-top));
        gap: 10px;
      }

      .jordan-messages {
        padding: 12px;
        padding-bottom: 8px;
        gap: 8px;
      }

      .jordan-msg { max-width: 88%; font-size: 13px; padding: 8px 12px; }

      .jordan-input-area {
        padding: 12px 16px;
        padding-bottom: max(12px, calc(12px + env(safe-area-inset-bottom)));
        gap: 8px;
        position: relative;
        z-index: 10;
        background: #141414;
        border-top: 1px solid #1f1f1f;
      }

      .jordan-input {
        padding: 10px 12px;
        font-size: 14px;
        max-height: 80px;
      }

      .jordan-send {
        width: 40px;
        height: 40px;
        flex-shrink: 0;
      }

      .jordan-powered {
        padding: 6px 12px;
        font-size: 9px;
      }

      .jordan-bubble {
        bottom: 20px;
        ${CONFIG.position === 'left' ? 'left: 16px;' : 'right: 16px;'}
      }

      .jordan-expand {
        padding: 6px;
      }

      /* Prevent scrolling behind keyboard */
      .jordan-chat.open {
        position: fixed;
        top: 0;
      }

      /* Input grows on focus but stays within bounds */
      .jordan-input:focus {
        max-height: 100px;
      }

      /* Ensure messages scroll properly */
      .jordan-messages {
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }

      /* Better touch targets on mobile */
      .jordan-send, .jordan-expand {
        min-height: 44px;
        min-width: 44px;
      }
    }
  `;

  // ========== PAGE MESSAGES (from widget-spec) ==========

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

  function getMessagesForPage() {
    const path = window.location.pathname;
    if (path.includes('/servicios/diseno-ux-ui') || path.includes('/ux-ui')) return PAGE_MESSAGES.uxui;
    if (path.includes('/servicios/desarrollo-web') || path.includes('/desarrollo')) return PAGE_MESSAGES.desarrollo;
    if (path.includes('/servicios/ia-generativa') || path.includes('/automatizacion') || path.includes('/ia')) return PAGE_MESSAGES.ia;
    if (path.includes('/servicios/consultoria') || path.includes('/auditoria') || path.includes('/arquitectura-digital')) return PAGE_MESSAGES.consultoria;
    if (path.includes('/tienda') || path.includes('/ecommerce') || path.includes('/woocommerce') || path.includes('/prestashop')) return PAGE_MESSAGES.ecommerce;
    if (path.includes('/contacto') || path.includes('/contact')) return PAGE_MESSAGES.contacto;
    return PAGE_MESSAGES.default;
  }

  // ========== WIDGET CLASS ==========

  class JordanWidget {
    constructor() {
      this.isOpen = false;
      this.conversationHistory = [];
      this.webhookSent = false;
      this.userMessageCount = 0;
      this.extractedData = {};
      this.teaserDismissed = false;
      this.chatInitialized = false;
      this.calendlyShown = false;
      this.messageIndex = 0;

      // Restore session if exists
      this.restoreSession();
      this.teaserTimer = null;
      this.teaserAutoHideTimer = null;
      this.teaserCycleTimer = null;

      this.createWidget();
      this.applyPageRules();
    }

    // ---- Page Rules ----
    applyPageRules() {
      const path = window.location.pathname;

      // Hide on excluded pages
      const hiddenPatterns = ['/blog/', '/checkout/', '/login', '/admin/', '/politica-', '/aviso-legal'];
      if (hiddenPatterns.some(p => path.includes(p) || path === p.replace(/\/$/, ''))) {
        this.host.style.display = 'none';
        return;
      }

      // Start teaser rotation after 5 seconds
      this.teaserTimer = setTimeout(() => {
        if (!this.isOpen && !this.teaserDismissed) {
          this.startTeaserRotation();
        }
      }, 5000);
    }

    startTeaserRotation() {
      const messages = getMessagesForPage();
      this.showTeaser(messages[this.messageIndex]);

      // Auto-hide after 8 seconds
      this.teaserAutoHideTimer = setTimeout(() => {
        this.hideTeaser();

        // Next message after 15 seconds
        this.teaserCycleTimer = setTimeout(() => {
          if (!this.isOpen && !this.teaserDismissed) {
            this.messageIndex = (this.messageIndex + 1) % messages.length;
            this.startTeaserRotation();
          }
        }, 15000);
      }, 8000);
    }

    stopTeaserRotation() {
      clearTimeout(this.teaserTimer);
      clearTimeout(this.teaserAutoHideTimer);
      clearTimeout(this.teaserCycleTimer);
    }

    // ---- Create DOM ----
    createWidget() {
      this.host = document.createElement('div');
      this.host.id = 'jordan-widget';
      const shadow = this.host.attachShadow({ mode: 'closed' });

      const style = document.createElement('style');
      style.textContent = WIDGET_CSS;
      shadow.appendChild(style);

      const avatarHtml = CONFIG.avatarVideo
        ? `<div class="jordan-avatar-wrapper"><video class="jordan-avatar" src="${CONFIG.avatarVideo}" autoplay muted playsinline></video></div>`
        : CONFIG.avatar
          ? `<div class="jordan-avatar-wrapper"><img class="jordan-avatar" src="${CONFIG.avatar}" alt="Jordan"></div>`
          : `<div class="jordan-avatar-wrapper"><div class="jordan-avatar-fallback">J</div></div>`;

      const avatarSmHtml = CONFIG.avatar
        ? `<img src="${CONFIG.avatar}" alt="Jordan" style="width:100%;height:100%;object-fit:cover;object-position:center 20%;border-radius:9999px;">`
        : `<div class="jordan-avatar-sm">J</div>`;

      const bubble = document.createElement('div');
      bubble.className = 'jordan-bubble';
      bubble.innerHTML = `
        <div class="jordan-bubble-col">
          <button class="jordan-bubble-btn" aria-label="Abrir chat con Jordan">
            ${avatarHtml}
            <svg class="jordan-close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f5f5f5" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <div class="jordan-unread"></div>
          </button>
          <span class="jordan-bubble-label">Habla con Jordan<br>Sin formularios</span>
        </div>
        <div class="jordan-teaser">
          <button class="jordan-teaser-close">&times;</button>
          <span class="jordan-teaser-text"></span>
        </div>
      `;
      shadow.appendChild(bubble);

      // Video avatar: loop baked into the file, just replay on end
      if (CONFIG.avatarVideo) {
        const vid = bubble.querySelector('video.jordan-avatar');
        if (vid) vid.addEventListener('ended', () => { vid.currentTime = 0; vid.play(); });
      }

      const chat = document.createElement('div');
      chat.className = 'jordan-chat';
      chat.innerHTML = `
        <div class="jordan-header">
          <div class="jordan-header-avatar">${avatarSmHtml}</div>
          <div class="jordan-header-info">
            <h3>Jordan — Tres Puntos</h3>
            <p>Agente IA</p>
          </div>
          <button class="jordan-expand" aria-label="Expandir chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <div class="jordan-header-status"></div>
        </div>
        <div class="jordan-messages"></div>
        <div class="jordan-input-area">
          <textarea class="jordan-input" rows="1" placeholder="Escribe tu mensaje..."></textarea>
          <button class="jordan-send" aria-label="Enviar">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0e0e0e" stroke-width="2.5" stroke-linecap="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        <div class="jordan-powered">Powered by <a href="https://trespuntoscomunicacion.es" target="_blank">Tres Puntos</a></div>
      `;
      shadow.appendChild(chat);

      this.shadow = shadow;
      this.bubbleBtn = shadow.querySelector('.jordan-bubble-btn');
      this.unreadDot = shadow.querySelector('.jordan-unread');
      this.teaser = shadow.querySelector('.jordan-teaser');
      this.teaserText = shadow.querySelector('.jordan-teaser-text');
      this.teaserClose = shadow.querySelector('.jordan-teaser-close');
      this.chatEl = shadow.querySelector('.jordan-chat');
      this.messagesEl = shadow.querySelector('.jordan-messages');
      this.inputEl = shadow.querySelector('.jordan-input');
      this.sendBtn = shadow.querySelector('.jordan-send');
      this.expandBtn = shadow.querySelector('.jordan-expand');

      this.bubbleBtn.addEventListener('click', () => this.toggle());
      this.expandBtn.addEventListener('click', () => this.toggleExpand());
      this.teaserClose.addEventListener('click', (e) => { e.stopPropagation(); this.hideTeaser(); this.teaserDismissed = true; this.stopTeaserRotation(); });
      this.teaser.addEventListener('click', () => { this.hideTeaser(); this.stopTeaserRotation(); this.open(); });
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); }
      });
      this.inputEl.addEventListener('input', () => {
        this.inputEl.style.height = 'auto';
        this.inputEl.style.height = Math.min(this.inputEl.scrollHeight, 100) + 'px';
      });

      document.body.appendChild(this.host);
    }

    showTeaser(message) {
      this.teaserText.textContent = message;
      this.teaser.classList.add('visible');
      this.proactiveShown = true;
    }

    hideTeaser() { this.teaser.classList.remove('visible'); }

    toggle() { this.isOpen ? this.close() : this.open(); }

    open() {
      this.isOpen = true;
      this.chatEl.classList.add('open');
      this.bubbleBtn.classList.add('is-open');
      this.unreadDot.style.display = 'none';
      this.hideTeaser();
      this.stopTeaserRotation();

      if (!this.chatInitialized) {
        this.chatInitialized = true;
        // If we have a saved session, restore UI and skip initChat
        if (this.conversationHistory.length > 0) {
          this.restoreMessagesUI();
        } else {
          this.initChat();
        }
      }
      setTimeout(() => this.inputEl.focus(), 400);
    }

    close() {
      this.isOpen = false;
      this.chatEl.classList.remove('open');
      this.bubbleBtn.classList.remove('is-open');

      // Send webhook on close if conversation had substance (at least 3 user messages)
      if (!this.webhookSent && this.userMessageCount >= 3) {
        // Small delay to ensure last data is captured
        setTimeout(() => this.fireWebhook(), 500);
      }

      // Save session for later
      this.saveSession();
    }

    toggleExpand() {
      this.chatEl.classList.toggle('expanded');
    }

    // ---- Session Persistence ----
    saveSession() {
      if (this.conversationHistory.length < 2) return;
      const session = {
        history: this.conversationHistory,
        data: this.extractedData,
        webhookSent: this.webhookSent,
        userMessageCount: this.userMessageCount,
        ts: Date.now()
      };
      try { sessionStorage.setItem('jordan_session', JSON.stringify(session)); } catch(e) {}
    }

    restoreSession() {
      try {
        const raw = sessionStorage.getItem('jordan_session');
        if (!raw) return;
        const session = JSON.parse(raw);
        // Only restore if less than 30 minutes old
        if (Date.now() - session.ts > 30 * 60 * 1000) { sessionStorage.removeItem('jordan_session'); return; }
        this.conversationHistory = session.history || [];
        this.extractedData = session.data || {};
        this.webhookSent = session.webhookSent || false;
        this.userMessageCount = session.userMessageCount || 0;
        if (this.conversationHistory.length > 0) this.chatInitialized = true;
      } catch(e) {}
    }

    restoreMessagesUI() {
      // Render saved messages in the chat
      for (const msg of this.conversationHistory) {
        if (msg.content.startsWith('[')) continue; // Skip system triggers
        this.addMessage(msg.role === 'user' ? 'user' : 'assistant', msg.content);
      }
    }

    // ---- Chat Logic ----
    async initChat() {
      this.showTyping();
      try {
        const response = await this.callAPI([
          { role: 'user', content: '[El visitante acaba de abrir el chat en trespuntos.es. Pagina actual: ' + window.location.pathname + '. Enviale tu mensaje de bienvenida.]' }
        ]);
        this.hideTyping();
        this.addMessage('assistant', response);
        this.conversationHistory = [
          { role: 'user', content: '[Visitante abre chat en ' + window.location.pathname + ']' },
          { role: 'assistant', content: response }
        ];
      } catch(e) {
        this.hideTyping();
        this.addMessage('assistant', 'Error al conectar. Inténtalo de nuevo en unos segundos.');
      }
    }

    async sendMessage() {
      const text = this.inputEl.value.trim();
      if (!text) return;

      this.inputEl.value = '';
      this.inputEl.style.height = 'auto';
      this.addMessage('user', text);
      this.userMessageCount++;
      this.conversationHistory.push({ role: 'user', content: text });
      this.parseUserMessage(text);

      this.sendBtn.disabled = true;
      this.showTyping();

      try {
        const response = await this.callAPI(this.conversationHistory);
        this.hideTyping();
        this.addMessage('assistant', response);
        this.conversationHistory.push({ role: 'assistant', content: response });
        this.saveSession();
        this.checkCalendly(response);
        this.checkWebhookTrigger(text);
      } catch(e) {
        this.hideTyping();
        this.addMessage('assistant', 'Ha habido un error. Intenta de nuevo.');
        this.conversationHistory.pop();
        this.userMessageCount--;
      }

      this.sendBtn.disabled = false;
      this.inputEl.focus();
    }

    async callAPI(messages) {
      const res = await fetch(CONFIG.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt: SYSTEM_PROMPT })
      });

      if (!res.ok) throw new Error('API error ' + res.status);

      const data = await res.json();
      return data.content[0].text;
    }

    // ---- Data Extraction ----
    parseUserMessage(text) {
      const lower = text.toLowerCase();

      const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) this.extractedData.email = emailMatch[0];

      const phoneMatch = text.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/);
      if (phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 9) this.extractedData.telefono = phoneMatch[0];

      // Name extraction: "me llamo X" always overwrites, "soy X" only if X is a proper name
      const notNames = /^(el|la|un|una|lo|los|las|que|de|del|muy|bien|solo|nuevo|nueva|dueño|dueña|propietario|responsable|director|jefe|ceo|cto|founder|fundador)$/i;
      const llamoMatch = text.match(/(?:me llamo|mi nombre es)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i);
      if (llamoMatch) {
        this.extractedData.nombre = llamoMatch[1]; // Always overwrite — strongest signal
      } else if (!this.extractedData.nombre) {
        const soyMatch = text.match(/^([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)$/);
        if (soyMatch && !notNames.test(soyMatch[1])) this.extractedData.nombre = soyMatch[1];
      }

      // Role detection
      if (/\b(ceo|founder|fundador|director|gerente|propietario|due[ñn]o)\b/i.test(lower)) this.extractedData.rol = 'CEO / Founder';
      else if (/\b(marketing|mkt|comercial)\b/i.test(lower)) this.extractedData.rol = 'Marketing';
      else if (/\b(cto|tecnic|desarroll|programad|it)\b/i.test(lower)) this.extractedData.rol = 'CTO / Tecnico';
      else if (/\b(ecommerce|e-commerce|tienda online)\b/i.test(lower)) this.extractedData.rol = 'E-commerce';

      // Decisor detection
      if (/yo decido|soy el que decide|la decisi[oó]n es m[ií]a|soy el due[ñn]o/i.test(lower)) this.extractedData.decisor = 'Si';
      else if (/hay m[aá]s gente|mi jefe|mi socio|comit[eé]/i.test(lower)) this.extractedData.decisor = 'No';

      // Budget detection
      if (/30\.?000|mas de 30|m[aá]s de 30|\+\s?30/i.test(lower)) this.extractedData.presupuesto = '+30.000 €';
      else if (/15\.?000.*30|entre 15.*30/i.test(lower)) this.extractedData.presupuesto = '15.000 – 30.000 €';
      else if (/5\.?000.*15|entre 5.*15/i.test(lower)) this.extractedData.presupuesto = '5.000 – 15.000 €';
      else if (/menos de 5|por debajo de 5|inferior a 5|[<]?\s?5\.?000/i.test(lower)) this.extractedData.presupuesto = 'Menos de 5.000 €';

      // Project type detection
      if (/ecommerce|e-commerce|tienda online|vender online/i.test(lower)) {
        this.extractedData.tipo_proyecto = /b2b|distribuidor|mayorist/i.test(lower) ? 'E-commerce B2B' : 'E-commerce B2C';
      } else if (/\b(portal|pedidos online|distribuidores)\b/i.test(lower)) this.extractedData.tipo_proyecto = 'E-commerce B2B';
      else if (/redise[ñn]|mejorar.*web|actualizar/i.test(lower)) this.extractedData.tipo_proyecto = 'Rediseno';
      else if (/automat|ia |inteligencia artificial|agente|chatbot/i.test(lower)) this.extractedData.tipo_proyecto = 'IA / Automatizacion';
      else if (/consultor|audit|diagn[oó]stico/i.test(lower)) this.extractedData.tipo_proyecto = 'Consultoria';
      else if (/web corporat|landing|p[aá]gina|plataforma/i.test(lower)) this.extractedData.tipo_proyecto = 'Web corporativa';

      // Urgency detection — must be explicit, not incidental words like "ya tengo"
      if (/\b(urgente|cuanto antes|inmediato|lo antes posible|esta semana|corriendo)\b/i.test(lower)) this.extractedData.urgencia = 'alta';
      else if (/\b(septiembre|octubre|noviembre|enero|febrero|para \w+|en \d+ meses|proximo mes)\b/i.test(lower)) this.extractedData.urgencia = 'media';
      else if (/\b(sin prisa|no hay prisa|no corre prisa|cuando sea|explorando)\b/i.test(lower)) this.extractedData.urgencia = 'baja';

      // Company extraction
      if (!this.extractedData.empresa) {
        const empresaMatch = text.match(/(?:empresa|compania|trabajamos? en|somos?|de parte de)\s+([A-ZÁÉÍÓÚÑ][\w\s&.-]{1,30})/i);
        if (empresaMatch) this.extractedData.empresa = empresaMatch[1].trim();
      }

      // Integration / systems detection
      if (/\b(erp|crm|sage|sap|hubspot|salesforce|holded|odoo|zoho|mailchimp|stripe|shopify|prestashop|woocommerce|wordpress|magento|google analytics|zapier)\b/i.test(lower)) {
        const systems = lower.match(/\b(erp|crm|sage|sap|hubspot|salesforce|holded|odoo|zoho|mailchimp|stripe|shopify|prestashop|woocommerce|wordpress|magento|google analytics|zapier)\b/gi);
        if (systems) {
          const existing = this.extractedData.sistemas_actuales ? this.extractedData.sistemas_actuales.split(', ') : [];
          const merged = [...new Set([...existing, ...systems.map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())])];
          this.extractedData.sistemas_actuales = merged.join(', ');
        }
      }

      // Integration needs
      if (/\b(integra|conectar|sincroniz|api|webhook|import|export)\b/i.test(lower)) {
        if (!this.extractedData.integraciones_necesarias) this.extractedData.integraciones_necesarias = '';
        // Will be enriched by AI summary
      }

      // Channel preference
      if (/\b(email|correo|mail)\b/i.test(lower) && /prefer|mejor|contact/i.test(lower)) this.extractedData.canal_preferido = 'Email';
      else if (/\b(whatsapp|wsp|whats)\b/i.test(lower)) this.extractedData.canal_preferido = 'WhatsApp';
      else if (/\b(llam|telefon|movil)\b/i.test(lower) && /prefer|mejor|contact/i.test(lower)) this.extractedData.canal_preferido = 'Llamada';
    }

    // ---- Webhook ----
    // Only fires on: explicit goodbye OR Calendly reservation
    // Close-button firing is handled in close() method
    checkWebhookTrigger(lastMsg) {
      if (this.webhookSent) return;
      const bye = /\b(adi[oó]s|gracias por todo|hasta luego|nos vemos|chao|bye|me voy|hasta pronto)\b/i.test(lastMsg.toLowerCase());
      if (bye) this.fireWebhook();
    }

    // ---- Score Calculation ----
    calculateScore() {
      let score = 0;
      const d = this.extractedData;
      const p = d.presupuesto || '';
      // Budget scoring
      if (/30\.?000|mas de 30|\+30/i.test(p)) score += 2;
      else if (/15\.?000|entre 15/i.test(p)) score += 2;
      else if (/5\.?000.*15|entre 5/i.test(p)) score += 1;
      else if (/menos de 5|inferior|<\s?5/i.test(p)) score -= 2;
      // Urgency
      if (d.urgencia === 'alta') score += 2;
      else if (d.urgencia === 'media') score += 1;
      else if (d.urgencia === 'baja') score -= 1;
      // Decisor
      if (d.decisor === 'Si') score += 2;
      // Complex project signals
      if (d.sistemas_actuales) score += 1;
      if (d.tipo_proyecto && /B2B|IA|Automatiz/i.test(d.tipo_proyecto)) score += 1;
      // Conversation depth
      if (this.userMessageCount >= 6) score += 2; // Discovery-like depth
      else if (this.userMessageCount >= 4) score += 1;
      // Has contact data
      if (d.email || d.telefono) score += 1;
      return Math.max(0, Math.min(10, score));
    }

    detectVelocity() {
      const d = this.extractedData;
      let signals = 0;
      if (d.sistemas_actuales) signals++;
      if (/B2B/i.test(d.tipo_proyecto || '')) signals++;
      if (/15\.?000|30\.?000|mas de|mayor inversion|\+/i.test(d.presupuesto || '')) signals++;
      if (d.urgencia === 'alta') signals++;
      if (/IA|Automatiz/i.test(d.tipo_proyecto || '')) signals++;
      if (this.userMessageCount >= 6) signals++;
      return signals >= 2 ? '2' : '1';
    }

    async fireWebhook() {
      if (this.webhookSent) return;
      this.webhookSent = true;

      const conversationText = this.conversationHistory
        .map(m => (m.role === 'user' ? 'Visitante' : 'Jordan') + ': ' + m.content).join('\n');

      // Ask AI to extract structured data from conversation
      let aiExtracted = {};
      try {
        const extractPrompt = `Analiza esta conversacion y devuelve SOLO un JSON valido (sin markdown, sin backticks) con estos campos:
{"resumen_ejecutivo":"resumen en 1-2 frases del proyecto","problema_principal":"problema que quiere resolver","objetivo_principal":"objetivo del proyecto","plataforma_recomendada":"WordPress/WooCommerce/PrestaShop/React/Next.js/Laravel/a medida (si se puede deducir)","sistemas_actuales":"sistemas que usa actualmente separados por coma","integraciones_necesarias":"integraciones que necesita separados por coma","usuarios_y_roles":"tipos de usuario mencionados","puntos_pendientes":"que falta por definir","discovery_completado":true/false,"nombre":"nombre del visitante","empresa":"empresa del visitante","tipo_proyecto":"Web corporativa/E-commerce B2C/E-commerce B2B/Rediseno/IA-Automatizacion/Consultoria","presupuesto_rango":"rango mencionado","urgencia":"alta/media/baja/no mencionada","decisor":"Si/No/no mencionado"}
Si un campo no se menciono en la conversacion, pon "". Conversacion:\n` + conversationText;

        const res = await fetch(CONFIG.proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: extractPrompt }],
            systemPrompt: 'Eres un extractor de datos. Responde SOLO con JSON valido, sin texto adicional.'
          })
        });
        if (res.ok) {
          const data = await res.json();
          const jsonText = data.content[0].text.trim();
          aiExtracted = JSON.parse(jsonText);
        }
      } catch(e) {
        console.warn('[Jordan] AI extraction failed, using regex data:', e);
      }

      // Merge: regex-extracted data takes priority for contact fields, AI for analysis fields
      const d = this.extractedData;
      const score = this.calculateScore();
      const velocity = this.detectVelocity();

      const payload = {
        nombre: d.nombre || aiExtracted.nombre || '',
        email: d.email || '',
        telefono: d.telefono || '',
        empresa: d.empresa || aiExtracted.empresa || '',
        canal_preferido: d.canal_preferido || '',
        rol: d.rol || '',
        tipo_proyecto: d.tipo_proyecto || aiExtracted.tipo_proyecto || '',
        plataforma_recomendada: aiExtracted.plataforma_recomendada || '',
        velocidad: velocity,
        score: score,
        resumen_ejecutivo: aiExtracted.resumen_ejecutivo || '',
        problema_principal: d.problema_principal || aiExtracted.problema_principal || '',
        objetivo_principal: d.objetivo_principal || aiExtracted.objetivo_principal || '',
        sistemas_actuales: d.sistemas_actuales || aiExtracted.sistemas_actuales || '',
        integraciones_necesarias: d.integraciones_necesarias || aiExtracted.integraciones_necesarias || '',
        usuarios_y_roles: aiExtracted.usuarios_y_roles || '',
        presupuesto_rango: d.presupuesto || aiExtracted.presupuesto_rango || '',
        urgencia: d.urgencia || aiExtracted.urgencia || '',
        decisor: d.decisor || aiExtracted.decisor || '',
        discovery_completado: aiExtracted.discovery_completado || (this.userMessageCount >= 6),
        puntos_pendientes: aiExtracted.puntos_pendientes || '',
        calendly_reservado: d.calendly_abierto || false,
        fecha_reunion: '',
        conversacion_completa: conversationText
      };

      try {
        await fetch(CONFIG.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch(e) {
        console.warn('[Jordan] Webhook error:', e);
        this.webhookSent = false;
      }
    }

    // ---- Calendly (popup, sin salir de la web) ----
    checkCalendly(response) {
      if (/reuni[oó]n|agenda|calendly|call|disponibilidad|slot|reserv|directo con el equipo/i.test(response.toLowerCase())) {
        if (CONFIG.calendlyUrl && !this.calendlyShown) {
          this.calendlyShown = true;
          this.loadCalendlyScript().then(() => this.addCalendlyButton());
        }
      }
    }

    loadCalendlyScript() {
      return new Promise((resolve) => {
        if (window.Calendly) { resolve(); return; }
        const link = document.createElement('link');
        link.href = 'https://assets.calendly.com/assets/external/widget.css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
        const script = document.createElement('script');
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.onload = resolve;
        document.head.appendChild(script);
      });
    }

    addCalendlyButton() {
      const btn = document.createElement('button');
      btn.className = 'jordan-calendly-btn';
      btn.textContent = 'Reservar reunión con Tres Puntos';
      btn.addEventListener('click', () => {
        const prefill = {};
        if (this.extractedData.nombre) prefill.name = this.extractedData.nombre;
        if (this.extractedData.email) prefill.email = this.extractedData.email;
        window.Calendly.initPopupWidget({
          url: CONFIG.calendlyUrl,
          prefill,
          utm: { utmSource: 'jordan-chat', utmMedium: 'widget' }
        });
        this.extractedData.calendly_abierto = true;
      });

      const wrapper = document.createElement('div');
      wrapper.className = 'jordan-msg jordan-msg-assistant';
      wrapper.appendChild(btn);
      this.messagesEl.appendChild(wrapper);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    // ---- UI Helpers ----
    addMessage(role, text) {
      const div = document.createElement('div');
      div.className = `jordan-msg jordan-msg-${role}`;
      div.textContent = text;
      this.messagesEl.appendChild(div);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    showTyping() {
      const div = document.createElement('div');
      div.className = 'jordan-typing';
      div.id = 'jordan-typing';
      div.innerHTML = '<div class="jordan-typing-dots"><span></span><span></span><span></span></div>';
      this.messagesEl.appendChild(div);
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    hideTyping() {
      const el = this.shadow.getElementById('jordan-typing');
      if (el) el.remove();
    }
  }

  // ========== INIT ==========
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new JordanWidget());
  } else {
    new JordanWidget();
  }

})();
