/* APML Visitor Intelligence — aggregated, consent-based reporting. */
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
  const rangeSelect = $("viRange");
  let allSessions = [], chart = null, filtered = [];
  const withinRange = (s, range, now) => {
    if (range === "all") return true;
    const days = Number(range) || 7;
    return Number(s.startedAt) >= now - days * 86400000;
  };
  const toDay = timestamp => new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date(timestamp));
  const hourLabel = h => String(h).padStart(2,"0") + ":00";
  function chartDaily(sessions) {
    const counts = {};
    sessions.forEach(s => { const k=toDay(s.startedAt); counts[k]=(counts[k]||0)+1; });
    const keys = Object.keys(counts).sort();
    const labels = keys.map(k => new Date(k+"T00:00:00+05:30").toLocaleDateString("en-IN",{day:"numeric",month:"short"}));
    const values = keys.map(k => counts[k]);
    const el = $("viDailyChart");
    if (!el || !window.ApexCharts) return;
    const options = {
      chart:{type:"area",height:230,toolbar:{show:false},fontFamily:"inherit",animations:{enabled:true}},
      series:[{name:"Sessions",data:values}],
      xaxis:{categories:labels,labels:{style:{colors:"var(--text-muted)"}}},
      yaxis:{min:0,forceNiceScale:true,labels:{formatter:v=>Math.round(v)}},
      dataLabels:{enabled:false},stroke:{curve:"smooth",width:2},
      fill:{type:"gradient",gradient:{opacityFrom:.28,opacityTo:.03}},
      colors:["#b91c1c"],grid:{borderColor:"var(--surface-border)",strokeDashArray:4},
      tooltip:{y:{formatter:v=>fmt(v)+" sessions"}},noData:{text:"No sessions in this period"}
    };
    if (!chart) { chart = new ApexCharts(el,options); chart.render(); }
    else chart.updateOptions(options,true,true);
  }
  function render() {
    const now=Date.now(), range=rangeSelect ? rangeSelect.value : "7";
    filtered=allSessions.filter(s=>s && s.startedAt && withinRange(s,range,now));
    const active=filtered.filter(s=>now-Number(s.lastSeen||0)<60000);
    const visitorCounts={};
    filtered.forEach(s=>{ if(s.visitorId) visitorCounts[s.visitorId]=(visitorCounts[s.visitorId]||0)+1; });
    const returning=Object.values(visitorCounts).filter(n=>n>1).length;
    const unique=Object.keys(visitorCounts).length;
    const totalSeconds=filtered.reduce((sum,s)=>sum+(Number(s.totalSeconds)||0),0);
    $("viSessions").textContent=fmt(filtered.length);
    $("viActive").textContent=fmt(active.length);
    $("viReturning").textContent=fmt(returning);
    $("viAvgTime").textContent=duration(filtered.length?totalSeconds/filtered.length:0);
    if($("viUnique")) $("viUnique").textContent=fmt(unique);

    const cities={},devices={},pages={},hours=Array(24).fill(0),days={};
    filtered.forEach(s=>{
      const city=[s.city,s.region,s.country].filter(Boolean).join(", ")||"Unknown";
      cities[city]=(cities[city]||0)+1;
      const d=[s.device,s.os,s.browser].filter(Boolean).join(" · ")||"Unknown";
      devices[d]=(devices[d]||0)+1;
      const h=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hourCycle:"h23"}).format(new Date(Number(s.startedAt)))); hours[h]++;
      const day=toDay(s.startedAt); days[day]=(days[day]||0)+1;
      Object.values(s.pages||{}).forEach(p=>{
        const key=p.path||"/";
        if(!pages[key]) pages[key]={views:0,seconds:0};
        pages[key].views+=Number(p.views)||0; pages[key].seconds+=Number(p.seconds)||0;
      });
    });
    const list=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,8);
    $("viCities").innerHTML=list(cities).map(([k,v])=>'<li><span>'+esc(k)+'</span><b>'+fmt(v)+'</b></li>').join("")||'<li class="vi-empty">No visitor data yet</li>';
    $("viDevices").innerHTML=list(devices).map(([k,v])=>'<li><span>'+esc(k)+'</span><b>'+fmt(v)+'</b></li>').join("")||'<li class="vi-empty">No visitor data yet</li>';
    $("viPages").innerHTML=Object.entries(pages).sort((a,b)=>b[1].views-a[1].views).slice(0,10).map(([k,v])=>'<tr><td>'+esc(k)+'</td><td>'+fmt(v.views)+'</td><td>'+duration(v.seconds)+'</td></tr>').join("")||'<tr><td colspan="3">No page activity in this period</td></tr>';
    const peak=Math.max(0,...hours), peakHours=hours.map((v,i)=>({h:i,v})).filter(x=>x.v===peak&&peak>0).map(x=>hourLabel(x.h));
    $("viPeakHours").innerHTML=hours.map((v,h)=>({v,h})).sort((a,b)=>b.v-a.v).slice(0,6).filter(x=>x.v>0).map(x=>'<li><span>'+hourLabel(x.h)+'</span><b>'+fmt(x.v)+'</b></li>').join("")||'<li class="vi-empty">Not enough data yet</li>';
    $("viPeakSummary").textContent=peakHours.length?"Busiest start time: "+peakHours.join(", "):"No sessions in this period";
    chartDaily(filtered);

    const recent=filtered.slice().sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0)).slice(0,100);
    $("viVisitors").innerHTML=recent.map(s=>{
      const place=[s.city,s.region,s.country].filter(Boolean).join(", ")||"Unknown";
      const journey=Array.isArray(s.journey)&&s.journey.length?s.journey.map(x=>x.path).join(" → "):Object.values(s.pages||{}).sort((a,b)=>(a.lastSeen||0)-(b.lastSeen||0)).map(p=>p.path).filter(Boolean).join(" → ");
      return '<tr><td>'+new Date(s.startedAt).toLocaleString("en-IN")+'</td><td>'+esc(place)+'</td><td>'+esc(s.maskedIp||"—")+'</td><td>'+esc([s.device,s.os].filter(Boolean).join(" / "))+'</td><td>'+duration(s.totalSeconds)+'</td><td>'+fmt(s.pageViews)+'</td><td>'+esc(journey||s.firstPage||"—")+'</td></tr>';
    }).join("")||'<tr><td colspan="7">No sessions in this period. New sessions appear after visitors allow analytics.</td></tr>';
    const topDay=Object.entries(days).sort((a,b)=>b[1]-a[1])[0];
    $("viPeakDay").textContent=topDay?new Date(topDay[0]+"T00:00:00+05:30").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})+" · "+fmt(topDay[1]):"—";
    $("viUpdated").textContent="Live · updated "+new Date().toLocaleTimeString("en-IN");
  }
  function exportCsv(){
    const rows=[["Started","City","Masked IP","Device","OS","Browser","Duration seconds","Page views","Journey"]];
    filtered.forEach(s=>rows.push([new Date(s.startedAt).toISOString(),[s.city,s.region,s.country].filter(Boolean).join(", "),s.maskedIp,s.device,s.os,s.browser,s.totalSeconds,s.pageViews,(s.journey||[]).map(p=>p.path).join(" | ")]));
    const csv=rows.map(row=>row.map(v=>{const x=String(v==null?"":v);return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="apml-visitor-intelligence.csv";a.click();URL.revokeObjectURL(url);
  }
  function init(){
    if(typeof firebase==="undefined"||!firebase.apps.length){$("viUpdated").textContent="Firebase is not initialized";return;}
    firebase.database().ref("analytics/visitor_sessions").limitToLast(500).on("value",snap=>{
      allSessions=Object.values(snap.val()||{}).filter(x=>x&&x.startedAt);
      render();
    },err=>{$("viUpdated").textContent="Visitor data unavailable: "+(err.code||"database access denied");});
    if(rangeSelect) rangeSelect.addEventListener("change",render);
    $("viExport").addEventListener("click",exportCsv);
    window.setInterval(()=>{if(allSessions.length)render();},15000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();