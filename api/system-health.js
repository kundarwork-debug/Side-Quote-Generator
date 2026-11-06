const DB = "https://apml-portal-default-rtdb.firebaseio.com";

function respond(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return respond(res, 405, { ok: false, error: "Method not allowed" });
  }

  const host = String(req.headers.host || "").split(":")[0].toLowerCase();
  if (host !== "apmlportal.vercel.app" && !host.endsWith(".vercel.app")) {
    return respond(res, 403, { ok: false, error: "Host not allowed" });
  }

  const checks = [];
  const started = Date.now();
  checks.push({ id: "api", name: "Vercel API", status: "operational", latencyMs: 0 });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  const dbStarted = Date.now();
  try {
    const response = await fetch(DB + "/analytics/daily_logs.json?shallow=true", {
      method: "GET",
      headers: { "Accept": "application/json" },
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) throw new Error("Database returned HTTP " + response.status);
    await response.text();
    checks.push({
      id: "firebase",
      name: "Firebase Realtime Database",
      status: "operational",
      latencyMs: Date.now() - dbStarted
    });
  } catch (_) {
    checks.push({
      id: "firebase",
      name: "Firebase Realtime Database",
      status: "degraded",
      latencyMs: Date.now() - dbStarted,
      message: "Database read check failed or was blocked by its security rules."
    });
  } finally {
    clearTimeout(timeout);
  }

  const degraded = checks.some(item => item.status !== "operational");
  checks[0].latencyMs = Date.now() - started;
  return respond(res, 200, {
    ok: true,
    overall: degraded ? "degraded" : "operational",
    checkedAt: Date.now(),
    checks
  });
};
