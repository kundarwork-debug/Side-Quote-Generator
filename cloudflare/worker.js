// Cloudflare Git deployment trigger — no runtime behavior change.
// apml-drive-api — Cloudflare Worker

// Secrets to add in Cloudflare (Settings > Variables and Secrets):

//   CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET   (use your rotated secret)

//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const CONFIG = {

  CLOUD_NAME: 'wbrmw2pm',

  FIREBASE_DB_URL: 'https://apml-portal-default-rtdb.firebaseio.com',

  SUPABASE_URL: 'https://jethunntsnnjlwnwsjrh.supabase.co',

  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpldGh1bm50c25uamx3bndzanJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MTM1MTMsImV4cCI6MjEwMzI4OTUxM30.LscEvNwTob22YmaCqeYQn58eYWJremA5lm6LvQboJN0',

  ADMIN_EMAILS: ['kundar.work@gmail.com', 'kundar701@gmail.com'],

  QUOTATION_CAP: 200,

  QUOTATION_FOLDER_NAMES: ['quotation', 'quotations'],

  QUOTATION_FOLDER_KEYS: ['quotation_folder'],

  DOWNLOAD_HOSTS: ['files.catbox.moe', 'litter.catbox.moe'],

  ALLOWED_ORIGINS: [

    'https://apmlportal.vercel.app',

    'https://kundarwork-debug.github.io',

  ],

  TELEGRAM_MAX_PER_MINUTE: 8,

  TELEGRAM_MIN_GAP_MS: 1200,

  TELEGRAM_COMMAND_COOLDOWN_MS: 3000,

  VISITOR_LOCATION: 'region',

  PRESENCE_PATH: 'presence',

  ANNOUNCE_DEFAULT_HOURS: 12,

  ANNOUNCE_MAX_HOURS: 48,

  ANNOUNCE_MAX_CHARS: 280,

  PDF_TOTAL_PATH: 'analytics/totalPdfDownloads',

  MEDIA_TOTAL_PATH: 'analytics/totalMediaDownloads',

  STATS_TIMEOUT_MS: 2500,

  COUNTER_SETTLE_MS: 700,

};

const CORS = {

  'Access-Control-Allow-Origin': '\*',

  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',

  'Access-Control-Allow-Headers': 'Content-Type, Authorization',

};

const json = (data, status = 200) =>

  new Response(JSON.stringify(data), {

    status,

    headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },

  });

function parseCloudinaryUrl(url) {

  try {

    const u = new URL(url);

    if (u.hostname !== 'res.cloudinary.com') return null;

    const parts = u.pathname.split('/').filter(Boolean);

    if (parts[0] !== CONFIG.CLOUD_NAME || parts[2] !== 'upload') return null;

    const resourceType = parts[1];

    if (!['image', 'video', 'raw'].includes(resourceType)) return null;

    let rest = parts.slice(3);

    const v = rest.findIndex((p) => /^v\d+$/.test(p));

    if (v !== -1) rest = rest.slice(v + 1);

    let publicId = decodeURIComponent(rest.join('/'));

    if (resourceType !== 'raw') publicId = publicId.replace(/\\.[^/.]+$/, '');

    return publicId ? { resourceType, publicId } : null;

  } catch {

    return null;

  }

}

async function cloudinaryDelete(env, items) {

  const groups = {};

  for (const it of items) (groups[it.resourceType] ||= []).push(it.publicId);

  const auth = 'Basic ' + btoa(`${env.CLOUDINARY_API_KEY}:${env.CLOUDINARY_API_SECRET}`);

  const results = [];

  for (const [type, ids] of Object.entries(groups)) {

    for (let i = 0; i < ids.length; i += 100) {

      const qs = new URLSearchParams();

      ids.slice(i, i + 100).forEach((id) => qs.append('public_ids[]', id));

      qs.set('invalidate', 'true');

      const res = await fetch(

        `https://api.cloudinary.com/v1_1/${CONFIG.CLOUD_NAME}/resources/${type}/upload?${qs}`,

        { method: 'DELETE', headers: { Authorization: auth } }

      );

      const body = await res.json().catch(() => ({}));

      const map = body.deleted || {};

      results.push({

        type,

        ok: res.ok,

        status: res.status,

        error: body.error && body.error.message,

        deleted: Object.keys(map).filter((k) => map[k] === 'deleted'),

        notFound: Object.keys(map).filter((k) => map[k] === 'not_found'),

      });

    }

  }

  return results;

}

async function getAdminEmail(request) {

  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');

  if (!token) return null;

  const res = await fetch(`${CONFIG.SUPABASE_URL}/auth/v1/user`, {

    headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },

  });

  if (!res.ok) return null;

  const user = await res.json();

  const email = String(user.email || '').trim().toLowerCase();

  return CONFIG.ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(email) ? email : null;

}

async function trimQuotations(env) {

  const base = CONFIG.FIREBASE_DB_URL;

  const [fr, fl] = await Promise.all([

    fetch(`${base}/catbox_gdrive_folders.json`),

    fetch(`${base}/catbox_gdrive_files.json`),

  ]);

  const folders = (await fr.json()) || {};

  const files = (await fl.json()) || {};

  let folderKey = null;

  for (const [key, f] of Object.entries(folders)) {

    if (!f) continue;

    const nameMatch =

      (f.parentId || 'root') === 'root' &&

      CONFIG.QUOTATION_FOLDER_NAMES.includes(String(f.name || '').trim().toLowerCase());

    if (CONFIG.QUOTATION_FOLDER_KEYS.includes(key) || nameMatch) { folderKey = key; break; }

  }

  if (!folderKey) return { trimmed: 0, note: 'no quotation folder' };

  const inFolder = Object.entries(files)

    .filter(([, f]) => f && f.parentId === folderKey)

    .map(([key, f]) => ({ key, ...f }))

    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

  const excess = inFolder.length - CONFIG.QUOTATION_CAP;

  if (excess <= 0) return { trimmed: 0, count: inFolder.length };

  const oldest = inFolder.slice(0, excess);

  const parsed = oldest.map((f) => parseCloudinaryUrl(f.fileId)).filter(Boolean);

  if (parsed.length) {

    const results = await cloudinaryDelete(env, parsed);

    const failed = results.find((r) => !r.ok);

    if (failed) return { trimmed: 0, error: failed.error || `HTTP ${failed.status}` };

  }

  for (const f of oldest) {

    await fetch(`${base}/catbox_gdrive_files/${f.key}.json`, { method: 'DELETE' });

  }

  return { trimmed: oldest.length, count: CONFIG.QUOTATION_CAP };

}

const TG_EMOJI = { pdf: '🧾', drive: '📥', gallery: '🖼️', visit: '🟢', bug: '🚨', error: '🧯' };


function tgClean(v, max) {

  return String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);

}

function tgEsc(v) {

  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\\"/g, '&quot;').replace(/'/g, '&#39;');

}

function tgOriginAllowed(request) {

  if (!CONFIG.ALLOWED_ORIGINS.length) return true;

  return CONFIG.ALLOWED_ORIGINS.includes(request.headers.get('Origin') || '');

}

