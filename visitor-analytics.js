/* Visitor intelligence panel for APML Analytics. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const fmt = n => new Intl.NumberFormat("en-IN").format(Number(n) || 0);
  const duration = n => {
    n = Math.max(0, Number(n) || 0);
    if (n < 60) return Math.round(n) + "s";
    const m = Math.floor(n / 60), s = Math.round(n % 60);
    return m + "m " + s + "s";
  };
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  function render() {
    if (typeof firebase === "undefined" || !firebase.apps.length) return;
    const db = firebase.database();
    db.ref("analytics/visitor_sessions").limitToLast(500).on("value", snap => {
      const sessions = Object.values(snap.val() || {}).filter(x => x && x.startedAt);
      const now = Date.now();
      const active = sessions.filter(x => now - Number(x.lastSeen || 0) < 60000);
      const returning = new Set(sessions.map(x => x.visitorId)).size;
      const totalSeconds = sessions.reduce((sum, x) => sum + (Number(x.totalSeconds) || 0), 0);
      const avg = sessions.length ? totalSeconds / sessions.length : 0;
      $("viSessions").textContent = fmt(sessions.length);
      $("viActive").textContent = fmt(active.length);
      $("viReturning").textContent = fmt(returning);
      $("viAvgTime").textContent = duration(avg);
      const cities = {}, devices = {}, pages = {};
      sessions.forEach(s => {
        const city = [s.city, s.region, s.country].filter(Boolean).join(", ") || "Unknown";
        cities[city] = (cities[city] || 0) + 1;
        const d = [s.device, s.os, s.browser].filter(Boolean).join(" · ") || "Unknown";
        devices[d] = (devices[d] || 0) + 1;
        Object.values(s.pages || {}).forEach(p => {
          const key = p.path || "/";
          if (!pages[key]) pages[key] = { views: 0, seconds: 0 };
          pages[key].views += Number(p.views) || 0;
          pages[key].seconds += Number(p.seconds) || 0;
        });
      });
      const list = obj => Object.entries(obj).sort((a,b) => b[1]-a[1]).slice(0,8);
      $("viCities").innerHTML = list(cities).map(([k,v]) => '<li><span>'+esc(k)+'</span><b>'+fmt(v)+'</b></li>').join("") || '<li class="vi-empty">No visitor data yet</li>';
      $("viDevices").innerHTML = list(devices).map(([k,v]) => '<li><span>'+esc(k)+'</span><b>'+fmt(v)+'</b></li>').join("") || '<li class="vi-empty">No visitor data yet</li>';
      $("viPages").innerHTML = Object.entries(pages).sort((a,b)=>b[1].views-a[1].views).slice(0,10).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+fmt(v.views)+'</td><td>'+duration(v.seconds)+'</td></tr>').join("") || '<tr><td colspan="3">No page activity yet</td></tr>';
      $("viVisitors").innerHTML = sessions.sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0)).slice(0,100).map(s => {
        const place = [s.city,s.region,s.country].filter(Boolean).join(", ") || "Unknown";
        const pages = Object.values(s.pages || {}).map(p=>p.path).filter(Boolean).slice(0,4).join(" → ");
        return '<tr><td>'+new Date(s.startedAt).toLocaleString("en-IN")+'</td><td>'+esc(place)+'</td><td>'+esc(s.maskedIp || "—")+'</td><td>'+esc([s.device,s.os].filter(Boolean).join(" / "))+'</td><td>'+duration(s.totalSeconds)+'</td><td>'+fmt(s.pageViews)+'</td><td>'+esc(pages || s.firstPage || "—")+'</td></tr>';
      }).join("") || '<tr><td colspan="7">No visitor sessions yet. New sessions appear after visitors allow analytics.</td></tr>';
      $("viUpdated").textContent = "Live · updated " + new Date().toLocaleTimeString("en-IN");
      $("viExport").onclick = () => {
        const rows = [["Started","City","Masked IP","Device","OS","Browser","Duration seconds","Page views","Pages"]];
        sessions.forEach(s => rows.push([new Date(s.startedAt).toISOString(),[s.city,s.region,s.country].filter(Boolean).join(", "),s.maskedIp,s.device,s.os,s.browser,s.totalSeconds,s.pageViews,Object.values(s.pages||{}).map(p=>p.path).join(" | ")]));
        const csv = rows.map(row=>row.map(v=>{const x=String(v==null?"":v);return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}).join(",")).join("\r\n");
        const url = URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
        const a=document.createElement("a");a.href=url;a.download="apml-visitor-intelligence.csv";a.click();URL.revokeObjectURL(url);
      };
    }, err => { $("viUpdated").textContent = "Visitor data unavailable: " + (err.code || "database access denied"); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render, {once:true});
  else render();
})();
