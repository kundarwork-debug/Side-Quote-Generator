/* =====================================================================
   APML assistant: a chat window that opens from the floating avatar.

   A small 💬 button appears next to the avatar. Tap it, ask a question, and the answer
   comes from your Cloudflare Worker (/chat), which holds the AI key. Nothing secret is
   in this file. Pages without the avatar (like 404.html) simply do not get the button.
   ===================================================================== */
(function () {
  'use strict';
  if (window.APMChat) return;

  // ---------------- settings ----------------
  var CHAT = {
    url: 'https://apml-drive-api.kundar-work.workers.dev/chat',
    maxChars: 500,         // longest question
    keepTurns: 8,          // earlier messages sent along so the assistant remembers the conversation
    minGapMs: 1500,        // least time between two questions
    perHour: 30,           // questions per hour from one device
    waitForAvatarTries: 40 // the avatar is built a moment after the page opens
  };
  var STORE = 'apml_chat_v1';
  var HOUR = 'apml_chat_hour';
  var GREETING = 'Hi! I am the APML assistant. Ask me how to use the portal: quotations, rates, the directory, the Drive or the Gallery.';
  var CHIPS = ['How do I create a quotation?', 'Where can I find hub contacts?', 'How do I use the rate calculators?'];

  // ---------------- small helpers ----------------
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;     // always text, never HTML
    return e;
  }
  function loadHistory() {
    try {
      var h = JSON.parse(sessionStorage.getItem(STORE) || '[]');
      return Array.isArray(h) ? h.filter(function (m) { return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'; }) : [];
    } catch (e) { return []; }
  }
  function saveHistory(h) {
    try { sessionStorage.setItem(STORE, JSON.stringify(h.slice(-40))); } catch (e) {}
  }
  function hourAllowed() {
    try {
      var key = new Date().toISOString().slice(0, 13);
      var s = JSON.parse(localStorage.getItem(HOUR) || '{}');
      if (s.h !== key) s = { h: key, n: 0 };
      if (s.n >= CHAT.perHour) return false;
      s.n++;
      localStorage.setItem(HOUR, JSON.stringify(s));
      return true;
    } catch (e) { return true; }
  }
  function pageName() { return window.location.pathname.split('/').pop() || 'index.html'; }
  function mascot() { return window.APMLMascot || {}; }

  // ---------------- styles ----------------
  function addStyles() {
    var st = document.createElement('style');
    st.textContent =
      '.apml-chat-btn{position:absolute;right:76px;bottom:10px;width:34px;height:34px;border-radius:50%;border:2px solid var(--text-main,#1c1917);' +
      'background:var(--surface-card,#fff);box-shadow:2px 2px 0 var(--text-main,#1c1917);font-size:17px;line-height:1;cursor:pointer;padding:0;pointer-events:auto;transition:transform .15s ease}' +
      '.apml-chat-btn:hover{transform:translateY(-2px)}.apml-chat-btn:focus-visible{outline:3px solid var(--primary,#b91c1c);outline-offset:2px}' +
      '.apml-chat{position:fixed;right:24px;bottom:112px;z-index:101;width:min(360px,calc(100vw - 32px));height:min(480px,calc(100vh - 150px));display:flex;flex-direction:column;' +
      'background:var(--surface-card,#fff);color:var(--text-main,#1c1917);border:3px solid var(--text-main,#1c1917);border-radius:18px;box-shadow:6px 6px 0 var(--text-main,#1c1917);' +
      'font-family:inherit;overflow:hidden}.apml-chat[hidden]{display:none}' +
      '.apml-chat-head{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--primary,#b91c1c);color:#fff;font-weight:800;font-size:14px}' +
      '.apml-chat-head span{flex:1}.apml-chat-head button{background:rgba(255,255,255,.18);border:0;color:#fff;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:15px;line-height:1}' +
      '.apml-chat-head button:hover{background:rgba(255,255,255,.32)}' +
      '.apml-chat-log{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;scroll-behavior:smooth}' +
      '.apml-msg{max-width:86%;padding:9px 12px;border-radius:14px;font-size:13.5px;line-height:1.45;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:anywhere}' +
      '.apml-msg.user{align-self:flex-end;background:var(--primary,#b91c1c);color:#fff;border-bottom-right-radius:4px}' +
      '.apml-msg.bot{align-self:flex-start;background:var(--surface-card-subtle,#f5f5f4);border:1px solid var(--surface-border,#d6d3d1);border-bottom-left-radius:4px}' +
      '.apml-msg.err{align-self:flex-start;background:rgba(220,38,38,.1);color:#b91c1c;border:1px solid rgba(220,38,38,.35);border-bottom-left-radius:4px}' +
      '.apml-dots span{display:inline-block;width:6px;height:6px;margin:0 2px;border-radius:50%;background:currentColor;opacity:.4;animation:apmlDot 1s infinite ease-in-out}' +
      '.apml-dots span:nth-child(2){animation-delay:.15s}.apml-dots span:nth-child(3){animation-delay:.3s}' +
      '@keyframes apmlDot{0%,80%,100%{transform:translateY(0);opacity:.35}40%{transform:translateY(-4px);opacity:1}}' +
      '.apml-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 8px}' +
      '.apml-chips button{border:1.5px solid var(--primary,#b91c1c);background:transparent;color:var(--primary,#b91c1c);border-radius:999px;padding:5px 10px;font-size:12px;font-weight:700;cursor:pointer}' +
      '.apml-chips button:hover{background:var(--primary,#b91c1c);color:#fff}' +
      '.apml-chat-form{display:flex;gap:8px;padding:10px 12px;border-top:2px solid var(--surface-border,#d6d3d1);align-items:flex-end}' +
      '.apml-chat-form textarea{flex:1;resize:none;max-height:90px;min-height:38px;padding:9px 11px;border-radius:12px;border:1.5px solid var(--surface-border,#d6d3d1);background:var(--surface-card-subtle,#fafaf9);color:inherit;font:inherit;font-size:13.5px;outline:none}' +
      '.apml-chat-form textarea:focus{border-color:var(--primary,#b91c1c)}' +
      '.apml-chat-form button{border:0;background:var(--primary,#b91c1c);color:#fff;border-radius:12px;width:42px;height:38px;font-size:16px;cursor:pointer}' +
      '.apml-chat-form button:disabled{opacity:.5;cursor:not-allowed}' +
      '.apml-chat-note{padding:0 12px 8px;font-size:10.5px;color:var(--text-muted,#78716c);text-align:center}' +
      '@media (max-width:480px){.apml-chat{right:12px;bottom:104px;width:calc(100vw - 24px)}}' +
      '@media (prefers-reduced-motion:reduce){.apml-dots span{animation:none}.apml-chat-log{scroll-behavior:auto}}';
    document.head.appendChild(st);
  }

  // ---------------- the chat window ----------------
  function build(fab) {
    addStyles();

    var btn = el('button', 'apml-chat-btn', '💬');
    btn.type = 'button';
    btn.title = 'Ask the assistant';
    btn.setAttribute('aria-label', 'Chat with the APML assistant');
    fab.appendChild(btn);

    var panel = el('section', 'apml-chat');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'APML assistant');

    var head = el('div', 'apml-chat-head');
    head.appendChild(el('span', '', '🤖 APML Assistant'));
    var clear = el('button', '', '↺'); clear.type = 'button'; clear.title = 'Start a new chat'; clear.setAttribute('aria-label', 'Start a new chat');
    var close = el('button', '', '✕'); close.type = 'button'; close.title = 'Close'; close.setAttribute('aria-label', 'Close chat');
    head.appendChild(clear); head.appendChild(close);

    var log = el('div', 'apml-chat-log');
    log.setAttribute('aria-live', 'polite');
    var chips = el('div', 'apml-chips');
    var form = el('form', 'apml-chat-form');
    var input = el('textarea');
    input.rows = 1; input.maxLength = CHAT.maxChars; input.placeholder = 'Ask about quotations, rates, contacts…';
    input.setAttribute('aria-label', 'Your question');
    var send = el('button', '', '➤'); send.type = 'submit'; send.title = 'Send'; send.setAttribute('aria-label', 'Send');
    form.appendChild(input); form.appendChild(send);
    var note = el('div', 'apml-chat-note', 'AI can make mistakes. Please do not share passwords or customer details.');

    [head, log, chips, form, note].forEach(function (n) { panel.appendChild(n); });
    document.body.appendChild(panel);

    var history = loadHistory();
    var pending = false, lastSent = 0;

    function bubble(kind, text) {
      var b = el('div', 'apml-msg ' + kind, text);
      log.appendChild(b);
      log.scrollTop = log.scrollHeight;
      return b;
    }
    function render() {
      log.textContent = '';
      bubble('bot', GREETING);
      history.forEach(function (m) { bubble(m.role === 'user' ? 'user' : 'bot', m.content); });
      chips.textContent = '';
      if (!history.length) {
        CHIPS.forEach(function (c) {
          var b = el('button', '', c); b.type = 'button';
          b.addEventListener('click', function () { ask(c); });
          chips.appendChild(b);
        });
      }
    }
    function openChat() {
      panel.hidden = false;
      try { if (mascot().wake) mascot().wake(); } catch (e) {}
      render();
      input.focus();
    }
    function closeChat() { panel.hidden = true; btn.focus(); }

    function typing() {
      var b = el('div', 'apml-msg bot apml-dots');
      b.setAttribute('aria-label', 'The assistant is typing');
      for (var i = 0; i < 3; i++) b.appendChild(el('span'));
      log.appendChild(b); log.scrollTop = log.scrollHeight;
      return b;
    }
    function friendly(status, data) {
      if (status === 429) return 'You are asking quickly, please wait a few seconds and try again.';
      if (status === 503) return 'The assistant is not switched on yet. Please ask the portal admin.';
      if (status === 403) return 'The assistant cannot be used from this address.';
      return 'Sorry, I could not answer just now. Please try again in a moment.';
    }

    function ask(text) {
      text = String(text || '').trim().slice(0, CHAT.maxChars);
      if (!text || pending) return;
      var now = Date.now();
      if (now - lastSent < CHAT.minGapMs) return;
      if (!hourAllowed()) { bubble('err', 'You have reached the question limit for this hour. Please try again later.'); return; }
      lastSent = now; pending = true; send.disabled = true;
      try { if (mascot().wake) mascot().wake(); } catch (e) {}

      chips.textContent = '';
      bubble('user', text);
      input.value = ''; input.style.height = 'auto';
      var dots = typing();

      var turns = history.slice(-(CHAT.keepTurns - 1)).concat([{ role: 'user', content: text }]);
      var done = function () { if (dots.parentNode) dots.parentNode.removeChild(dots); pending = false; send.disabled = false; input.focus(); };

      fetch(CHAT.url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },     // a "simple" request: no extra browser permission check
        body: JSON.stringify({ messages: turns, page: pageName() })
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          done();
          if (res.ok && data && data.ok && data.reply) {
            history.push({ role: 'user', content: text }, { role: 'assistant', content: data.reply });
            saveHistory(history);
            bubble('bot', data.reply);
          } else {
            bubble('err', friendly(res.status, data));
          }
        });
      }).catch(function () {
        done();
        bubble('err', friendly(0));
      });
    }

    btn.addEventListener('click', function () { if (panel.hidden) openChat(); else closeChat(); });
    close.addEventListener('click', closeChat);
    clear.addEventListener('click', function () { history = []; saveHistory(history); render(); input.focus(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask(input.value); }
      if (e.key === 'Escape') closeChat();
    });
    input.addEventListener('input', function () {
      input.style.height = 'auto';
      input.style.height = Math.min(90, input.scrollHeight) + 'px';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) closeChat(); });

    window.APMChat = { open: openChat, close: closeChat, version: 1 };
  }

  // the avatar is built shortly after the page opens: wait for it
  var tries = 0;
  (function wait() {
    var fab = document.getElementById('support-fab');
    if (fab && document.getElementById('supportAvatarBtn')) { build(fab); return; }
    if (++tries < CHAT.waitForAvatarTries) setTimeout(wait, 300);
  })();
})();
