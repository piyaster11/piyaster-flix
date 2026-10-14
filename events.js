// Events tab: loads live events.json from the thai-coupon-dashboard repo (single source)
const EVENTS_URL='https://piyaster11.github.io/thai-coupon-dashboard/events.json';
const ECATS=["All","This week","Concerts","TCG","Exhibitions","Festivals","Openings","Food & Cafe"];
const EI={en:{title:"🎟️ Bangkok Events",sub:"Concerts, TCG card shows, exhibitions, new openings & hyped cafés — add any to your calendar",updated:"Updated ",wk:"🔥 This week",now:"Now open",soon:"Coming up",gcal:"📅 Google Calendar",ics:"⬇️ .ics (Apple/Outlook)",src:"Details ↗",until:"until ",none:"No events in this category",err:"Could not load events",foot:"Check the organiser page before going — dates can change.",cats:{}},
th:{title:"🎟️ อีเวนต์กรุงเทพฯ",sub:"คอนเสิร์ต งานการ์ดเกม นิทรรศการ ร้านเปิดใหม่ และคาเฟ่มาแรง — เพิ่มลงปฏิทินได้ทันที",updated:"อัปเดต ",wk:"🔥 สัปดาห์นี้",now:"เปิดแล้ว",soon:"เร็วๆ นี้",gcal:"📅 Google ปฏิทิน",ics:"⬇️ .ics (Apple/Outlook)",src:"รายละเอียด ↗",until:"ถึง ",none:"ไม่มีอีเวนต์ในหมวดนี้",err:"โหลดอีเวนต์ไม่สำเร็จ",foot:"โปรดตรวจสอบหน้าผู้จัดก่อนไป วันเวลาอาจเปลี่ยนแปลง",cats:{All:"ทั้งหมด","This week":"สัปดาห์นี้",Concerts:"คอนเสิร์ต",TCG:"การ์ดเกม",Exhibitions:"นิทรรศการ/โชว์",Festivals:"เทศกาล",Openings:"เปิดใหม่","Food & Cafe":"ร้านอาหาร/คาเฟ่"}}};
let ED=null,ecat='All';
const EL=()=>EI[dlang],etr=(o,k)=>dlang=='th'&&o[k+'_th']?o[k+'_th']:o[k],ecn=c=>EL().cats[c]||c;
const eD=s=>s.length==10?new Date(s+'T00:00:00+07:00'):new Date(s);
const eEnd=e=>e.allDay?new Date(eD(e.end||e.start).getTime()+864e5):eD(e.end||e.start);
const ewk=(e,now)=>eD(e.start)<new Date(now.getTime()+7*864e5)&&eEnd(e)>now&&!e.ongoing;
function efmt(e){const o={timeZone:'Asia/Bangkok'},loc=dlang=='th'?'th-TH':'en-GB',d=x=>eD(x).toLocaleDateString(loc,{...o,weekday:'short',day:'numeric',month:'short',year:'numeric'}),t=x=>eD(x).toLocaleTimeString(loc,{...o,hour:'2-digit',minute:'2-digit'});
 if(e.ongoing)return (eD(e.start)<=new Date()?EL().now:d(e.start));
 let s=d(e.start);if(!e.allDay)s+=' · '+t(e.start)+(e.end?'–'+t(e.end):'');else if(e.end&&e.end!=e.start)s+=' – '+d(e.end);return s}
