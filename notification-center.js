/* APML unified admin notification centre */
(function () {
  'use strict';
  const SUPABASE_URL = 'https://jethunntsnnjlwnwsjrh.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldGh1bm50c25uamx3bndzanJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTM1MTMsImV4cCI6MjEwMzI4OTUxM30.LscEvNwTob22YmaCqeYQn58eYWJremA5lm6LvQboJN0';
  const API = 'https://apml-drive-api.kundar-work.workers.dev/admin-notifications';
  if (!window.supabase || !window.supabase.createClient) return;
  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let session = null, allItems = [], filter = 'all';
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isPage = !!$('notificationList');

  async function api(method, body) {
    const response = await fetch(API, { method, headers: { Authorization: 'Bearer ' + session.access_token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Notification service unavailable (' + response.status + ')');
    return data;
  }
  function setStatus(message, error) {
    const el = $('notificationStatus');
    if (el) { el.textContent = message || ''; el.classList.toggle('error', !!error); }
  }
  function updateBell(count) {
    const badge = $('apmlNotificationCount');
    if (!badge) return;
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = !count;
    const bell = $('apmlNotificationBell');
    if (bell) bell.setAttribute('aria-label', count ? count + ' unread notifications' : 'Notifications');
  }
  function render() {
    const list = $('notificationList');
    if (!list) return;
    const query = ($('notificationSearch')?.value || '').trim().toLowerCase();
    const rows = allItems.filter(item => {
      const matchesFilter = filter === 'all' || (filter === 'unread' ? !(item.readBy || []).includes(session.user.email.toLowerCase()) : filter.startsWith('category:') ? item.category === filter.slice(9) : item.priority === filter);
      const haystack = [item.title, item.message, item.category].join(' ').toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
    if (!rows.length) { list.innerHTML = '<div class="nc-empty"><span class="material-symbols-outlined">notifications_off</span><strong>All quiet here</strong><p>New portal activity and important system alerts will appear here.</p></div>'; return; }
    list.innerHTML = rows.map(item => {
      const read = (item.readBy || []).includes(session.user.email.toLowerCase());
      const date = new Date(item.createdAt || Date.now()).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      return `<article class="nc-item ${read ? 'is-read' : 'is-unread'}"><div class="nc-item-top"><span class="nc-priority ${esc(item.priority || 'normal')}">${esc(item.priority || 'normal')}</span><span class="nc-category">${esc(item.category || 'system')}</span><time>${esc(date)}</time></div><h3>${esc(item.title)}</h3><p>${esc(item.message || '')}</p><div class="nc-item-actions">${read ? '<span class="nc-read-label">Read</span>' : `<button type="button" data-read="${esc(item.id)}">Mark as read</button>`}</div></article>`;
    }).join('');
    list.querySelectorAll('[data-read]').forEach(button => button.addEventListener('click', async () => {
      button.disabled = true;
      try { await api('POST', { action: 'mark-read', id: button.dataset.read }); await load(); }
      catch (error) { setStatus(error.message, true); button.disabled = false; }
    }));
  }
  async function load() {
    if (!session) return;
    const data = await api('GET');
    allItems = Array.isArray(data.items) ? data.items : [];
    updateBell(Number(data.unread) || 0);
    render();
    setStatus('Updated just now');
  }
  async function showPage() {
    const login = $('notificationLogin'), app = $('notificationApp');
    if (!isPage) return;
    if (!session) { login.hidden = false; app.hidden = true; return; }
    login.hidden = true; app.hidden = false;
    const who = $('notificationAdminEmail'); if (who) who.textContent = session.user.email || 'Administrator';
    try { await load(); } catch (error) { setStatus(error.message, true); }
  }
  async function refreshSession() {
    const result = await client.auth.getSession();
    session = result.data.session;
    if (isPage) await showPage();
    else if (session) { try { await load(); } catch (_) {} }
  }

  if (isPage) {
    $('notificationLoginForm')?.addEventListener('submit', async event => {
      event.preventDefault();
      const button = $('notificationLoginButton');
      button.disabled = true; button.textContent = 'Signing in…'; setStatus('Verifying administrator access…');
      const { data, error } = await client.auth.signInWithOtp({ email: $('notificationEmail').value.trim(), options: { emailRedirectTo: window.location.href, shouldCreateUser: false } });
      button.disabled = false; button.textContent = 'Sign in';
      if (error) { setStatus(error.message, true); return; }
      if (!data.session) { setStatus('A secure sign-in link has been sent to your administrator email. Open it on this device to continue.'); return; }
      session = data.session;
      await showPage();
    });
    $('notificationSignOut')?.addEventListener('click', async () => { await client.auth.signOut(); session = null; allItems = []; await showPage(); });
    $('notificationRefresh')?.addEventListener('click', async () => { try { await load(); } catch (error) { setStatus(error.message, true); } });
    $('notificationMarkAll')?.addEventListener('click', async () => { try { await api('POST', { action: 'mark-all-read' }); await load(); } catch (error) { setStatus(error.message, true); } });
    $('notificationClear')?.addEventListener('click', async () => {
      if (!confirm('Clear your notification history? This only hides it from your admin inbox.')) return;
      try { await api('POST', { action: 'clear' }); await load(); } catch (error) { setStatus(error.message, true); }
    });
    $('notificationSearch')?.addEventListener('input', render);
    document.querySelectorAll('[data-nc-filter]').forEach(button => button.addEventListener('click', () => {
      filter = button.dataset.ncFilter;
      document.querySelectorAll('[data-nc-filter]').forEach(b => b.classList.toggle('active', b === button));
      render();
    }));
  }
  refreshSession();
  client.auth.onAuthStateChange((_event, nextSession) => { session = nextSession; if (isPage) showPage(); else if (session) load().catch(() => {}); });
  if (!isPage) { setInterval(() => { if (session && document.visibilityState === 'visible') load().catch(() => {}); }, 90000); }
  window.APMLNotificationCenter = { refresh: load };
})();
