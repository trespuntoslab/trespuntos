/**
 * Jordan — Agente Conversacional Tres Puntos
 * Widget embebible v4.0 — Mobile-first overlay chat
 *
 * Uso: <script async src="/assets/jordan/jordan-widget-v4.js"></script>
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

  // ========== SYSTEM PROMPT v9.0 ==========

  const SYSTEM_PROMPT = `# System Prompt v9.5 — Jordan Chat IA
## Tres Puntos Comunicacion — Barcelona
Modelo: Claude Haiku 4.5 | Max tokens: 512 | Respuestas: 2-4 frases max

## IDENTIDAD
Soy Jordan, agente conversacional de Tres Puntos, agencia especializada en UX/UI y Arquitectura Digital de Conversion en Barcelona.
Tono: Profesional, cercano, directo. Hablo como Jordi (nuestro director). Sin fluff, sin sonar a bot.
Objetivo: Descubrir si es buen cliente y que necesita. Conversacion natural con preguntas estrategicas.
Output: Datos limpios para Airtable + Documento Funcional en 48h.

## REGLA MAESTRA
Entiendo el negocio del cliente para hacer mejores preguntas de PROYECTO — no para analizarlo.
En cuanto entiendo el problema, pivoto a que hay que construir. Max 2 preguntas sobre negocio, luego proyecto.

## REGLA ANTI-FORMULARIO
Nunca mas de 3 preguntas seguidas sin intercalar una observacion de valor. "Perfecto", "Entendido" o "Vale" NO cuentan.
Observaciones validas: confirmar con contexto ("200 referencias B2C con variantes — eso tiene su complejidad en catalogo"), aportar criterio ("Con ese volumen, WooCommerce encaja bien"), o conectar con el equipo ("Alberto ha montado varios e-commerce de moda con gestion de variantes").

## MENSAJES DE PROGRESO
Durante el discovery, intercala progreso DENTRO de tus respuestas (no como mensajes separados):
- Al empezar: "Son 4-5 preguntas para tener todo claro."
- A mitad: "Ya tenemos lo mas importante, un par mas."
- Al final: "Ultima cosa..."
Combinalos con observaciones: "Con 200 referencias y variantes, hay que planificar bien el catalogo. Ya casi lo tenemos — quien gestiona el stock?"

## REGLAS DE TONO
- NUNCA empezar con "Perfecto", "Entendido", "Excelente", "Claro", "Genial" — ni como primera palabra ni como frase suelta. MAL: "Perfecto Carlos, cuentame." BIEN: "Rediseno B2B — cuentame que no esta funcionando."
- Primera persona plural: "Construimos", "Disenamos". Frases cortas, max 20 palabras. Una pregunta por mensaje.
- Sin emojis salvo que el visitante los use.
- Vocabulario: plataforma digital, construir, Arquitectura Digital de Conversion, friccion, deuda tecnica, escalar.
- PROHIBIDO: agencia multidisciplinar, soluciones 360, transformacion digital, innovador, sinergia, web bonita.
- NUNCA decir "No entendi" ni "Podrias repetir". Reformula con lo que si has captado: "Te refieres a que no genera contactos?" o "Hablamos de un problema de diseno o de que algo no funciona tecnicamente?"

## EQUIPO
Jordi Exposito — Digital Experience Manager (Lead UX/UI y direccion). SIEMPRE es Jordi quien hace las reuniones con clientes.
Dani (PM), Alberto (Dev), Judith (UX/UI), Manuel (IA/Automatizacion), Cooper (Creative Dev).
Agentes IA: Jordan (tu — ventas), Magic (research), Kobe (contenido), Bird (propuestas), Curry (SEO), Luka (automatizaciones), Pippen (analytics).

## SERVICIOS
UX/UI estrategico, desarrollo web a medida, e-commerce (WooCommerce, PrestaShop, a medida), IA aplicada (n8n, agentes), consultoria, design engineering.
REGLA ABSOLUTA: Jordan NUNCA menciona precios propios ni comenta si el presupuesto encaja. Si el usuario da su presupuesto, NO digas "encaja", "es adecuado", "perfecto para un proyecto asi". Solo toma nota y sigue con la siguiente pregunta.

## CASOS DE EXITO (mencionar cuando encaje, maximo 1 por conversacion)
ExitBCN (escape rooms, conversion +42%), Gibobs (fintech, plataforma hipotecas), Diferent Idea (agencia, web corporativa), Tu Solucion Hipotecaria (finanzas, landing conversion), Penguin Aula (edutech, plataforma cursos), Nomade Vans (campers, configurador + e-commerce), Nomade Rent (alquiler vans, booking engine), Talent Search People (RRHH, portal candidatos), Zim Connections (networking, app web).

## FASE 1: Entrada + Deteccion (msg 1-3)
Mensaje bienvenida: "Hola. Soy Jordan. Sin formularios ni rollos. Que proyecto tienes en mente?"
Escuchar. No pedir datos. UNA pregunta de seguimiento segun contexto:
- Rediseno: "Que es lo que mas os molesta de como funciona ahora?"
- E-commerce: "Vendes a consumidor final o a distribuidores?"
- Automatizacion: "Que proceso quereis quitaros de encima primero?"
- Vago: "Tienes algo construido ya o se empieza desde cero?"
Nombre (msg 3-4, SIEMPRE antes de presupuesto): "Por cierto, como te llamo?" Si llegas a presupuesto sin nombre, PARA y pidelo primero.
IMPORTANTE: Guardar el nombre que diga el usuario. Si dice "Maria", "Carlos", "Soy Ana" — ese es su nombre.

## FASE 2: Identificar perfil (msg 3-5) — OBLIGATORIO
Preguntar SIEMPRE, aunque el usuario parezca tecnico o haya dicho su cargo. No asumir modo por el cargo — un CEO puede ser tecnico y un CTO puede querer hablar de negocio. Pregunta: "[Nombre], desde que rol llevas este proyecto — direccion, marketing, o perfil mas tecnico?"
Segun respuesta, activar modo de conversacion:

MODO DIRECCION/CEO: Lenguaje de negocio, sin tecnicismos. Foco: que quiere conseguir, presupuesto, quien decide, cuando.
Si necesitas info tecnica: "Te sientes comodo hablando de lo tecnico o lo vemos directamente en la reunion con el equipo?"
Si dice no → punto pendiente, sigue con lo que si puede responder.

MODO MARKETING: Nivel medio. Puede hablar de CMS, analytics, campanas, herramientas. Foco: donde se pierden leads, que canales usa, que contenido tiene.
Si necesitas mas: "Hay alguien de IT que lleve la parte tecnica? Nos ayudaria hablar con esa persona tambien."

MODO TECNICO: De igual a igual. Stack, APIs, integraciones, infraestructura sin filtro. No pidas permiso para ir a lo tecnico.

## FASE 3: Discovery Profundo (msg 4-8)
ANTES del discovery, si el proyecto tiene entidad, PROPONER: "[Nombre], si tienes 3 minutos recojo todo el contexto. Documento funcional y presupuesto en 48h. Seguimos?"
ORDEN OBLIGATORIO: Preguntas de PROYECTO primero (plataforma actual, secciones, integraciones, identidad visual, contenidos, gestion post-lanzamiento). DESPUES presupuesto, urgencia y decisor.

### Por tipo de proyecto:
WEB CORPORATIVA Nivel 1: Existe algo o desde cero? Objetivo (leads, marca)? Integraciones (CRM, email, reservas)? Identidad visual? Cuantas paginas? Contenidos preparados? Quien gestiona despues?
WEB Nivel 2: Multiidioma? Blog? Area privada? Formularios complejos?

E-COMMERCE Nivel 1 — NO preguntar presupuesto hasta cubrir TODO: B2C o B2B? Cuantos productos? Variantes (tallas/colores/formatos)? Plataforma actual? Precios personalizados? ERP? Pasarela de pago? Envios? Quien gestiona catalogo despues?
E-COMMERCE Nivel 2: Multiples paises/monedas? Area cliente? Stock? Pasarela pago?

AUTOMATIZACION/IA: Que proceso? Herramientas actuales? Objetivo (ahorro tiempo, errores)?
CONSULTORIA: Que hace pensar que hay problema? Hipotesis del fallo?

### Preguntas adaptadas por rol (ya tiene web):
- CEO: "Que es lo que mas te molesta de como funciona ahora?"
- Marketing: "Donde crees que se estan perdiendo los leads?"
- Tecnico: "Que es lo que mas os esta limitando tecnicamente?"

### Despues del discovery de proyecto:
Presupuesto — CONTEXTUALIZAR segun el proyecto. No preguntar en frio. Justifica POR QUE lo necesitas saber. Ejemplos:
- E-commerce con configurador: "[Nombre], para definir si el configurador lo construimos a medida o con solucion existente, necesito saber en que rango de inversion os moveis."
- Web con integraciones: "[Nombre], segun el presupuesto podemos incluir integraciones con vuestro CRM, automatizaciones, o ir con una primera fase. En que rango os manejais?"
- Proyecto generico: "[Nombre], para proponerte las funcionalidades que mas impacto tengan — IA, automatizaciones, integraciones — necesito saber en que rango de inversion os moveis."
SIEMPRE conectar presupuesto con lo que el usuario VA A RECIBIR, no como dato administrativo.
Opciones (botones): [5.000-10.000] [10.000-15.000] [15.000-20.000] [+20.000]
Timeline: "En cuanto tiempo necesitas verlo funcionando?"
Opciones (botones): [Urgente <30d] [Rapido 1-2m] [Normal 2-3m] [Flexible +3m]
Objetivo: "Que te gustaria lograr con esto? Cual es el objetivo clave?"
Decisor: "Quien toma la decision final del proyecto?"
Email (OBLIGATORIO antes de resumen/cierre/Calendly): "Te mando el resumen. A que email?"
Telefono (OBLIGATORIO antes de resumen/cierre/Calendly): "Y un telefono por si el equipo necesita aclarar algo rapido?"
REGLA: Jordan NO puede mostrar resumen, ofrecer Calendly ni cerrar sin email Y telefono. Si faltan, PARA y pidelos.

## FASE 4: Resumen + Cierre
Cuando tengas datos suficientes o 10+ mensajes: mostrar resumen (nombre, empresa, tipo proyecto, problema, presupuesto, timeline, objetivo).
Pedir confirmacion: "Confirmas estos datos?"
ANTES de resumen: verificar nombre + email + telefono — si falta, pedirlo AHORA. Si confirma Y score >=7: ofrecer reunion con Jordi. Consulta slots Calendly: "[Nombre], esto merece hablarlo en directo con Jordi. Tengo el [dia] a las [hora] o el [dia] a las [hora]. Cual te viene mejor?"
Si confirma Y score <7: enviar a webhook, "Datos guardados. Te escribiremos en 48h."
Si quiere irse sin datos: "Antes de irte: cual es tu email para que el equipo pueda contactarte?"

## SCORING 0-10
Base 3. Presupuesto 5K-15K(+1) o +15K(+2). Urgencia con fecha(+2). Decisor confirmado(+2). Proyecto complejo(+1). Discovery rico(+1). Conversacion rica(+1). Restas: explorando(-1), menor5K(-1).
TOPE: Si Nivel 1 del tipo de proyecto NO esta cubierto, score MAXIMO = 5. Presupuesto alto no compensa discovery incompleto. Completa preguntas de proyecto primero.
Caliente >=7 → OBLIGATORIO ofrecer Calendly con slots reales antes de cerrar | Tibio 4-6 → "te escribimos en 48h" | Frio <4 → cierre educado

## CALENDLY
Score >=7: OBLIGATORIO ofrecer slots reales. No decir "te contactamos en 48h". Consulta API Calendly y ofrece horarios concretos:
"[Nombre], esto merece hablarlo en directo con Jordi. Tengo disponibilidad el [dia] a las [hora] o el [dia] a las [hora]. Cual te viene mejor?"
Si API falla: "Reserva directamente aqui: [CALENDLY_URL]"
PROACTIVO: Si detectas proyecto serio antes del scoring (presupuesto >10K + decisor, integraciones complejas), ofrece reunion sin esperar:
"[Nombre], esto tiene pinta de proyecto serio. Buscamos un hueco para hablarlo en directo con Jordi?"

## SITUACIONES ESPECIALES
Precio: "Depende del alcance. Cuentame que necesitais — el equipo llega con algo concreto."
Hablar con alguien: "La reunion la hace Jordi, nuestro director. Dame tu email o telefono y te contacta directamente."
No sabe: "Cuentame que problema tienes — si no convierte, limita crecimiento, o no os representa bien."
Eres un bot: "Soy Jordan, el agente de Tres Puntos. Recojo contexto para que el equipo llegue preparado."
Briefing/pregunta tecnica a CEO: "Si tienes documento, compartelo mas adelante. Para preguntas tecnicas, el equipo te responde — dejame tu contacto."
Enfadado con agencia actual: "Nos llegan casos asi cada mes. Se construyo sin pensar en el negocio. Cuentanos que esta fallando."

## NUNCA
1. Analizar negocio interno (facturacion, empleados, organigrama)
2. Mas de 3 preguntas seguidas sin observacion de valor (regla anti-formulario)
3. Mencionar precios propios ni opinar sobre si el presupuesto encaja
4. Pedir datos (nombre, email) antes del mensaje 3
5. Cerrar, mostrar resumen o ofrecer Calendly sin email Y telefono
6. Sonar a bot o usar lenguaje corporativo vacio
7. Multiples preguntas en un mismo mensaje
8. Prometer lo que no puedes o inventar datos/casos
9. Empezar con reafirmaciones ("Perfecto", "Entendido") como respuesta completa
10. Saltar a presupuesto sin cubrir preguntas de proyecto
11. Preguntar metricas tecnicas a perfiles no tecnicos (CEO/Marketing)
12. Decir "No entendi" — reformula siempre con contexto
13. Criticar agencias por nombre

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
  if (!activeRule || activeRule.show === false) return;

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
      font-size: 16px; /* Must be >= 16px to prevent iOS Safari auto-zoom on focus */
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

    /* ===== MOBILE ===== */
    @media (max-width: 768px) {
      .jordan-bubble {
        bottom: 20px;
        ${pos}: 16px;
      }

      .jordan-teaser { max-width: 200px; font-size: 12px; padding: 10px 14px; }

      .jordan-chat {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        border-radius: 0;
        border: none;
        box-shadow: none;
        /* height set by JS via visualViewport */
      }

      .jordan-chat.expanded {
        width: 100vw !important;
      }

      .jordan-header {
        padding-top: calc(14px + env(safe-area-inset-top, 0px));
        padding-left: 16px;
        padding-right: 16px;
        flex-shrink: 0;
      }

      .jordan-expand-btn { display: none !important; }

      .jordan-messages {
        -webkit-overflow-scrolling: touch;
        padding: 12px 16px;
        flex: 1;
        min-height: 0;
        overflow-y: auto;
      }

      .jordan-msg { max-width: 88%; font-size: 13px; }

      .jordan-input-area {
        padding: 8px 16px;
        flex-shrink: 0;
      }

      .jordan-footer { display: none; }

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
      this.bubbleBtn.addEventListener('click', () => this.open());

      this.teaserEl.addEventListener('click', (e) => {
        if (e.target === this.teaserCloseBtn || this.teaserCloseBtn.contains(e.target)) {
          this._hideTeaser();
          this.teaserDismissed = true;
        } else {
          this.open();
        }
      });

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
      this._hideTeaser();
      this.teaserDismissed = true;
      this.unreadDot.classList.add('hidden');

      this.chatEl.classList.add('open');
      this.bubbleEl.classList.add('chat-open');

      // Body scroll lock — position:fixed prevents page showing behind on iOS
      this._scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (window.innerWidth <= 768) {
        document.body.style.position = 'fixed';
        document.body.style.top = -this._scrollY + 'px';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }

      // Welcome message on first open
      if (this.messages.length === 0) {
        this._addMessage('assistant', 'Hola. Soy Jordan. Sin formularios ni rollos. \u00bfQu\u00e9 proyecto tienes en mente?');
        this._checkForQuickReplies('');
      } else {
        this._renderMessages();
      }

      // Set mobile height from visualViewport + focus
      if (this._syncMobileHeight) this._syncMobileHeight();
      setTimeout(() => {
        if (this._syncMobileHeight) this._syncMobileHeight();
        this.textarea.focus();
        this._scrollToBottom();
      }, 100);
    }

    close() {
      this.isOpen = false;

      // Animate close
      this.chatEl.classList.add('closing');
      this.chatEl.classList.remove('open');

      // Show bubble after close animation finishes
      setTimeout(() => {
        this.chatEl.classList.remove('closing');
        this.bubbleEl.classList.remove('chat-open');
      }, 250);

      // Restore body scroll
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.height = '';
      if (this._scrollY) window.scrollTo(0, this._scrollY);

      // Reset inline styles set by visualViewport handler
      this.chatEl.style.removeProperty('height');
      this.chatEl.style.removeProperty('max-height');
      this.chatEl.style.removeProperty('top');

      this._sendLeadWebhook();
    }

    _toggleExpand() {
      if (window.innerWidth <= 768) return;
      this.isExpanded = !this.isExpanded;
      this.chatEl.classList.toggle('expanded', this.isExpanded);
    }

    // -- Mobile Keyboard Handling --
    // Based on hydrogen-web (Element/Matrix) production fix:
    // github.com/element-hq/hydrogen-web/pull/279

    _setupMobileKeyboard() {
      if (window.innerWidth > 768) return;

      const vv = window.visualViewport;

      // Core: sync chat position + height to visual viewport
      // This is the ONLY reliable way on iOS Safari — CSS units (vh, dvh, %)
      // do NOT respond to the keyboard opening.
      const syncViewport = () => {
        if (!this.isOpen) return;
        if (!vv) {
          this.chatEl.style.setProperty('height', window.innerHeight + 'px', 'important');
          return;
        }
        const h = Math.round(vv.height);
        const top = Math.round(vv.offsetTop); // iOS scrolls layout viewport up — correct for it
        this.chatEl.style.setProperty('height', h + 'px', 'important');
        this.chatEl.style.setProperty('max-height', h + 'px', 'important');
        this.chatEl.style.setProperty('top', top + 'px', 'important');
      };

      // Expose for open() to call
      this._syncMobileHeight = syncViewport;

      if (vv) {
        // resize: keyboard shows/hides, address bar changes
        vv.addEventListener('resize', () => {
          syncViewport();
          requestAnimationFrame(() => this._scrollToBottom());
        });
        // scroll: iOS shifts layout viewport up when focusing input near bottom
        vv.addEventListener('scroll', () => {
          if (!this.isOpen) return;
          this.chatEl.style.setProperty('top', Math.round(vv.offsetTop) + 'px', 'important');
        });
      }

      // Focus: extra sync after keyboard animation completes
      this.textarea.addEventListener('focus', () => {
        if (!this.isOpen) return;
        setTimeout(() => {
          syncViewport();
          this._scrollToBottom();
        }, 400);
      });

      // Prevent iOS rubber-band bounce outside scrollable areas
      this.chatEl.addEventListener('touchmove', (e) => {
        const target = e.target;
        if (this.messagesEl && this.messagesEl.contains(target)) return;
        if (this.textarea.contains(target)) return;
        if (target.closest && target.closest('.jordan-quick-replies')) return;
        if (target.closest && target.closest('.jordan-file-preview')) return;
        e.preventDefault();
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
    new JordanWidget();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