const ez=x=>x.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
const eday=x=>new Date(x.getTime()+7*36e5).toISOString().slice(0,10).replace(/-/g,'');
function edates(e){if(e.allDay)return[eday(eD(e.start)),eday(eEnd(e))];return[ez(eD(e.start)),ez(eD(e.end||e.start))]}
function egcal(e){const[a,b]=edates(e),loc=etr(e,'venue');return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(etr(e,'title'))+'&dates='+a+'/'+b+'&ctz=Asia/Bangkok&details='+encodeURIComponent(etr(e,'desc')+'\n'+e.url)+'&location='+encodeURIComponent(loc)}
function eics(e){const[a,b]=edates(e),x=s=>String(s).replace(/([,;\\])/g,'\\$1').replace(/\n/g,'\\n'),dt=e.allDay?';VALUE=DATE':'';
 const s=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Piyaster Flix//Bangkok Events//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+e.id+'@piyaster-flix','DTSTAMP:'+ez(new Date()),'DTSTART'+dt+':'+a,'DTEND'+dt+':'+b,'SUMMARY:'+x(etr(e,'title')),'LOCATION:'+x(etr(e,'venue')),'DESCRIPTION:'+x(etr(e,'desc')+'\n'+e.url),'URL:'+e.url,'END:VEVENT','END:VCALENDAR'].join('\r\n');
 const u=URL.createObjectURL(new Blob([s],{type:'text/calendar;charset=utf-8'})),l=document.createElement('a');l.href=u;l.download=e.id+'.ics';document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
function ecard(e,now){const wk=ewk(e,now);
 return `<article class="dcard${wk?' soon':''}"><div class="dtop"><span class="dchip" style="background:#e50914">${esc(ecn(e.category))}</span><span class="dcat">📍 ${esc(e.area||'')}</span>${wk?`<span class="dsoon">${EL().wk}</span>`:''}${e.ongoing?`<span class="dsoon" style="background:#16a34a">${EL().now}</span>`:''}</div>
<h3>${esc(etr(e,'title'))}</h3><div class="dmeta"><span>📅 ${esc(efmt(e))}</span></div><div class="dmeta"><span>🏛️ ${esc(etr(e,'venue'))}</span><span>🎫 ${esc(e.price||'')}</span></div>
<p class="dwhy">${esc(etr(e,'desc'))}</p><div class="ecal"><a class="dcp" href="${esc(egcal(e))}" target="_blank" rel="noopener">${EL().gcal}</a><button class="dcp eics" data-id="${esc(e.id)}">${EL().ics}</button></div><a class="dsrc" href="${esc(e.url)}" target="_blank" rel="noopener">${EL().src}</a></article>`}
function events(add,links){
 const wrap=document.createElement('div');add(wrap);
 const draw=()=>{if(!ED){wrap.innerHTML='<p class="empty">Loading… · กำลังโหลด</p>';return}
  const now=new Date(),L=ED.events.filter(e=>eEnd(e)>now).sort((a,b)=>a.start<b.start?-1:1),up=L.filter(e=>!e.ongoing),nx=up[0];
  hero({tag:EL().title,title:nx?etr(nx,'title'):'',meta:nx?efmt(nx)+' · '+etr(nx,'venue'):'',text:1,bg:'linear-gradient(135deg,#0b1d3a,#1e3a8a 55%,#e50914)',
   extra:`<div class="phrase">${esc(EL().sub)}<br><span class="ex">${esc(EL().updated+dfmt(ED.updated))}</span><div class="dlang"><button data-l="th" class="${dlang=='th'?'on':''}">TH</button><button data-l="en" class="${dlang=='en'?'on':''}">EN</button></div></div>`});
  document.querySelectorAll('.dlang button').forEach(b=>b.onclick=()=>{dlang=b.dataset.l;localStorage.setItem('lang',dlang);draw()});
  const f=L.filter(e=>ecat=='All'||(ecat=='This week'?ewk(e,now):e.category==ecat));
  let h=`<div class="pbar"><div class="chips">${ECATS.map(c=>`<button data-c="${c}" class="${c==ecat?'on':''}">${esc(ecn(c))}</button>`).join('')}</div></div>`;
  const sec=(id,name,A)=>A.length?`<section class="row" id="${id}"><h2>${esc(name)}<small>${A.length}</small></h2><div class="dgrid">${A.map(e=>ecard(e,now)).join('')}</div></section>`:'';
  const s=sec('events-soon',EL().soon,f.filter(e=>!e.ongoing))+sec('events-now',EL().now,f.filter(e=>e.ongoing));
  h+=s||`<p class="empty">${esc(EL().none)}</p>`;h+=`<p class="empty">${esc(EL().foot)}</p>`;wrap.innerHTML=h;
  wrap.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{ecat=b.dataset.c;draw()});
  wrap.querySelectorAll('.eics').forEach(b=>b.onclick=()=>eics(ED.events.find(e=>e.id==b.dataset.id)));
 };
 links.push(['events-soon','Coming up'],['events-now','Now open']);
 draw();
 if(!ED)fetch(EVENTS_URL+'?'+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(j=>{ED=j;if(location.hash.slice(1)==='events')draw()}).catch(()=>{wrap.innerHTML=`<p class="empty">${esc(EL().err)}</p>`});
}