async function tgSendMessage(env, chatId, payload) {
  if (!env.TELEGRAM_BOT_TOKEN || !chatId) return { ok: false, status: 503, data: { description: 'Telegram is not configured' } };
  const kv = env.ANNOUNCE_KV, now = Date.now();
  if (!kv) return { ok: false, status: 503, data: { description: 'Telegram safety storage is not configured; message not sent' } };
  // KV is shared across Worker isolates, unlike module memory. It is eventually
  // consistent, so this is a conservative best-effort guard, not an atomic queue.
  if (kv) {
    try {
      const pausedUntil = Number(await kv.get('telegram_global_pause_until') || 0);
      if (pausedUntil > now) return { ok:false,status:429,data:{description:'Telegram paused after rate limit',parameters:{retry_after:Math.ceil((pausedUntil-now)/1000)}} };
      const lastSent = Number(await kv.get('telegram_last_send_at') || 0);
      const gap = CONFIG.TELEGRAM_MIN_GAP_MS - (now-lastSent);
      if (gap > 0) return { ok:false,status:429,data:{description:'Telegram pacing limit',parameters:{retry_after:Math.ceil(gap/1000)}} };
      const minuteKey='telegram_send_minute:'+Math.floor(now/60000);
      const count=Number(await kv.get(minuteKey)||0);
      if(count>=CONFIG.TELEGRAM_MAX_PER_MINUTE) return {ok:false,status:429,data:{description:'Telegram safety limit reached',parameters:{retry_after:60-Math.floor((now%60000)/1000)}}};
      await kv.put('telegram_last_send_at',String(now),{expirationTtl:120});
      await kv.put(minuteKey,String(count+1),{expirationTtl:120});
    } catch(error) {
      console.error('Telegram safety guard unavailable:',error);
      return {ok:false,status:503,data:{description:'Telegram safety storage unavailable; not sent'}};
    }
  }
  let response,data;
  try {
    response=await fetch('https://api.telegram.org/bot'+env.TELEGRAM_BOT_TOKEN+'/sendMessage',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:chatId,...payload})
    });
    data=await response.json().catch(()=>({}));
  } catch(error) {
    return {ok:false,status:502,data:{description:'Telegram network request failed'}};
  }
  if(response.status===429||(data&&data.error_code===429)) {
    const retryAfter=Math.max(5,Math.min(3600,Number(data.parameters&&data.parameters.retry_after)||30));
    if(kv) try { await kv.put('telegram_global_pause_until',String(Date.now()+retryAfter*1000),{expirationTtl:retryAfter+30}); }
    catch(error) { console.error('Could not persist Telegram retry pause:',error); }
  }
  return {ok:response.ok&&!!data.ok,status:response.status,data};
}


function tgTime() {

  try {

    return new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) + ' IST';

  } catch (e) { return new Date().toISOString(); }

}

function tgItem(raw) {

  const type = TG_EMOJI[raw && raw.type] ? raw.type : 'drive';

  return {

    type: type,

    title: tgClean(raw && raw.title, 60) || 'File downloaded',

    file: tgClean(raw && raw.file, 150) || '(no name)',

    folder: tgClean(raw && raw.folder, 150),

  };

}

function tgPlace(request) {

  const level = CONFIG.VISITOR_LOCATION;

  if (!level || level === 'off') return '';

  const cf = (request && request.cf) || {};

  const parts = level === 'city' ? [cf.city, cf.region, cf.country] : level === 'country' ? [cf.country] : [cf.region, cf.country];

  return parts.filter(Boolean).map((x) => tgClean(x, 40)).join(', ');

}

async function fbRead(path) {

  const ctl = new AbortController();

  const timer = setTimeout(() => ctl.abort(), CONFIG.STATS_TIMEOUT_MS);

  try {

    const res = await fetch(CONFIG.FIREBASE_DB_URL + '/' + path + '.json', { signal: ctl.signal });

    if (!res.ok) return { ok: false };

    return { ok: true, value: await res.json() };

  } catch (e) {

    return { ok: false };

  } finally {

    clearTimeout(timer);

  }

}

const asCount = (r) => (r.ok && typeof r.value === 'number' && isFinite(r.value) && r.value >= 0 ? Math.floor(r.value) : null);

function getTodayIST() {

  try {

    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  } catch (e) {

    return new Date().toISOString().slice(0, 10);

  }

}

async function liveStatsWithDaily() {

  const todayKey = getTodayIST();

  const [presence, pdfsTotal, mediaTotal, todayLog] = await Promise.all([

    fbRead(CONFIG.PRESENCE_PATH),

    fbRead(CONFIG.PDF_TOTAL_PATH),

    fbRead(CONFIG.MEDIA_TOTAL_PATH),

    fbRead(`analytics/daily_logs/${todayKey}`)

  ]);

  const online = presence.ok

    ? (presence.value && typeof presence.value === 'object' ? Object.keys(presence.value).length : 0)

    : null;

  const todayData = todayLog.ok && todayLog.value ? todayLog.value : {};

  return {

    online: online,

    totalPdfs: asCount(pdfsTotal),

    totalMedia: asCount(mediaTotal),

    todayVisitors: Number(todayData.visitors) || 0,

    todayPdfs: Number(todayData.pdf) || 0,

    todayMedia: Number(todayData.media) || 0

  };

}

const tgNum = (n) => Number(n).toLocaleString('en-IN');

function tgStatsLines(st) {

  st = st || {};

  const has = (v) => v !== null && v !== undefined;

  return '👥 ' + (st.online ? st.online + (st.online === 1 ? ' person' : ' people') + ' online now' : 'Online now: —') + '\n' +

    '🧾 ' + (has(st.totalPdfs) ? tgNum(st.totalPdfs) + ' total PDFs' : 'PDFs generated: —') + '\n' +

    '📥 ' + (has(st.totalMedia) ? tgNum(st.totalMedia) + ' total media' : 'Media downloaded: —') + '\n';

}

function tgMessage(body, place, st) {

  if (body && Array.isArray(body.items)) {

    const items = body.items.slice(0, 15).map(tgItem);

    const lines = items.map((it, i) => (i + 1) + '. ' + (it.type === 'visit'

      ? '🟢 <code>' + tgEsc(it.file) + '</code>' + (it.folder ? ' (' + tgEsc(it.folder) + ')' : '')

      : '<code>' + tgEsc(it.file) + '</code>' + (it.folder ? ' (' + tgEsc(it.folder) + ')' : '')));

    const anyVisit = items.some((it) => it.type === 'visit');

    return TG_EMOJI.drive + ' <b>' + items.length + ' downloads</b>\n' + lines.join('\n') + '\n' +

      (anyVisit && place ? '📍 Approx. location: ' + tgEsc(place) + '\n' : '') +

      tgStatsLines(st) + '🕒 ' + tgTime();

  }

  const it = tgItem(body);

  if (it.type === 'visit') {

    return TG_EMOJI.visit + ' <b>' + tgEsc(it.title) + '</b>\n' +

      '📄 New visit: <code>' + tgEsc(it.file) + '</code>\n' +

      (it.folder ? '💻 ' + tgEsc(it.folder) + '\n' : '') +

      (place ? '📍 Approx. location: ' + tgEsc(place) + '\n' : '') +

      tgStatsLines(st) + '🕒 ' + tgTime();

  }

  return TG_EMOJI[it.type] + ' <b>' + tgEsc(it.title) + '</b>\n' +

    '📄 <code>' + tgEsc(it.file) + '</code>\n' +

    (it.folder ? '📁 ' + tgEsc(it.folder) + '\n' : '') +

    tgStatsLines(st) + '🕒 ' + tgTime();

}

const ADMIN_NOTIFICATIONS_KEY = 'admin_notifications';

function notificationPriority(type) {

  if (type === 'bug' || type === 'error') return 'high';

  if (type === 'visit') return 'low';

  return 'normal';

}

