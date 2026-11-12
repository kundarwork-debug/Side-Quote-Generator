/* APML Portal Performance Insights — reads anonymous measurements saved only after analytics opt-in. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const fmt = n => new Intl.NumberFormat("en-IN").format(Number(n) || 0);
  const ms = n => !Number.isFinite(Number(n)) ? "—" : Number(n) >= 1000 ? (Number(n) / 1000).toFixed(2) + " s" : Math.round(Number(n)) + " ms";
  const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" });
  const dayKey = value => dayFmt.format(new Date(Number(value)));
  const range = $("perfRange");
  let samples = [], chart = null, allRows = [];
  function render() {
    const now = Date.now(), days = range && range.value !== "all" ? Number(range.value) : 0;
    const rows = allRows.filter(x => x && Number.isFinite(Number(x.loadMs)) && (!days || Number(x.measuredAt) >= now - days * 86400000));
    const values = rows.map(x => Number(x.loadMs)).sort((a,b) => a-b);
    const avg = values.length ? values.reduce((a,b)=>a+b,0) / values.length : 0;
    const p75 = values.length ? values[Math.min(values.length-1, Math.ceil(values.length*.75)-1)] : 0;
    const controlled = rows.filter(x => x.serviceWorkerControlled === true).length;
    $("perfAverage").textContent = values.length ? ms(avg) : "—";
    $("perfP75").textContent = values.length ? ms(p75) : "—";
    $("perfSamples").textContent = fmt(values.length);
    $("perfControlled").textContent = values.length ? Math.round(controlled / values.length * 100) + "%" : "—";

    const daily = {};
    rows.forEach(x => {
      const key = dayKey(x.measuredAt);
      if (!daily[key]) daily[key] = { total: 0, count: 0 };
      daily[key].total += Number(x.loadMs); daily[key].count++;
    });
    const keys = Object.keys(daily).sort();
    const labels = keys.map(k => new Date(k + "T00:00:00+05:30").toLocaleDateString("en-IN", { day: "numeric", month: "short" }));
    const series = keys.map(k => Math.round(daily[k].total / daily[k].count));
    if (window.ApexCharts && $("perfTrend")) {
      const opts = {
        chart:{type:"area",height:230,toolbar:{show:false},fontFamily:"inherit",animations:{enabled:!window.matchMedia("(prefers-reduced-motion: reduce)").matches}},
        series:[{name:"Average load time",data:series}],
        xaxis:{categories:labels,labels:{style:{colors:"var(--text-muted)"}}},
        yaxis:{min:0,forceNiceScale:true,labels:{formatter:v=>ms(v)}},
        dataLabels:{enabled:false},stroke:{curve:"smooth",width:2},
        fill:{type:"gradient",gradient:{opacityFrom:.28,opacityTo:.03}},
        colors:["#b91c1c"],grid:{borderColor:"var(--surface-border)",strokeDashArray:4},
        tooltip:{y:{formatter:v=>ms(v)}},noData:{text:"No performance measurements yet"}
      };
      if (!chart) { chart = new ApexCharts($("perfTrend"), opts); chart.render(); }
      else chart.updateOptions(opts, false, false);
    }
    const pages = {};
    rows.forEach(x => {
      const path = String(x.path || "/").slice(0, 100);
      if (!pages[path]) pages[path] = { total: 0, count: 0 };
      pages[path].total += Number(x.loadMs); pages[path].count++;
    });
    $("perfPages").innerHTML = Object.entries(pages).map(([path, v]) => ({ path, avg: v.total / v.count, count: v.count }))
      .sort((a,b) => b.avg-a.avg).slice(0,8)
      .map(x => "<tr><td>" + path.replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])) + "</td><td>" + ms(x.avg) + "</td><td>" + fmt(x.count) + "</td></tr>")
      .join("") || '<tr><td colspan="3">No measurements yet. Data appears after visitors opt in to analytics.</td></tr>';
    $("perfUpdated").textContent = rows.length ? "Updated " + new Date().toLocaleTimeString("en-IN") : "Waiting for consent-based measurements";
  }
  function init() {
    if (typeof firebase === "undefined" || !firebase.apps.length) {
      $("perfUpdated").textContent = "Firebase is not initialized"; return;
    }
    const ref = firebase.database().ref("analytics/visitor_sessions").limitToLast(500);
    ref.on("value", snap => {
      allRows = [];
      snap.forEach(child => {
        const session = child.val() || {};
        (Array.isArray(session.performance) ? session.performance : []).forEach(item => {
          if (item && Number.isFinite(Number(item.measuredAt))) allRows.push(item);
        });
      });
      render();
    }, () => { $("perfUpdated").textContent = "Performance data unavailable"; });
    if (range) range.addEventListener("change", render);
    new MutationObserver(() => render()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
