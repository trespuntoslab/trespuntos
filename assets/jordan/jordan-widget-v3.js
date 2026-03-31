/**
 * Jordan — Agente Conversacional Tres Puntos
 * Widget embebible v3.0 — Mobile UI/UX Enhanced
 *
 * IMPROVEMENTS IN V3:
 * - Separated close button (distinct element, not toggled inside bubble)
 * - Fixed mobile keyboard collapse with max-height + safe-area-inset
 * - All touch targets 44x44px minimum (accessibility)
 * - Body scroll prevention when chat open
 * - Better flex layouts for input area
 * - Improved mobile viewport handling
 *
 * Uso: <script async src="jordan-widget-v3.js"></script>
 */

(function() {
  'use strict';
  if (window.__jordanWidgetLoaded) return;
  window.__jordanWidgetLoaded = true;

  const CONFIG = Object.assign({
    proxyUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-proxy',
    webhookUrl: 'https://n8n.trespuntos-lab.com/webhook/jordan-chat-leads',
    avatar: '',
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

  const SYSTEM_PROMPT = `# Jordan — Agente Conversacional Tres Puntos v7.0
Soy Jordan, agente conversacional de Tres Puntos especializado en calificación rápida de leads.

## MISIÓN
Descubrir 5 elementos clave en 2-3 minutos:
1. Tipo de proyecto (ecommerce, SaaS, web, app, otro)
2. Problema principal (qué no funciona hoy)
3. Solución esperada (qué quieren lograr)
4. Timeline (cuándo lo necesitan)
5. Inversión estimada (presupuesto)

## FASES
FASE 1: Saludo natural. "¿Qué te trae por aquí?" o "¿En qué andas?"
FASE 2: Preguntas abiertas sobre proyecto, usuarios, problemas, timeline.
FASE 3: Resume 5 elementos. Propón siguiente paso (demo, reunión, documento).

## TONO
- Profesional + cercano (sin "estimado/a")
- Líneas cortas (máx 3 párrafos)
- Respuestas en español
- Emojis solo si es natural
- Sin asunciones: valida siempre

## PRESUPUESTO
Cuando pregunte: "¿Tienes rango estimado?" → "5-10K (MVP), 10-20K (full), 20K+ (custom)"

## CIERRE
Resume en 3-4 líneas. Propón: "¿Documento técnico, demo o llamada con Jordi?"
Si urgencia detectada: acelera a Calendly directo.`;

  const CSS = `
:host {
  --jordan-mint: #5dffbf;
  --jordan-dark: #0e0e0e;
  --jordan-text-light: #e8e8e8;
  --jordan-border: rgba(93, 255, 191, 0.15);
  --jordan-bg-secondary: #1a1a1a;
  --jordan-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

* {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
}

.jordan-widget-root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  position: fixed;
  z-index: 999999;
  font-size: 16px;
  color: var(--jordan-text-light);
  pointer-events: none;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.jordan-container {
  position: absolute;
  pointer-events: auto;
  bottom: 1.5rem;
  right: 1.5rem;
}

.jordan-container.left {
  right: auto;
  left: 1.5rem;
}

/* BUBBLE BUTTON — Separate from close button */
.jordan-bubble-container {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--jordan-mint) 0%, rgba(93, 255, 191, 0.8) 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-shadow: var(--jordan-shadow);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  flex-shrink: 0;
}

.jordan-bubble-container:hover {
  transform: scale(1.08);
  box-shadow: 0 25px 70px rgba(93, 255, 191, 0.3);
}

.jordan-bubble-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
}

/* SEPARATE CLOSE BUTTON — V3 NEW */
.jordan-close-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 44px;
  height: 44px;
  background: rgba(14, 14, 14, 0.95);
  border: 2px solid var(--jordan-mint);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s ease;
  visibility: hidden;
  opacity: 0;
  z-index: 1001;
}

.jordan-close-btn:hover {
  background: rgba(93, 255, 191, 0.1);
  transform: rotate(90deg);
}

.jordan-close-icon {
  width: 20px;
  height: 20px;
  position: relative;
  color: var(--jordan-mint);
}

.jordan-close-icon::before,
.jordan-close-icon::after {
  content: '';
  position: absolute;
  background: currentColor;
  border-radius: 2px;
}

.jordan-close-icon::before {
  width: 2px;
  height: 20px;
  left: 9px;
  top: 0;
  transform: rotate(45deg);
}

.jordan-close-icon::after {
  width: 2px;
  height: 20px;
  left: 9px;
  top: 0;
  transform: rotate(-45deg);
}

/* CHAT WINDOW */
.jordan-chat-window {
  visibility: hidden;
  opacity: 0;
  transform: scale(0.8) translateY(20px);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  position: absolute;
  bottom: 100px;
  right: 0;
  width: 400px;
  max-width: 100vw;
  background: var(--jordan-dark);
  border: 1px solid var(--jordan-border);
  border-radius: 16px;
  box-shadow: var(--jordan-shadow);
  display: flex;
  flex-direction: column;
  pointer-events: none;
  z-index: 999;
}

.jordan-container.left .jordan-chat-window {
  right: auto;
  left: 0;
}

.jordan-chat-window.open {
  visibility: visible;
  opacity: 1;
  transform: scale(1) translateY(0);
  pointer-events: auto;
}

/* MOBILE OPTIMIZATION — V3 KEY FIXES */
@media (max-width: 480px) {
  .jordan-container {
    bottom: 1rem;
    right: 1rem;
  }

  .jordan-container.left {
    left: 1rem;
  }

  /* When chat is open, prevent body scroll */
  body.jordan-open {
    overflow: hidden;
    height: 100dvh;
  }

  .jordan-chat-window {
    width: 90vw;
    max-width: 100vw;
    bottom: auto;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 0;
    max-height: 100dvh;
    height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  /* Close button visible on mobile */
  .jordan-close-btn {
    visibility: visible;
    opacity: 1;
    top: -6px;
    right: -6px;
  }
}

.jordan-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--jordan-border);
  flex-shrink: 0;
}

.jordan-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.jordan-header-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-size: cover;
  flex-shrink: 0;
}

.jordan-header-text h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--jordan-mint);
}

.jordan-header-text p {
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
  color: rgba(232, 232, 232, 0.6);
}

.jordan-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.jordan-message {
  display: flex;
  gap: 0.5rem;
  animation: slideInUp 0.3s ease;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.jordan-message.user {
  justify-content: flex-end;
}

.jordan-message-bubble {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.jordan-message.assistant .jordan-message-bubble {
  background: var(--jordan-bg-secondary);
  border-left: 3px solid var(--jordan-mint);
  color: var(--jordan-text-light);
}

.jordan-message.user .jordan-message-bubble {
  background: rgba(93, 255, 191, 0.15);
  color: var(--jordan-mint);
}

/* INPUT AREA — V3 FIX: Proper flex layout */
.jordan-input-area {
  padding: 1rem;
  border-top: 1px solid var(--jordan-border);
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
  align-items: flex-end;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

.jordan-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--jordan-bg-secondary);
  border: 1px solid var(--jordan-border);
  border-radius: 24px;
  padding: 0.5rem 1rem;
  min-height: 44px;
}

.jordan-input-field {
  flex: 1;
  background: none;
  border: none;
  color: var(--jordan-text-light);
  font-size: 0.95rem;
  outline: none;
  resize: none;
  max-height: 100px;
  font-family: inherit;
  padding: 0.5rem 0;
}

.jordan-input-field::placeholder {
  color: rgba(232, 232, 232, 0.4);
}

/* SEND BUTTON — 44x44px minimum */
.jordan-send-btn {
  width: 44px;
  height: 44px;
  background: var(--jordan-mint);
  color: var(--jordan-dark);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  padding: 0;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.jordan-send-btn:hover {
  background: rgba(93, 255, 191, 0.8);
}

.jordan-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.jordan-typing-indicator {
  display: flex;
  gap: 4px;
  padding: 0.75rem 1rem;
}

.jordan-typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(93, 255, 191, 0.6);
  animation: typing 1.4s infinite;
}

.jordan-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.jordan-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}
`;

  class JordanWidget {
    constructor(config) {
      this.config = config;
      this.sessionId = this.generateSessionId();
      this.messages = this.loadMessages();
      this.isLoading = false;
      this.init();
    }

    generateSessionId() {
      const stored = sessionStorage.getItem('jordan-session-id');
      if (stored) return stored;
      const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('jordan-session-id', id);
      return id;
    }

    loadMessages() {
      const stored = sessionStorage.getItem(`jordan-messages-${this.sessionId}`);
      return stored ? JSON.parse(stored) : [];
    }

    saveMessages() {
      sessionStorage.setItem(`jordan-messages-${this.sessionId}`, JSON.stringify(this.messages));
    }

    init() {
      const host = document.createElement('div');
      document.body.appendChild(host);
      this.shadowRoot = host.attachShadow({ mode: 'closed' });

      const style = document.createElement('style');
      style.textContent = CSS;
      this.shadowRoot.appendChild(style);

      const template = document.createElement('template');
      template.innerHTML = `
<div class="jordan-widget-root">
  <div class="jordan-container">
    <button class="jordan-bubble-container" aria-label="Open chat">
      <div class="jordan-bubble-avatar"></div>
    </button>
    <button class="jordan-close-btn" aria-label="Close chat">
      <div class="jordan-close-icon"></div>
    </button>
    <div class="jordan-chat-window">
      <div class="jordan-header">
        <div class="jordan-header-content">
          <div class="jordan-header-avatar"></div>
          <div class="jordan-header-text">
            <h2>Jordan</h2>
            <p>Agente Tres Puntos</p>
          </div>
        </div>
      </div>
      <div class="jordan-messages"></div>
      <div class="jordan-input-area">
        <div class="jordan-input-wrapper">
          <input type="text" class="jordan-input-field" placeholder="Cuéntame..." autocomplete="off">
        </div>
        <button class="jordan-send-btn" aria-label="Send" disabled>→</button>
      </div>
    </div>
  </div>
</div>`;
      this.shadowRoot.appendChild(template.content.cloneNode(true));

      this.bubble = this.shadowRoot.querySelector('.jordan-bubble-container');
      this.closeBtn = this.shadowRoot.querySelector('.jordan-close-btn');
      this.chatWindow = this.shadowRoot.querySelector('.jordan-chat-window');
      this.messagesContainer = this.shadowRoot.querySelector('.jordan-messages');
      this.inputField = this.shadowRoot.querySelector('.jordan-input-field');
      this.sendBtn = this.shadowRoot.querySelector('.jordan-send-btn');
      this.container = this.shadowRoot.querySelector('.jordan-container');
      this.headerAvatar = this.shadowRoot.querySelector('.jordan-header-avatar');
      this.bubbleAvatar = this.shadowRoot.querySelector('.jordan-bubble-avatar');

      if (this.config.avatar) {
        this.headerAvatar.style.backgroundImage = `url('${this.config.avatar}')`;
        this.bubbleAvatar.style.backgroundImage = `url('${this.config.avatar}')`;
      }

      this.bubble.addEventListener('click', () => this.toggle());
      this.closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });
      this.sendBtn.addEventListener('click', () => this.sendMessage());
      this.inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      this.inputField.addEventListener('input', () => this.updateSendButton());

      if (this.config.position === 'left') {
        this.container.classList.add('left');
      }

      this.renderMessages();
    }

    toggle() {
      if (this.chatWindow.classList.contains('open')) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.chatWindow.classList.add('open');
      document.body.classList.add('jordan-open');
      this.inputField.focus();
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    close() {
      this.chatWindow.classList.remove('open');
      document.body.classList.remove('jordan-open');
    }

    async sendMessage() {
      const text = this.inputField.value.trim();
      if (!text || this.isLoading) return;

      this.messages.push({ role: 'user', content: text });
      this.renderMessages();
      this.saveMessages();
      this.inputField.value = '';
      this.updateSendButton();
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;

      this.isLoading = true;
      this.renderLoadingIndicator();

      try {
        const response = await fetch(this.config.proxyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: this.sessionId,
            userMessage: text,
            messages: this.messages.slice(0, -1)
          })
        });

        const data = await response.json();
        
        if (data.error) {
          this.messages.push({
            role: 'assistant',
            content: data.fallback || 'Ocurrió un error. Intenta de nuevo.'
          });
        } else {
          this.messages.push({
            role: 'assistant',
            content: data.content || 'No entendí bien. ¿Podrías repetir?'
          });
        }
      } catch (error) {
        console.error('[Jordan] Error:', error);
        this.messages.push({
          role: 'assistant',
          content: 'Estoy teniendo problemas técnicos. Intenta más tarde.'
        });
      }

      this.isLoading = false;
      this.renderMessages();
      this.saveMessages();
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    updateSendButton() {
      const hasText = this.inputField.value.trim().length > 0;
      this.sendBtn.disabled = !hasText || this.isLoading;
    }

    renderMessages() {
      this.messagesContainer.innerHTML = '';
      this.messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `jordan-message ${msg.role}`;
        const bubble = document.createElement('div');
        bubble.className = 'jordan-message-bubble';
        bubble.textContent = msg.content;
        div.appendChild(bubble);
        this.messagesContainer.appendChild(div);
      });
    }

    renderLoadingIndicator() {
      const div = document.createElement('div');
      div.className = 'jordan-message loading';
      const bubble = document.createElement('div');
      bubble.className = 'jordan-message-bubble';
      bubble.innerHTML = `<div class="jordan-typing-indicator"><div class="jordan-typing-dot"></div><div class="jordan-typing-dot"></div><div class="jordan-typing-dot"></div></div>`;
      div.appendChild(bubble);
      this.messagesContainer.appendChild(div);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new JordanWidget(CONFIG);
    });
  } else {
    new JordanWidget(CONFIG);
  }

})();