async function storeAdminNotification(env, input) {

  if (!env.ANNOUNCE_KV) return null;

  try {

    const items = JSON.parse((await env.ANNOUNCE_KV.get(ADMIN_NOTIFICATIONS_KEY)) || '[]');

    const item = {

      id: (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),

      title: tgClean(input.title || 'Portal notification', 100),

      message: tgClean(input.message || '', 500),

      category: tgClean(input.category || 'system', 30),

      priority: ['low', 'normal', 'high', 'critical'].includes(input.priority) ? input.priority : 'normal',

      createdAt: Date.now(), readBy: [], hiddenFor: []

    };

    items.unshift(item);

    await env.ANNOUNCE_KV.put(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(items.slice(0, 150)));

    return item;

  } catch (error) {

    console.error('Could not store admin notification:', error);

    return null;

  }

}

async function handleAdminNotifications(request, env) {

  const admin = await getAdminEmail(request);

  if (!admin) return json({ ok: false, error: 'Admin login required' }, 401);

  if (!env.ANNOUNCE_KV) return json({ ok: false, error: 'Notification storage is not configured' }, 503);

  if (request.method === 'GET') {

    const items = JSON.parse((await env.ANNOUNCE_KV.get(ADMIN_NOTIFICATIONS_KEY)) || '[]');

    const visible = items.filter(item => !(item.hiddenFor || []).includes(admin));

    return json({ ok: true, items: visible.slice(0, 100), unread: visible.filter(item => !(item.readBy || []).includes(admin)).length });

  }

  if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);

  let body;

  try { body = await request.json(); } catch { return json({ ok: false, error: 'Invalid JSON' }, 400); }

  const items = JSON.parse((await env.ANNOUNCE_KV.get(ADMIN_NOTIFICATIONS_KEY)) || '[]');

  const action = String(body.action || '');

  if (action === 'mark-read' || action === 'mark-all-read') {

    for (const item of items) {

      if (action === 'mark-all-read' || item.id === String(body.id || '')) {

        item.readBy = Array.isArray(item.readBy) ? item.readBy : [];

        if (!item.readBy.includes(admin)) item.readBy.push(admin);

      }

    }

  } else if (action === 'clear') {

    for (const item of items) {

      item.hiddenFor = Array.isArray(item.hiddenFor) ? item.hiddenFor : [];

      if (!item.hiddenFor.includes(admin)) item.hiddenFor.push(admin);

    }

  } else {

    return json({ ok: false, error: 'Unknown action' }, 400);

  }

  await env.ANNOUNCE_KV.put(ADMIN_NOTIFICATIONS_KEY, JSON.stringify(items.slice(0, 150)));

  return json({ ok: true });

}

async function sendPriorityErrorAlert(env, command, error) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID || !env.ANNOUNCE_KV) return;
  const message=String(error&&error.message||error||'Unknown error').slice(0,350);
  const key='error_alert_cooldown:'+String(command||'system').replace(/[^a-z0-9_\\-]/gi,'_').slice(0,40);
  const last=Number(await env.ANNOUNCE_KV.get(key)||0);
  if(Date.now()-last<5*60*1000)return;
  await env.ANNOUNCE_KV.put(key,String(Date.now()),{expirationTtl:600});
  await tgSendMessage(env,env.TELEGRAM_CHAT_ID,{
    text:'🚨 <b>HIGH PRIORITY — APML error</b>\n'+tgEsc(command||'system')+': '+tgEsc(message),
    parse_mode:'HTML',disable_web_page_preview:true
  });
}

async function handleNotify(request, env) {

  if (!tgOriginAllowed(request)) return json({ ok: false, error: 'Origin not allowed' }, 403);

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {

    return json({ ok: false, error: 'Telegram is not set up on the Worker yet' }, 500);

  }

  let body;

  try {

    const text = await request.text();

    if (text.length > 6000) return json({ ok: false, error: 'Too large' }, 413);

    body = JSON.parse(text);

  } catch (e) { return json({ ok: false, error: 'Bad request' }, 400); }

  // Shared KV pacing and rate checks run immediately before each Telegram send.

  const hasDownload = Array.isArray(body && body.items)

    ? body.items.some((x) => x && x.type !== 'visit')

    : !!body && body.type !== 'visit';

  if (hasDownload && CONFIG.COUNTER_SETTLE_MS > 0) await new Promise((r) => setTimeout(r, CONFIG.COUNTER_SETTLE_MS));

  const stats = await liveStatsWithDaily();

  const notifiedItems = Array.isArray(body && body.items) ? body.items.slice(0, 15) : [body];

  for (const raw of notifiedItems) {

    if (!raw || !raw.type) continue;

    const priority = notificationPriority(raw.type);

    await storeAdminNotification(env, {

      title: raw.title || (raw.type === 'visit' ? 'New portal visit' : 'Portal activity'),

      message: [raw.file, raw.folder].filter(Boolean).join(' · ') || 'Portal event received',

      category: raw.type === 'bug' || raw.type === 'error' ? 'error' : raw.type,

      priority

    });

  }

  const priorityPrefix = notifiedItems.some(x => x && ['bug', 'error'].includes(x.type)) ? '🚨 <b>HIGH PRIORITY</b>\n' : '';

  const sent=await tgSendMessage(env,env.TELEGRAM_CHAT_ID,{
    text:priorityPrefix+tgMessage(body,tgPlace(request),stats),
    parse_mode:'HTML',disable_web_page_preview:true
  });
  if(sent.ok)return json({ok:true});
  const wait=sent.data&&sent.data.parameters&&sent.data.parameters.retry_after;
  return json({ok:false,error:String(sent.data&&sent.data.description||'Telegram error').slice(0,200),retry_after:wait},sent.status===429?429:sent.status===503?503:502);

}

async function tgReply(env, chatId, replyTo, text) {

  if (!env.TELEGRAM_BOT_TOKEN) return;

  const value = String(text || '');

  const chunks = [];

  for (let i = 0; i < value.length; i += 3900) chunks.push(value.slice(i, i + 3900));

  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await new Promise(resolve => setTimeout(resolve, CONFIG.TELEGRAM_MIN_GAP_MS));
    const sent = await tgSendMessage(env,chatId,{
      text:chunks[i],
      ...(i===0&&replyTo?{reply_to_message_id:replyTo,allow_sending_without_reply:true}:{})
    });
    if (!sent.ok) return;
  }

}

function parseTgCommand(text) {

  const t = String(text || '').trim();

  if (/^(\/)?(cancel|stop)$/i.test(t)) return { cmd: 'cancel', rest: '' };

  const m = t.match(/^\/([A-Za-z]+)(?:@\w+)?(?:\s+([\s\S]*))?$/);

  if (!m) return null;

  const cmd = m[1].toLowerCase();

  return { cmd: cmd === 'say' ? 'announce' : cmd, rest: (m[2] || '').trim() };

}

function parseDuration(rest) {

  const m = rest.match(/^(\d{1,3})\s?(m|min|mins|h|hr|hrs|hour|hours)\b\s+([\s\S]*)$/i);

  if (!m) return { hours: CONFIG.ANNOUNCE_DEFAULT_HOURS, text: rest };

  const n = Number(m[1]);

  const hours = /^m/i.test(m[2]) ? n / 60 : n;

  return { hours: Math.min(CONFIG.ANNOUNCE_MAX_HOURS, Math.max(5 / 60, hours)), text: m[3] };

}

function leftText(ms) {

  const mins = Math.max(1, Math.round(ms / 60000));

  return mins >= 120 ? Math.round(mins / 60) + ' hours' : mins >= 60 ? '1 hour ' + (mins - 60) + ' min' : mins + ' min';

}

// -----------------------------------------------------------------------------

// APML COMPLETE ADMIN BOT — reporting, file inventory and maintenance

