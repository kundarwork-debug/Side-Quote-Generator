const DB = "https://apml-portal-default-rtdb.firebaseio.com";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}
function safeText(value, max) {
  return String(value || "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, max);
}
function maskIp(value) {
  const ip = String(value || "").split(",")[0].trim();
  if (!ip) return "unavailable";
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length !== 4 || parts.some(p => !/^\d{1,3}$/.test(p) || Number(p) > 255)) return "unavailable";
    return parts.slice(0, 3).join(".") + ".0";
  }
  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return parts.slice(0, 3).join(":") + "::/48";
  }
  return "unavailable";
}
function classifyDevice(ua) {
  const s = String(ua || "");
  const browser = /Edg\//.test(s) ? "Edge" : /OPR\//.test(s) ? "Opera" : /SamsungBrowser\//.test(s) ? "Samsung Internet" : /Firefox\//.test(s) ? "Firefox" : /CriOS\//.test(s) ? "Chrome (iOS)" : /Chrome\//.test(s) ? "Chrome" : /Safari\//.test(s) ? "Safari" : "Other";
  const os = /Android/.test(s) ? "Android" : /iPhone|iPad|iPod/.test(s) ? "iOS" : /Windows/.test(s) ? "Windows" : /Mac OS/.test(s) ? "macOS" : /Linux/.test(s) ? "Linux" : "Other";
  const device = /iPad|Tablet/.test(s) || (/Android/.test(s) && !/Mobile/.test(s)) ? "Tablet" : /Mobile|iPhone|Android/.test(s) ? "Mobile" : "Desktop";
  return { browser, os, device };
}
function pageKey(path) {
  return Buffer.from(path).toString("base64").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 90) || "home";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method not allowed" });
  const origin = req.headers.origin;
  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  if (origin) {
    try {
      if (new URL(origin).host.toLowerCase() !== String(req.headers.host || "").toLowerCase()) {
        return json(res, 403, { ok: false, error: "Origin not allowed" });
      }
    } catch (_) { return json(res, 403, { ok: false, error: "Origin not allowed" }); }
  }
  if (host !== "apmlportal.vercel.app" && !host.endsWith(".vercel.app")) {
    return json(res, 403, { ok: false, error: "Host not allowed" });
  }

  let body;
  try {
    if (typeof req.body === "string") body = JSON.parse(req.body);
    else if (req.body && typeof req.body === "object") body = req.body;
    else body = {};
  } catch (_) { return json(res, 400, { ok: false, error: "Invalid JSON" }); }

  const sessionId = safeText(body.sessionId, 80);
  const visitorId = safeText(body.visitorId, 80);
  const action = safeText(body.action, 24);
  if (!/^[a-zA-Z0-9_-]{12,80}$/.test(sessionId) || !/^[a-zA-Z0-9_-]{12,80}$/.test(visitorId)) {
    return json(res, 400, { ok: false, error: "Invalid visitor identifiers" });
  }
  if (!["start", "pageview", "heartbeat", "page_time", "performance"].includes(action)) {
    return json(res, 400, { ok: false, error: "Invalid action" });
  }

  const now = Date.now();
  const page = safeText(body.page, 180) || "/";
  const title = safeText(body.title, 120);
  let referrer = "";
  try { referrer = new URL(safeText(body.referrer, 500)).origin; } catch (_) {}
  const delta = Math.max(0, Math.min(45, Number(body.seconds) || 0));
  const ua = safeText(req.headers["user-agent"], 500);
  const device = classifyDevice(ua);
  const forwarded = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  const maskedIp = maskIp(forwarded);
  const city = safeText(req.headers["x-vercel-ip-city"], 80) || "Unknown";
  const region = safeText(req.headers["x-vercel-ip-country-region"], 80);
  const country = safeText(req.headers["x-vercel-ip-country"], 8) || "Unknown";

  const base = {
    visitorId, sessionId, lastSeen: now, lastPage: page,
    device: device.device, browser: device.browser, os: device.os,
    city, region, country, maskedIp, referrer: referrer || undefined
  };
  const sessionUrl = DB + "/analytics/visitor_sessions/" + encodeURIComponent(sessionId) + ".json";
  try {
    const currentResponse = await fetch(sessionUrl);
    if (!currentResponse.ok) throw new Error("Could not read visitor session");
    const current = await currentResponse.json() || {};
    const next = { ...current, ...base };
    if (action === "start" && !current.startedAt) {
      next.startedAt = now;
      next.firstPage = page;
      next.firstTitle = title;
      next.pageViews = 0;
      next.totalSeconds = 0;
      next.pages = {};
    }
    if (action === "pageview") {
      next.pageViews = (Number(current.pageViews) || 0) + 1;
      next.pages = current.pages || {};
      const key = pageKey(page);
      const previous = next.pages[key] || {};
      next.pages[key] = { path: page, title, views: (Number(previous.views) || 0) + 1, seconds: Number(previous.seconds) || 0, lastSeen: now };
      next.journey = Array.isArray(current.journey) ? current.journey.slice(-29) : [];
      next.journey.push({ path: page, title, at: now });
    }
    if (action === "heartbeat" || action === "page_time") {
      next.totalSeconds = (Number(current.totalSeconds) || 0) + delta;
      next.pages = current.pages || {};
      const key = pageKey(page);
      const previous = next.pages[key] || { path: page, title, views: 0, seconds: 0 };
      next.pages[key] = { ...previous, path: page, title, seconds: (Number(previous.seconds) || 0) + delta, lastSeen: now };
    }
    if (action === "performance") {
      const loadMs = Math.round(Number(body.loadMs));
      const domMs = Math.round(Number(body.domMs));
      const ttfbMs = Math.round(Number(body.ttfbMs));
      if (![loadMs, domMs, ttfbMs].every(Number.isFinite) ||
          loadMs < 0 || loadMs > 120000 || domMs < 0 || domMs > 120000 ||
          ttfbMs < 0 || ttfbMs > 60000) {
        return json(res, 400, { ok: false, error: "Invalid performance measurements" });
      }
      const navType = ["navigate", "reload", "back_forward", "prerender"].includes(body.navType) ? body.navType : "other";
      next.performance = Array.isArray(current.performance) ? current.performance.slice(-29) : [];
      next.performance.push({
        path: page, loadMs, domMs, ttfbMs, navType,
        serviceWorkerControlled: body.serviceWorkerControlled === true,
        measuredAt: now
      });
    }
    if (!next.startedAt) next.startedAt = now;
    const save = await fetch(sessionUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next)
    });
    if (!save.ok) throw new Error("Database write failed");
    return json(res, 200, { ok: true });
  } catch (error) {
    return json(res, 502, { ok: false, error: "Visitor analytics storage unavailable" });
  }
}
