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
  const sessionsById = new Map();
  let renderTimer = null;
  function scheduleRender() {
    if (renderTimer) clearTimeout(renderTimer);
    renderTimer = setTimeout(function () { renderTimer = null; render(); }, 250);
  }
  function updateActiveCount() {
    const now = Date.now();
    const active = filtered.reduce((count, session) => count + (now - Number(session.lastSeen || 0) < 60000 ? 1 : 0), 0);
    const activeNode = $("viActive");
    if (activeNode) activeNode.textContent = fmt(active);
  }
  const withinRange = (s, range, now) => {
    if (range === "all") return true;
    const days = Number(range) || 7;
    return Number(s.startedAt) >= now - days * 86400000;
  };
  const dayFormatter = new Intl.DateTimeFormat("en-CA", {timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"});
  const hourFormatter = new Intl.DateTimeFormat("en-GB", {timeZone:"Asia/Kolkata",hour:"2-digit",hourCycle:"h23"});
  const toDay = timestamp => dayFormatter.format(new Date(timestamp));
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
      chart:{type:"area",height:230,toolbar:{show:false},fontFamily:"inherit",animations:{enabled:!window.matchMedia("(prefers-reduced-motion: reduce)").matches}},
      series:[{name:"Sessions",data:values}],
      xaxis:{categories:labels,labels:{style:{colors:"var(--text-muted)"}}},
      yaxis:{min:0,forceNiceScale:true,labels:{formatter:v=>Math.round(v)}},
      dataLabels:{enabled:false},stroke:{curve:"smooth",width:2},
      fill:{type:"gradient",gradient:{opacityFrom:.28,opacityTo:.03}},
      colors:["#b91c1c"],grid:{borderColor:"var(--surface-border)",strokeDashArray:4},
      tooltip:{y:{formatter:v=>fmt(v)+" sessions"}},noData:{text:"No sessions in this period"}
    };
    if (!chart) { chart = new ApexCharts(el,options); chart.render(); }
    else chart.updateOptions(options,false,false);
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
    if($("viNew")) $("viNew").textContent=fmt(Math.max(0,unique-returning));

    const cities={},devices={},pages={},hours=Array(24).fill(0),days={};
    filtered.forEach(s=>{
      const city=[s.city,s.region,s.country].filter(Boolean).join(", ")||"Unknown";
      cities[city]=(cities[city]||0)+1;
      const d=[s.device,s.os,s.browser].filter(Boolean).join(" · ")||"Unknown";
      devices[d]=(devices[d]||0)+1;
      const h=Number(hourFormatter.format(new Date(Number(s.startedAt)))); hours[h]++;
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

    const profiles={};
    filtered.forEach(s=>{
      if(!s.visitorId) return;
      const id=s.visitorId;
      if(!profiles[id]) profiles[id]={id,sessions:0,firstAt:Number(s.startedAt)||0,lastSeen:0,totalSeconds:0,pageViews:0,pages:{},city:s.city,region:s.region,country:s.country,device:s.device,os:s.os,browser:s.browser};
      const p=profiles[id];
      p.sessions++;
      p.firstAt=Math.min(p.firstAt,Number(s.startedAt)||p.firstAt);
      p.lastSeen=Math.max(p.lastSeen,Number(s.lastSeen)||0);
      p.totalSeconds+=Number(s.totalSeconds)||0;
      p.pageViews+=Number(s.pageViews)||0;
      p.city=s.city||p.city; p.region=s.region||p.region; p.country=s.country||p.country;
      p.device=s.device||p.device; p.os=s.os||p.os; p.browser=s.browser||p.browser;
      Object.values(s.pages||{}).forEach(page=>{
        const key=page.path||"/";
        p.pages[key]=(p.pages[key]||0)+(Number(page.views)||0);
      });
    });
    const browserRows=Object.values(profiles).sort((a,b)=>b.sessions-a.sessions||b.lastSeen-a.lastSeen).slice(0,50);
    $("viBrowserVisitors").innerHTML=browserRows.map(p=>{
      const place=[p.city,p.region,p.country].filter(Boolean).join(", ")||"Unknown";
      const topPage=Object.entries(p.pages).sort((a,b)=>b[1]-a[1])[0];
      const shortId=String(p.id).slice(-8).toUpperCase();
      return '<tr><td><strong>Visitor · '+esc(shortId)+'</strong></td><td>'+fmt(p.sessions)+'</td><td>'+new Date(p.firstAt).toLocaleDateString("en-IN")+'</td><td>'+new Date(p.lastSeen).toLocaleString("en-IN")+'</td><td>'+esc([p.device,p.os,p.browser].filter(Boolean).join(" / ")||"Unknown")+'</td><td>'+esc(place)+'</td><td>'+fmt(p.pageViews)+'</td><td>'+esc(topPage?topPage[0]+' ('+topPage[1]+')':'—')+'</td></tr>';
    }).join("")||'<tr><td colspan="8">No browser profiles in this period. New profiles appear after visitors allow analytics.</td></tr>';

    // Journey analysis: last recorded page is a proxy, not a confirmed exit event.
    const lastPageOf = session => {
      if(Array.isArray(session.journey) && session.journey.length) {
        const last=session.journey[session.journey.length-1];
        if(last && last.path) return last.path;
      }
      const pages=Object.values(session.pages||{}).filter(p=>p && p.path);
      pages.sort((a,b)=>(Number(b.lastSeen)||0)-(Number(a.lastSeen)||0));
      return (pages[0]&&pages[0].path)||session.lastPage||session.firstPage||"";
    };
    const dropPages={};
    filtered.forEach(session=>{
      const path=lastPageOf(session);
      if(!path) return;
      if(!dropPages[path]) dropPages[path]={sessions:0,views:0};
      dropPages[path].sessions++;
      dropPages[path].views+=Number(session.pageViews)||0;
    });
    const dropTotal=Object.values(dropPages).reduce((sum,item)=>sum+item.sessions,0);
    const dropRows=Object.entries(dropPages).sort((a,b)=>b[1].sessions-a[1].sessions).slice(0,10);
    const dropNode=$("viDropoffPages");
    if(dropNode) dropNode.innerHTML=dropRows.map(([path,item])=>'<tr><td>'+esc(path)+'</td><td>'+fmt(item.sessions)+'</td><td>'+Math.round(item.sessions/Math.max(1,dropTotal)*100)+'%</td><td>'+(item.sessions?(item.views/item.sessions).toFixed(1):"0")+'</td></tr>').join("")||'<tr><td colspan="4">Not enough journey data yet</td></tr>';

    // Compare device engagement and performance from the same consented sessions.
    const deviceStats={};
    const pageLoads={};
    filtered.forEach(session=>{
      const device=session.device||"Unknown";
      if(!deviceStats[device]) deviceStats[device]={sessions:0,seconds:0,views:0,loads:[]};
      const stat=deviceStats[device];
      stat.sessions++;
      stat.seconds+=Number(session.totalSeconds)||0;
      stat.views+=Number(session.pageViews)||0;
      (Array.isArray(session.performance)?session.performance:[]).forEach(sample=>{
        if(Number.isFinite(Number(sample.loadMs))) stat.loads.push(Number(sample.loadMs));
        const path=String(sample.path||"/");
        if(!pageLoads[path]) pageLoads[path]={total:0,count:0};
        pageLoads[path].total+=Number(sample.loadMs)||0;
        pageLoads[path].count++;
      });
    });
    const deviceRows=Object.entries(deviceStats).sort((x,y)=>y[1].sessions-x[1].sessions);
    const deviceNode=$("viDeviceCompare");
    if(deviceNode) deviceNode.innerHTML=deviceRows.map(([name,item])=>{
      const loadLabel=item.loads.length?Math.round(item.loads.reduce((sum,n)=>sum+n,0)/item.loads.length)+" ms":"—";
      return '<tr><td>'+esc(name)+'</td><td>'+fmt(item.sessions)+'</td><td>'+duration(item.sessions?item.seconds/item.sessions:0)+'</td><td>'+(item.sessions?(item.views/item.sessions).toFixed(1):"0")+'</td><td>'+loadLabel+'</td></tr>';
    }).join("")||'<tr><td colspan="5">No device comparison data yet</td></tr>';

    // Recommendations are rule-based observations from aggregate data.
    const suggestions=[];
    const topDrop=dropRows[0];
    if(topDrop && topDrop[1].sessions>=3 && topDrop[1].sessions/Math.max(1,dropTotal)>=.25) {
      suggestions.push({icon:"flag",text:"Review "+topDrop[0]+": it is the last recorded page in "+fmt(topDrop[1].sessions)+" sessions ("+Math.round(topDrop[1].sessions/Math.max(1,dropTotal)*100)+"% of sessions with a recorded journey)."});
    }
    Object.entries(pageLoads).map(([path,item])=>({path,avg:item.total/Math.max(1,item.count),count:item.count}))
      .filter(item=>item.count>=3&&item.avg>=3000).sort((x,y)=>y.avg-x.avg).slice(0,2).forEach(item=>{
        suggestions.push({icon:"speed",text:"Improve loading on "+item.path+": average recorded load is "+Math.round(item.avg)+" ms across "+fmt(item.count)+" measurements."});
      });
    const mobile=deviceStats.Mobile, desktop=deviceStats.Desktop;
    if(mobile&&desktop&&mobile.sessions>=3&&desktop.sessions>=3) {
      const mobileViews=mobile.views/mobile.sessions, desktopViews=desktop.views/desktop.sessions;
      if(desktopViews>0&&mobileViews<desktopViews*.75) suggestions.push({icon:"smartphone",text:"Check the mobile experience: mobile sessions average "+mobileViews.toFixed(1)+" page views versus "+desktopViews.toFixed(1)+" on desktop."});
      else if(desktopViews>0&&mobileViews>desktopViews*1.25) suggestions.push({icon:"smartphone",text:"Mobile visitors browse more pages per session ("+mobileViews.toFixed(1)+") than desktop visitors ("+desktopViews.toFixed(1)+"). Keep mobile navigation easy to use."});
    }
    const suggestionNode=$("viSmartSuggestions");
    if(suggestionNode) suggestionNode.innerHTML=suggestions.length?suggestions.map(item=>'<li><span class="material-symbols-outlined">'+esc(item.icon)+'</span><span>'+esc(item.text)+'</span></li>').join(""):'<li class="vi-empty">Collecting enough sessions and performance samples to make useful suggestions. Insights appear automatically as data grows.</li>';

    const recent=filtered.slice().sort((a,b)=>(b.lastSeen||0)-(a.lastSeen||0)).slice(0,100);
    $("viVisitors").innerHTML=recent.map(s=>{
      const place=[s.city,s.region,s.country].filter(Boolean).join(", ")||"Unknown";
      const journey=Array.isArray(s.journey)&&s.journey.length?s.journey.map(x=>x.path).join(" → "):Object.values(s.pages||{}).sort((a,b)=>(a.lastSeen||0)-(b.lastSeen||0)).map(p=>p.path).filter(Boolean).join(" → ");
      return '<tr><td>'+new Date(s.startedAt).toLocaleString("en-IN")+'</td><td>Visitor · '+esc(String(s.visitorId||"").slice(-8).toUpperCase()||"—")+'</td><td>'+esc(place)+'</td><td>'+esc([s.device,s.os,s.browser].filter(Boolean).join(" / "))+'</td><td>'+duration(s.totalSeconds)+'</td><td>'+fmt(s.pageViews)+'</td><td>'+esc(journey||s.firstPage||"—")+'</td></tr>';
    }).join("")||'<tr><td colspan="7">No sessions in this period. New sessions appear after visitors allow analytics.</td></tr>';
    const topDay=Object.entries(days).sort((a,b)=>b[1]-a[1])[0];
    $("viPeakDay").textContent=topDay?new Date(topDay[0]+"T00:00:00+05:30").toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})+" · "+fmt(topDay[1]):"—";
    $("viUpdated").textContent="Live · updated "+new Date().toLocaleTimeString("en-IN");
  }
  function exportCsv(){
    const rows=[["Started","Anonymous visitor ID","Approximate location","Device","OS","Browser","Duration seconds","Page views","Journey"]];
    filtered.forEach(s=>rows.push([new Date(s.startedAt).toISOString(),s.visitorId,[s.city,s.region,s.country].filter(Boolean).join(", "),s.device,s.os,s.browser,s.totalSeconds,s.pageViews,(s.journey||[]).map(p=>p.path).join(" | ")]));
    const csv=rows.map(row=>row.map(v=>{const x=String(v==null?"":v);return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}).join(",")).join("\r\n");
    const url=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="apml-visitor-intelligence.csv";a.click();URL.revokeObjectURL(url);
  }
  window.__apmlVisitorExport = function () {
    return {
      reportingRange: rangeSelect ? rangeSelect.value : "30",
      loadedSessionCount: allSessions.length,
      filteredSessionCount: filtered.length,
      sessions: allSessions.map(session => JSON.parse(JSON.stringify(session))),
      filteredSessions: filtered.map(session => JSON.parse(JSON.stringify(session)))
    };
  };
  function init(){
    if(typeof firebase==="undefined"||!firebase.apps.length){$("viUpdated").textContent="Firebase is not initialized";return;}
    const sessionsRef = firebase.database().ref("analytics/visitor_sessions").limitToLast(500);
    const handleSession = snap => {
      const session = snap.val();
      if (session && session.startedAt) sessionsById.set(snap.key, session);
      else sessionsById.delete(snap.key);
      allSessions = Array.from(sessionsById.values());
      scheduleRender();
    };
    const handleRemoved = snap => {
      sessionsById.delete(snap.key);
      allSessions = Array.from(sessionsById.values());
      scheduleRender();
    };
    const handleError = err => { $("viUpdated").textContent = "Visitor data unavailable: " + (err.code || "database access denied"); };
    sessionsRef.on("child_added", handleSession, handleError);
    sessionsRef.on("child_changed", handleSession, handleError);
    sessionsRef.on("child_removed", handleRemoved, handleError);
    if(rangeSelect) rangeSelect.addEventListener("change",render);
    $("viExport").addEventListener("click",exportCsv);
    window.setInterval(()=>{if(allSessions.length && document.visibilityState === "visible") updateActiveCount();},30000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();