// -----------------------------------------------------------------------------

const ADMIN_HELP_TEXT =

  '🤖 APML Complete Admin Bot\n\n' +

  '📊 REPORTS\n' +

  '/report — daily breakdown + overall totals\n' +

  '/today — today in IST\n' +

  '/yesterday — yesterday in IST\n' +

  '/weekly — last 7 days\n' +

  '/monthly — last 30 days\n' +

  '/topdays — busiest recorded days\n' +

  '/growth — compare the latest 7 days with the previous 7\n' +

  '/downloads — PDF and media totals\n' +

  '/export — download analytics CSV in Telegram\n\n' +

  '🟢 MONITORING\n' +

  '/live — live counters\n' +

  '/health — dependency configuration checks\n' +

  '/uptime — Worker response status\n' +

  '/activity — recent tracked portal events\n' +

  '/errors — recent admin-bot errors\n' +

  '/inbox — recent admin notifications\n' +

  '/status — portal and announcement status\n\n' +

  '📁 FILES\n' +

  '/files — cloud drive file inventory\n' +

  '/recent — latest uploaded files\n' +

  '/quotations — quotation folder count\n' +

  '/storage — recorded file sizes\n' +

  '/search keyword — search Drive and gallery records\n' +

  '/cleanup — request quotation cleanup\n' +

  '/cleanup confirm — confirm cleanup within 2 minutes\n\n' +

  '🛠 ADMIN\n' +

  '/announce [duration] message — publish announcement\n' +

  '/cancel — cancel announcement\n' +

  '/maintenance on [message] — enable maintenance screen\n' +

  '/maintenance off — disable maintenance screen\n' +

  '/alerts on|off — hourly summary alerts\n' +

  '/help — show this menu';

function addDaysToKey(key, offset) {

  const d = new Date(key + 'T12:00:00Z');

  d.setUTCDate(d.getUTCDate() + offset);

  return d.toISOString().slice(0, 10);

}

function dailyFields(value) {

  const v = value && typeof value === 'object' ? value : {};

  return {

    visitors: Math.max(0, Number(v.visitors) || 0),

    pdf: Math.max(0, Number(v.pdf) || 0),

    media: Math.max(0, Number(v.media) || 0),

    peak: Math.max(0, Number(v.peak_online) || 0),

  };

}

async function readAllDailyLogs() {

  const result = await fbRead('analytics/daily_logs');

  if (!result.ok) throw new Error('Could not read Firebase analytics/daily_logs. Check Firebase REST read permissions.');

  return result.value && typeof result.value === 'object' ? result.value : {};

}

function sumDailyRows(rows) {

  return rows.reduce((acc, row) => {

    acc.visitors += row.visitors;

    acc.pdf += row.pdf;

    acc.media += row.media;

    acc.peak = Math.max(acc.peak, row.peak);

    return acc;

  }, { visitors: 0, pdf: 0, media: 0, peak: 0 });

}

async function buildSingleDayReport(key) {

  const result = await fbRead('analytics/daily_logs/' + key);

  if (!result.ok) throw new Error('Firebase daily analytics could not be read.');

  const d = dailyFields(result.value);

  return '📅 APML daily report — ' + key + ' (IST)\n\n' +

    '👁️ Daily visitors: ' + tgNum(d.visitors) + '\n' +

    '🧾 PDFs generated: ' + tgNum(d.pdf) + '\n' +

    '📥 Media downloads: ' + tgNum(d.media) + '\n' +

    '⚡ Peak online: ' + tgNum(d.peak) + '\n' +

    '📊 Total actions: ' + tgNum(d.pdf + d.media);

}

async function buildOverallReport() {

  const [logs, pdfTotal, mediaTotal, stats] = await Promise.all([

    readAllDailyLogs(), fbRead(CONFIG.PDF_TOTAL_PATH), fbRead(CONFIG.MEDIA_TOTAL_PATH), liveStatsWithDaily()

  ]);

  const keys = Object.keys(logs).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();

  const allRows = keys.map(key => ({ key, ...dailyFields(logs[key]) }));

  const totals = sumDailyRows(allRows);

  const recent = allRows.slice(-7);

  const lines = recent.map(r => r.key.slice(5) + ': 👁 ' + tgNum(r.visitors) + ' | 🧾 ' + tgNum(r.pdf) + ' | 📥 ' + tgNum(r.media));

  return '📊 APML COMPLETE REPORT\n' +

    'Date: ' + getTodayIST() + ' (IST)\n\n' +

    'TODAY\n' +

    '👁 Visitors: ' + tgNum(stats.todayVisitors) + '\n' +

    '🧾 PDFs: ' + tgNum(stats.todayPdfs) + '\n' +

    '📥 Media: ' + tgNum(stats.todayMedia) + '\n\n' +

    'OVERALL RECORDED DAILY TOTALS\n' +

    '👁 Sum of daily visitors: ' + tgNum(totals.visitors) + '\n' +

    '🧾 Daily PDF count sum: ' + tgNum(totals.pdf) + '\n' +

    '📥 Daily media count sum: ' + tgNum(totals.media) + '\n' +

    '⚡ Highest recorded daily peak: ' + tgNum(totals.peak) + '\n\n' +

    'LIFETIME COUNTERS\n' +

    '🧾 PDFs: ' + (asCount(pdfTotal) == null ? 'unavailable' : tgNum(asCount(pdfTotal))) + '\n' +

    '📥 Media: ' + (asCount(mediaTotal) == null ? 'unavailable' : tgNum(asCount(mediaTotal))) + '\n' +

    '🟢 Online now: ' + (stats.online == null ? 'unavailable' : tgNum(stats.online)) + '\n\n' +

    'LAST 7 RECORDED DAYS\n' + (lines.length ? lines.join('\n') : 'No daily records yet.') +

    '\n\nNote: visitor total is the sum of daily visitor counts, not deduplicated lifetime people.';

}

async function buildPeriodReport(days, label) {

  const logs = await readAllDailyLogs();

  const today = getTodayIST();

  const start = addDaysToKey(today, -(days - 1));

  const rows = Object.keys(logs).filter(k => k >= start && k <= today && /^\d{4}-\d{2}-\d{2}$/.test(k))

    .sort().map(key => ({ key, ...dailyFields(logs[key]) }));

  const sum = sumDailyRows(rows);

  return '📈 APML ' + label + ' report\n' + start + ' to ' + today + ' (IST)\n\n' +

    '👁 Visitors (daily sum): ' + tgNum(sum.visitors) + '\n' +

    '🧾 PDFs: ' + tgNum(sum.pdf) + '\n' +

    '📥 Media: ' + tgNum(sum.media) + '\n' +

    '⚡ Highest peak online: ' + tgNum(sum.peak) + '\n' +

    '📊 Total downloads: ' + tgNum(sum.pdf + sum.media) + '\n\n' +

    (rows.length ? rows.map(r => r.key + ' · V ' + tgNum(r.visitors) + ' · PDF ' + tgNum(r.pdf) + ' · Media ' + tgNum(r.media)).join('\n') : 'No records in this period.');

}

async function buildTopDaysReport() {

  const logs = await readAllDailyLogs();

  const rows = Object.keys(logs).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k))

    .map(key => ({ key, ...dailyFields(logs[key]) }))

    .sort((a, b) => (b.pdf + b.media + b.visitors) - (a.pdf + a.media + a.visitors))

    .slice(0, 7);

  return '🏆 APML busiest recorded days\n' +

    (rows.length ? rows.map((r, i) => (i + 1) + '. ' + r.key + ' — ' + tgNum(r.visitors + r.pdf + r.media) +

      ' combined actions (V ' + tgNum(r.visitors) + ', PDF ' + tgNum(r.pdf) + ', media ' + tgNum(r.media) + ')').join('\n') : 'No daily records yet.');

}

async function buildGrowthReport() {

  const logs = await readAllDailyLogs();

  const today = getTodayIST();

  const currentStart = addDaysToKey(today, -6);

  const previousStart = addDaysToKey(today, -13);

  const rows = Object.keys(logs).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).map(key => ({ key, ...dailyFields(logs[key]) }));

  const current = sumDailyRows(rows.filter(r => r.key >= currentStart && r.key <= today));

  const previous = sumDailyRows(rows.filter(r => r.key >= previousStart && r.key < currentStart));

  const metric = (name, a, b) => {

    const delta = a - b;

    const pct = b ? (delta / b * 100) : (a ? 100 : 0);

    return name + ': ' + tgNum(a) + ' vs ' + tgNum(b) + ' (' + (delta >= 0 ? '+' : '') + tgNum(delta) + ', ' + (pct >= 0 ? '+' : '') + pct.toFixed(1) + '%)';

  };

  return '📈 APML week-on-week comparison\n\n' +

    'Current: ' + currentStart + ' to ' + today + '\n' +

    'Previous: ' + previousStart + ' to ' + addDaysToKey(currentStart, -1) + '\n\n' +

    metric('Visitors (daily sum)', current.visitors, previous.visitors) + '\n' +

    metric('PDFs', current.pdf, previous.pdf) + '\n' +

    metric('Media', current.media, previous.media);

}

function csvCell(value) {

  const text = String(value == null ? '' : value);

  return '"' + text.replace(/"/g, '""') + '"';

}

async function sendAnalyticsCsv(env, chatId) {

  const logs = await readAllDailyLogs();

  const keys = Object.keys(logs).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort().slice(-730);

  const lines = [['date_ist', 'visitors', 'pdf', 'media', 'peak_online'].map(csvCell).join(',')];

  for (const key of keys) {

    const d = dailyFields(logs[key]);

    lines.push([key, d.visitors, d.pdf, d.media, d.peak].map(csvCell).join(','));

  }

  const csv = '\uFEFF' + lines.join('\r\n');

  const name = 'APML_Analytics\_' + getTodayIST() + '.csv';

  const form = new FormData();

  form.append('chat_id', String(chatId));

  form.append('document', new Blob([csv], { type: 'text/csv;charset=utf-8' }), name);

  // File uploads use the same shared KV safety limits as sendMessage.
  const kv = env.ANNOUNCE_KV;
  if (!kv) throw new Error('Telegram safety storage is not configured; CSV was not sent.');
  const now = Date.now();
  const pausedUntil = Number(await kv.get('telegram_global_pause_until') || 0);
  if (pausedUntil > now) throw new Error('Telegram is temporarily paused after a rate-limit response.');
  const lastSent = Number(await kv.get('telegram_last_send_at') || 0);
  if (CONFIG.TELEGRAM_MIN_GAP_MS - (now - lastSent) > 0) throw new Error('Telegram pacing limit; try the export again shortly.');
  const minuteKey = 'telegram_send_minute:' + Math.floor(now / 60000);
  const count = Number(await kv.get(minuteKey) || 0);
  if (count >= CONFIG.TELEGRAM_MAX_PER_MINUTE) throw new Error('Telegram safety limit reached; try the export next minute.');
  await kv.put('telegram_last_send_at', String(now), { expirationTtl: 120 });
  await kv.put(minuteKey, String(count + 1), { expirationTtl: 120 });

  const response = await fetch('https://api.telegram.org/bot' + env.TELEGRAM_BOT_TOKEN + '/sendDocument', { method: 'POST', body: form });
  const body = await response.json().catch(() => ({}));

  if (response.status === 429 || (body && body.error_code === 429)) {
    const retryAfter = Math.max(5, Math.min(3600, Number(body.parameters && body.parameters.retry_after) || 30));
    await kv.put('telegram_global_pause_until', String(Date.now() + retryAfter * 1000), { expirationTtl: retryAfter + 30 });
  }
  if (!response.ok || !body.ok) throw new Error(body.description || 'Telegram CSV upload failed.');

}

async function buildHealthReport(env) {

  const firebase = await fbRead('presence');

  const kv = !!env.ANNOUNCE_KV;

  const cloudinaryConfigured = !!(env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

  const telegramConfigured = !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && env.TELEGRAM_WEBHOOK_SECRET);

  return '🩺 APML dependency health\n\n' +

    'Firebase RTDB read: ' + (firebase.ok ? 'OK' : 'FAILED') + '\n' +

    'Telegram secrets: ' + (telegramConfigured ? 'configured' : 'missing') + '\n' +

    'Cloudinary credentials: ' + (cloudinaryConfigured ? 'configured' : 'missing') + '\n' +

    'KV namespace: ' + (kv ? 'bound' : 'missing') + '\n\n' +

    'Note: "configured" checks environment bindings, not a full external service transaction.';

}

async function buildActivityReport(env) {

  const result = await fbRead('analytics/events');

  if (!result.ok) return 'Recent activity is unavailable. Check Firebase read permissions for analytics/events.';

  const events = result.value && typeof result.value === 'object' ? Object.entries(result.value) : [];

  const latest = events.map(([id, e]) => ({ id, ...(e || {}) }))

    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0)).slice(0, 10);

  if (!latest.length) return 'No analytics/events records are currently available.';

  return '🕘 Recent tracked portal events\n' + latest.map((e, i) => {

    const date = e.timestamp ? new Date(Number(e.timestamp)).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : (e.dateKey || 'time unavailable');

    return (i + 1) + '. ' + tgClean(e.eventType || e.type || 'event', 30) +

      ' · ' + tgClean(e.page || e.fileName || '', 70) + '\n   ' + date;

  }).join('\n');

}

async function logAdminActivity(env, type, detail, userId) {

  if (!env.ANNOUNCE_KV) return;

  try {

    const items = JSON.parse((await env.ANNOUNCE_KV.get('admin_activity')) || '[]');

    items.unshift({ at: Date.now(), type: tgClean(type, 40), detail: tgClean(detail, 180), userId: String(userId || '') });

    await env.ANNOUNCE_KV.put('admin_activity', JSON.stringify(items.slice(0, 50)));

  } catch {}

}

async function logAdminError(env, command, error) {

  if (!env.ANNOUNCE_KV) return;

  try {

    const items = JSON.parse((await env.ANNOUNCE_KV.get('admin_errors')) || '[]');

    items.unshift({ at: Date.now(), command: tgClean(command, 40), error: tgClean(error && error.message || error, 240) });

    await env.ANNOUNCE_KV.put('admin_errors', JSON.stringify(items.slice(0, 30)));

    const message = tgClean(error && error.message || error, 240);

    await storeAdminNotification(env, { title: 'Admin bot error: ' + tgClean(command, 45), message, category: 'error', priority: 'high' });

    await sendPriorityErrorAlert(env, command, message);

  } catch {}

}

async function buildErrorReport(env) {

  if (!env.ANNOUNCE_KV) return 'KV is not configured; admin-bot error history is unavailable.';

  const items = JSON.parse((await env.ANNOUNCE_KV.get('admin_errors')) || '[]');

  return '🧯 Recent APML bot errors\n' + (items.length

    ? items.slice(0, 10).map((e, i) => (i + 1) + '. ' + new Date(e.at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + '\n   /' + e.command + ' — ' + e.error).join('\n')

    : 'No errors have been recorded by the admin bot.');

}

async function getMaintenanceStatus(env) {

  if (!env.ANNOUNCE_KV) return { active: false, message: '', configured: false };

  try {

    const value = JSON.parse((await env.ANNOUNCE_KV.get('maintenance')) || 'null');

    return value && value.active ? { ...value, configured: true } : { active: false, message: '', configured: true };

  } catch {

    return { active: false, message: '', configured: true };

  }

}

async function buildFilesReport(mode) {

  const [filesResult, foldersResult] = await Promise.all([fbRead('catbox_gdrive_files'), fbRead('catbox_gdrive_folders')]);

  if (!filesResult.ok || !foldersResult.ok) throw new Error('Firebase file inventory could not be read.');

  const files = filesResult.value && typeof filesResult.value === 'object' ? Object.entries(filesResult.value).map(([key, value]) => ({ key, ...(value || {}) })) : [];

  const folders = foldersResult.value && typeof foldersResult.value === 'object' ? Object.entries(foldersResult.value).map(([key, value]) => ({ key, ...(value || {}) })) : [];

  const quotationFolder = folders.find(f => f.key === 'quotation_folder' || ((f.parentId || 'root') === 'root' && /^(quotation|quotations)$/i.test(String(f.name || '').trim())));

  const quotations = quotationFolder ? files.filter(f => f.parentId === quotationFolder.key) : [];

  const bytes = files.reduce((sum, f) => sum + Math.max(0, Number(f.size) || 0), 0);

  if (mode === 'quotations') return '📄 Quotation inventory\nFolder: ' + (quotationFolder ? quotationFolder.name : 'not found') + '\nRecords: ' + tgNum(quotations.length) + '\nConfigured cap: ' + CONFIG.QUOTATION_CAP;

  if (mode === 'storage') return '💾 Recorded Cloud Drive storage\nFiles: ' + tgNum(files.length) + '\nKnown file sizes: ' + tgNum(bytes) + ' bytes (' + (bytes / 1048576).toFixed(2) + ' MiB)\nNote: this is the sum of Firebase file metadata sizes, not a Cloudinary account quota report.';

  const latest = files.slice().sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));

  if (mode === 'recent') return '🕘 Latest uploaded files\n' + (latest.length ? latest.slice(0, 10).map((f, i) => (i + 1) + '. ' + tgClean(f.name || 'Unnamed file', 100) + '\n   ' + (f.timestamp ? new Date(Number(f.timestamp)).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'Date unavailable')).join('\n') : 'No files found.');

  return '📁 APML Cloud Drive inventory\nFiles: ' + tgNum(files.length) + '\nFolders: ' + tgNum(folders.length) + '\nQuotation files: ' + tgNum(quotations.length) + '\nRecorded file size: ' + (bytes / 1048576).toFixed(2) + ' MiB';

}

async function searchPortalFiles(query) {

  const q = query.toLowerCase();

  const [driveResult, galleryResult] = await Promise.all([fbRead('catbox_gdrive_files'), fbRead('apml_ranked_gallery')]);

  const matches = [];

  if (driveResult.ok && driveResult.value && typeof driveResult.value === 'object') {

    for (const [key, f] of Object.entries(driveResult.value)) {

      if (f && String(f.name || '').toLowerCase().includes(q)) matches.push({ source: 'Drive', name: f.name || 'Unnamed', url: f.fileId || '', timestamp: f.timestamp || 0 });

    }

  }

  if (galleryResult.ok && galleryResult.value && typeof galleryResult.value === 'object') {

    for (const [key, f] of Object.entries(galleryResult.value)) {

      const name = String(f && (f.name || f.title || f.fileName) || '');

      if (f && name.toLowerCase().includes(q)) matches.push({ source: 'Gallery', name, url: f.url || f.fileUrl || '', timestamp: f.timestamp || 0 });

    }

  }

  return matches.length

    ? '🔎 Search results for "' + tgClean(query, 80) + '"\n' + matches.slice(0, 12).map((m, i) =>

      (i + 1) + '. [' + m.source + '] ' + tgClean(m.name, 120) + (m.url ? '\n   ' + tgClean(m.url, 220) : '')).join('\n')

    : 'No matching Drive or Gallery records found.';

}

async function handleTelegramWebhook(request, env, ctx) {

  const ok = () => new Response('ok', { status: 200 });

  if (!env.TELEGRAM_WEBHOOK_SECRET ||

      request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TELEGRAM_WEBHOOK_SECRET) {

    return new Response('forbidden', { status: 403 });

  }

  let update;

  try { update = await request.json(); } catch { return ok(); }

  const msg=update&&update.message;
  if(!msg||typeof msg.text!=='string'||!msg.chat)return ok();
  // Ignore webhook redeliveries so retries cannot repeat a command.
  if(env.ANNOUNCE_KV&&update.update_id!=null){
    const updateKey='telegram_update_seen:'+String(update.update_id);
    try{
      if(await env.ANNOUNCE_KV.get(updateKey))return ok();
      await env.ANNOUNCE_KV.put(updateKey,'1',{expirationTtl:86400});
    }catch(error){console.error('Telegram update dedupe storage unavailable:',error);return ok();}
  }

  if (String(msg.chat.id) !== String(env.TELEGRAM_CHAT_ID || '')) return ok();

  const command = parseTgCommand(msg.text);

  if (!command) return ok();

  // The ForYou Letter bot owns the shared group's /start menu.

  // Keep APML /start available in private chats, but never answer /start in the group.

  if (command.cmd === 'start' && msg.chat.type !== 'private') return ok();

  const allowed = String(env.TELEGRAM_ADMIN_IDS || '').split(',').map(x => x.trim()).filter(Boolean);

  const senderId = String(msg.from && msg.from.id || '');

  const reply = text => tgReply(env, msg.chat.id, msg.message_id, text);

  // Admin commands are deliberately disabled until an explicit Telegram user-ID allowlist is configured.

  // Do not reply to unknown users or when the admin allowlist is unset.
  if(!allowed.length||!allowed.includes(senderId))return ok();
  // Suppress rapid repeated admin commands instead of replying to every tap.
  if(env.ANNOUNCE_KV){
    const commandKey='telegram_command_cooldown:'+senderId;
    try{
      const last=Number(await env.ANNOUNCE_KV.get(commandKey)||0);
      if(Date.now()-last<CONFIG.TELEGRAM_COMMAND_COOLDOWN_MS)return ok();
      await env.ANNOUNCE_KV.put(commandKey,String(Date.now()),{expirationTtl:15});
    }catch(error){console.error('Telegram command cooldown storage unavailable:',error);return ok();}
  }

  try {

    await logAdminActivity(env, 'command', command.cmd + (command.rest ? ' ' + command.rest.slice(0, 80) : ''), senderId);

    if (command.cmd === 'help' || command.cmd === 'start') {

      await reply(ADMIN_HELP_TEXT);

      return ok();

    }

    if (command.cmd === 'announce' || command.cmd === 'say') {

      if (!env.ANNOUNCE_KV) {

        await reply('⚠️ Announcement storage is not configured. Bind the existing KV namespace as ANNOUNCE_KV.');

        return ok();

      }

      const parsed = parseDuration(command.rest);

      const text = tgClean(parsed.text, 1000);

      if (!text) {

        await reply('Usage:\n/announce Office closed tomorrow\n/announce 3h Portal maintenance at 6 PM');

        return ok();

      }

      if (text.length > CONFIG.ANNOUNCE_MAX_CHARS) {

        await reply('Message is too long. Maximum: ' + CONFIG.ANNOUNCE_MAX_CHARS + ' characters.');

        return ok();

      }

      const now = Date.now();

      const record = { id: now.toString(36), text, createdAt: now, expiresAt: now + Math.round(parsed.hours * 3600000) };

      await env.ANNOUNCE_KV.put('current', JSON.stringify(record), { expirationTtl: Math.max(60, Math.round(parsed.hours * 3600)) });

      await reply('📢 Announcement published for ' + leftText(record.expiresAt - now) + ':\n' + text);

      return ok();

    }

    if (command.cmd === 'cancel') {

      if (!env.ANNOUNCE_KV) { await reply('Announcement KV is not configured.'); return ok(); }

      const had = await env.ANNOUNCE_KV.get('current');

      await env.ANNOUNCE_KV.delete('current');

      await reply(had ? '✅ Live announcement cancelled.' : 'There is no live announcement.');

      return ok();

    }

    if (command.cmd === 'status') {

      const stats = await liveStatsWithDaily();

      const announcement = env.ANNOUNCE_KV ? JSON.parse((await env.ANNOUNCE_KV.get('current')) || 'null') : null;

      const maintenance = await getMaintenanceStatus(env);

      await reply(

        '🛠 APML Portal status\n' +

        'Online now: ' + (stats.online == null ? 'unavailable' : stats.online) + '\n' +

        'Announcement: ' + (announcement && announcement.expiresAt > Date.now() ? 'LIVE' : 'off') + '\n' +

        'Maintenance: ' + (maintenance.active ? 'ON' : 'off') + '\n' +

        'Daily PDF: ' + tgNum(stats.todayPdfs) + '\n' +

        'Daily media: ' + tgNum(stats.todayMedia)

      );

      return ok();

    }

    if (command.cmd === 'report') {

      await reply(await buildOverallReport());

      return ok();

    }

    if (command.cmd === 'today' || command.cmd === 'yesterday') {

      const key = command.cmd === 'today' ? getTodayIST() : addDaysToKey(getTodayIST(), -1);

      await reply(await buildSingleDayReport(key));

      return ok();

    }

    if (command.cmd === 'weekly' || command.cmd === 'monthly') {

      const days = command.cmd === 'weekly' ? 7 : 30;

      await reply(await buildPeriodReport(days, command.cmd === 'weekly' ? 'Last 7 days' : 'Last 30 days'));

      return ok();

    }

    if (command.cmd === 'topdays') {

      await reply(await buildTopDaysReport());

      return ok();

    }

    if (command.cmd === 'growth' || command.cmd === 'compare') {

      await reply(await buildGrowthReport());

      return ok();

    }

    if (command.cmd === 'downloads') {

      const st = await liveStatsWithDaily();

      await reply(

        '📥 Download totals\n' +

        'PDFs (lifetime): ' + (st.totalPdfs == null ? 'unavailable' : tgNum(st.totalPdfs)) + '\n' +

        'Media (lifetime): ' + (st.totalMedia == null ? 'unavailable' : tgNum(st.totalMedia)) + '\n' +

        'PDFs today: ' + tgNum(st.todayPdfs) + '\n' +

        'Media today: ' + tgNum(st.todayMedia)

      );

      return ok();

    }

    if (command.cmd === 'live') {

      const st = await liveStatsWithDaily();

      await reply(

        '🟢 APML live dashboard\n' +

        'Online now: ' + (st.online == null ? 'unavailable' : tgNum(st.online)) + '\n' +

        'Today visitors: ' + tgNum(st.todayVisitors) + '\n' +

        'Today PDFs: ' + tgNum(st.todayPdfs) + '\n' +

        'Today media: ' + tgNum(st.todayMedia) + '\n' +

        'Lifetime PDFs: ' + (st.totalPdfs == null ? 'unavailable' : tgNum(st.totalPdfs)) + '\n' +

        'Lifetime media: ' + (st.totalMedia == null ? 'unavailable' : tgNum(st.totalMedia)) + '\n' +

        tgTime()

      );

      return ok();

    }

    if (command.cmd === 'health') {

      await reply(await buildHealthReport(env));

      return ok();

    }

    if (command.cmd === 'uptime') {

      await reply('✅ Cloudflare Worker is responding.\nCloudflare does not expose a reliable per-deployment uptime counter to this Worker. Use /health for dependency checks.');

      return ok();

    }

    if (command.cmd === 'activity') {

      await reply(await buildActivityReport(env));

      return ok();

    }

    if (command.cmd === 'errors') {

      await reply(await buildErrorReport(env));

      return ok();

    }

    if (command.cmd === 'inbox' || command.cmd === 'notifications') {

      if (!env.ANNOUNCE_KV) { await reply('Notification KV is not configured.'); return ok(); }

      const items = JSON.parse((await env.ANNOUNCE_KV.get(ADMIN_NOTIFICATIONS_KEY)) || '[]').slice(0, 12);

      await reply('🔔 APML notification inbox\n\n' + (items.length ? items.map((item, i) => {

        const level = String(item.priority || 'normal').toUpperCase();

        const when = new Date(item.createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

        return (i + 1) + '. [' + level + '] ' + tgClean(item.title, 90) + '\n   ' + tgClean(item.message, 180) + '\n   ' + when;

      }).join('\n\n') : 'No notifications recorded.'));

      return ok();

    }

    if (command.cmd === 'files' || command.cmd === 'recent' || command.cmd === 'quotations' || command.cmd === 'storage') {

      await reply(await buildFilesReport(command.cmd));

      return ok();

    }

    if (command.cmd === 'search') {

      if (!command.rest) { await reply('Usage: /search filename or keyword'); return ok(); }

      await reply(await searchPortalFiles(command.rest));

      return ok();

    }

    if (command.cmd === 'export') {

      await sendAnalyticsCsv(env, msg.chat.id);

      await reply('📄 Analytics CSV export prepared.');

      return ok();

    }

    if (command.cmd === 'cleanup') {

      if (!env.ANNOUNCE_KV) { await reply('KV storage is required for cleanup confirmation.'); return ok(); }

      const now = Date.now();

      if (command.rest.toLowerCase() !== 'confirm') {

        await env.ANNOUNCE_KV.put('cleanup_pending', String(now), { expirationTtl: 120 });

        await reply('⚠️ This trims old quotation files beyond the configured cap. Reply /cleanup confirm within 2 minutes to proceed.');

        return ok();

      }

      const pendingAt = Number(await env.ANNOUNCE_KV.get('cleanup_pending') || 0);

      if (!pendingAt || now - pendingAt > 120000) {

        await reply('No active cleanup confirmation. Send /cleanup first.');

        return ok();

      }

      await env.ANNOUNCE_KV.delete('cleanup_pending');

      const result = await trimQuotations(env);

      await logAdminActivity(env, 'cleanup', JSON.stringify(result), senderId);

      await reply(result.error ? '❌ Cleanup failed: ' + result.error : '✅ Cleanup complete. Removed ' + (result.trimmed || 0) + ' old quotation record(s).');

      return ok();

    }

    if (command.cmd === 'maintenance') {

      if (!env.ANNOUNCE_KV) { await reply('⚠️ Bind the existing KV namespace as ANNOUNCE_KV to enable maintenance mode.'); return ok(); }

      const action = command.rest.trim().toLowerCase();

      if (action === 'on' || action.startsWith('on ')) {

        const message = tgClean(command.rest.slice(2), 240) || 'The APML Portal is temporarily unavailable while we carry out scheduled maintenance. Please try again shortly.';

        const record = { active: true, message, updatedAt: Date.now(), updatedBy: senderId };

        await env.ANNOUNCE_KV.put('maintenance', JSON.stringify(record));

        await logAdminActivity(env, 'maintenance_on', message, senderId);

        await reply('🛠 Maintenance mode is ON. The portal frontend will display the maintenance screen after its next status check.');

        return ok();

      }

      if (action === 'off') {

        await env.ANNOUNCE_KV.put('maintenance', JSON.stringify({ active: false, updatedAt: Date.now(), updatedBy: senderId }));

        await logAdminActivity(env, 'maintenance_off', '', senderId);

        await reply('✅ Maintenance mode is OFF.');

        return ok();

      }

      const state = await getMaintenanceStatus(env);

      await reply('Maintenance mode: ' + (state.active ? 'ON\n' + state.message : 'OFF') + '\nUse /maintenance on [message] or /maintenance off.');

      return ok();

    }

    if (command.cmd === 'alerts') {

      if (!env.ANNOUNCE_KV) { await reply('KV storage is required for alert preferences.'); return ok(); }

      const action = command.rest.trim().toLowerCase();

      if (action === 'on') await env.ANNOUNCE_KV.put('alerts_enabled', 'true');

      else if (action === 'off') await env.ANNOUNCE_KV.put('alerts_enabled', 'false');

      const value = (await env.ANNOUNCE_KV.get('alerts_enabled')) || 'true';

      await reply('Hourly Telegram analytics alerts: ' + (value === 'false' ? 'OFF' : 'ON') + '\nUse /alerts on or /alerts off.');

      return ok();

    }

    await reply('Unknown command. Send /help to see the APML admin commands.');

    return ok();

  } catch (err) {

    await logAdminError(env, command.cmd, err);

    await reply('❌ ' + command.cmd + ' failed: ' + String(err && err.message || err).slice(0, 500));

    return ok();

  }

}

async function handleAnnouncementRead(env) {

  const headers = { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0' };

  try {

    const cur = env.ANNOUNCE_KV ? JSON.parse((await env.ANNOUNCE_KV.get('current')) || 'null') : null;

    if (!cur || !cur.text || cur.expiresAt <= Date.now()) return new Response(JSON.stringify({ active: false }), { headers });

    return new Response(JSON.stringify({ active: true, id: cur.id, text: cur.text, expiresAt: cur.expiresAt }), { headers });

  } catch (e) {

    return new Response(JSON.stringify({ active: false }), { headers });

  }

}

async function sendHourlyAnalyticsSummary(env) {

  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;

  if (env.ANNOUNCE_KV && (await env.ANNOUNCE_KV.get('alerts_enabled')) === 'false') return;

  const stats = await liveStatsWithDaily();

  const message = '📊 <b>Hourly Portal Analytics Summary</b>\n\n' +

    '📅 <b>Today\'s Activity:</b>\n' +

    '  • 👁️ ' + tgNum(stats.todayVisitors) + ' unique visitors\n' +

    '  • 🧾 ' + tgNum(stats.todayPdfs) + ' PDFs generated\n' +

    '  • 📥 ' + tgNum(stats.todayMedia) + ' media downloaded\n\n' +

    '📈 <b>Consolidated Overall Data:</b>\n' +

    '  • 👥 ' + (stats.online ? stats.online + (stats.online === 1 ? ' person online now' : ' people online now') : 'Online: —') + '\n' +

    '  • 🧾 ' + (stats.totalPdfs !== null ? tgNum(stats.totalPdfs) + ' total PDFs' : 'Total PDFs: —') + '\n' +

    '  • 📥 ' + (stats.totalMedia !== null ? tgNum(stats.totalMedia) + ' total media' : 'Total media: —') + '\n\n' +

    '🕒 ' + tgTime();

  await tgSendMessage(env,env.TELEGRAM_CHAT_ID,{
    text:message,parse_mode:'HTML',disable_web_page_preview:true
  });

}

export default {

  async fetch(request, env, ctx) {

    if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

    // Normalize trailing slashes so /announcement and /announcement/ behave identically.
    const path = new URL(request.url).pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'GET' && path === '/dl') {

      let target;

      try { target = new URL(new URL(request.url).searchParams.get('url') || ''); }

      catch { return json({ error: 'Bad link' }, 400); }

      if (target.protocol !== 'https:' || !CONFIG.DOWNLOAD_HOSTS.includes(target.hostname)) {

        return json({ error: 'Host not allowed' }, 403);

      }

      let up;
      try {
        up = await fetch(target.href, {
          headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36' },
        });
      } catch (error) {
        return json({ error: 'Download source could not be reached', detail: String(error && error.message || error).slice(0, 180) }, 502);
      }

      if (!up.ok) return json({ error: 'Source answered ' + up.status }, 502);

      const headers = new Headers(CORS);

      headers.set('Content-Type', up.headers.get('Content-Type') || 'application/octet-stream');

      const len = up.headers.get('Content-Length');

      if (len) headers.set('Content-Length', len);

      return new Response(up.body, { status: 200, headers });

    }

    if (request.method === 'GET' && path === '/health') {
      return json({
        ok: true,
        service: 'APML Drive API',
        version: '2026-11-11-routing-hardening',
        routes: {
          announcement: true,
          maintenance: true,
          notify: true,
          telegram: true,
          download: true,
          quotationCleanup: true,
          adminNotifications: true
        },
        configuration: {
          firebase: !!CONFIG.FIREBASE_DB_URL,
          supabase: !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY),
          cloudinary: !!(env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
          telegram: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID),
          telegramWebhookSecret: !!env.TELEGRAM_WEBHOOK_SECRET,
          announcementKV: !!env.ANNOUNCE_KV
        },
        timestamp: new Date().toISOString()
      });
    }

    if (request.method === 'GET' && path === '/announcement') return await handleAnnouncementRead(env);

    if (request.method === 'GET' && path === '/maintenance') {

      const state = await getMaintenanceStatus(env);

      return new Response(JSON.stringify({

        active: !!state.active,

        message: state.message || '',

        updatedAt: state.updatedAt || null

      }), { headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

    }

    if (request.method === 'GET' && path === '/admin-notifications') return await handleAdminNotifications(request, env);

    if (request.method !== 'POST') return json({ error: 'POST only' }, 405);

    try {

      if (path === '/telegram') {

        return await handleTelegramWebhook(request, env, ctx);

      }

      if (path === '/admin-notifications') return await handleAdminNotifications(request, env);

      if (path === '/delete') {

        const admin = await getAdminEmail(request);

        if (!admin) return json({ error: 'Admin login required' }, 401);

        const { urls } = await request.json();

        const list = Array.isArray(urls) ? urls : [];

        const parsed = list.map(parseCloudinaryUrl).filter(Boolean);

        const results = parsed.length ? await cloudinaryDelete(env, parsed) : [];

        const failed = results.filter((r) => !r.ok);

        return json({

          requested: list.length,

          deleted: results.reduce((n, r) => n + r.deleted.length, 0),

          notFound: results.flatMap((r) => r.notFound),

          skipped: list.length - parsed.length,

          ok: failed.length === 0,

          error: failed.length ? failed[0].error || `HTTP ${failed[0].status}` : undefined,

        });

      }

      if (path === '/notify') {

        return await handleNotify(request, env);

      }

      if (path === '/trim-quotations') {

        return json(await trimQuotations(env));

      }

      return json({ error: 'Not found' }, 404);

    } catch (err) {

      return json({ error: err.message }, 500);

    }

  },

  async scheduled(event, env, ctx) {

    ctx.waitUntil(sendHourlyAnalyticsSummary(env));

  },

};