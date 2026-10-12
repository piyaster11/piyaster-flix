// Deals tab: loads live deals.json from the thai-coupon-dashboard repo (updated daily there)
const DEALS_URL='https://piyaster11.github.io/thai-coupon-dashboard/deals.json';
const COUNTER_URL='https://coupon-copy-counter.piya-deals.workers.dev';
const DCOL={"Grab":"#00b14f","Airalo":"#0a7cff","Klook":"#ff5b00","TikTok Shop":"#333","Shopee":"#ee4d2d","Lazada":"#0f146d","Central":"#b8860b","McDonald's":"#da291c","KFC":"#a3080c","Burger King":"#d62300","The Pizza Company":"#e31837","Swensen's":"#c8102e","Sizzler":"#7a1f2b","Bonchon":"#3d1f12","Dairy Queen":"#0055a5","MK":"#c4161c","Bar B Q Plaza":"#2e7d32","After You":"#8b5e3c","Starbucks":"#00704a","Café Amazon":"#5b8c3a","Lotus's":"#00a3a6","Big C":"#e2001a","Makro":"#e30613","Tops":"#e4002b","Gourmet Market":"#2b2b2b","Villa":"#1b5e20","7-Eleven":"#f58220","CardX":"#6d28d9","SCB":"#4e2a84","POINTX":"#8b5cf6","KTC":"#e60012","Agoda":"#5b2c83","Trip.com":"#287dfa","Thai Lion Air":"#e2231a","Hark":"#334155","Repaint":"#db2777","LINE MAN":"#06c755","Claude":"#d97757","OpenCode":"#1f2937","Watsons":"#00a19a","Robinhood":"#7b2cbf","Synthesia":"#3b2fc9","AiPASS":"#0b4ea2","Thai Airways":"#5c2d91"};
const DCATS=["All","Food","Restaurants","Supermarkets","Shopping","Rides","Travel","AI Tools","Card Perks"];
const DI={en:{title:"🇹🇭 Bangkok Daily Deals",sub:"Today's best promo codes for food, rides, shopping, travel & AI tools — tap to copy",updated:"Updated ",top10:"Today's Top 10",more:"More picks",copy:"Copy",copied:"Copied!",tally:n=>"📋 "+n.toLocaleString("en-US")+(n==1?" copy":" copies"),times:n=>"Copied "+n+(n==1?" time":" times"),nocode:"No code",soon:"⏰ Expires soon",min:"Min",until:"Until ",noend:"No end date listed",src:"Source ↗",foot:"Updated daily ~8am Bangkok time · Always check terms in the app",err:"Could not load deals",left:n=>n==0?"Ends today":n==1?"1 day left":n+" days left",cats:{}},
th:{title:"🇹🇭 ดีลเด็ดกรุงเทพฯ ประจำวัน",sub:"รวมโค้ดส่วนลดอาหาร เดินทาง ช็อปปิ้ง ท่องเที่ยว และ AI ที่ใช้ได้วันนี้ — แตะเพื่อคัดลอก",updated:"อัปเดต ",top10:"ท็อป 10 วันนี้",more:"ดีลเพิ่มเติม",copy:"คัดลอก",copied:"คัดลอกแล้ว!",tally:n=>"📋 คัดลอกแล้ว "+n.toLocaleString("en-US")+" ครั้ง",times:n=>"คัดลอกแล้ว "+n+" ครั้ง",nocode:"ไม่มีโค้ด",soon:"⏰ ใกล้หมดเขต",min:"ขั้นต่ำ",until:"ถึง ",noend:"ไม่ระบุวันหมดเขต",src:"ที่มา ↗",foot:"อัปเดตทุกวันราว 8 โมงเช้า (เวลากรุงเทพฯ) · โปรดตรวจสอบเงื่อนไขในแอปทุกครั้ง",err:"โหลดดีลไม่สำเร็จ",left:n=>n==0?"หมดเขตวันนี้":"หมดเขตใน "+n+" วัน",cats:{All:"ทั้งหมด",Food:"เดลิเวอรี",Restaurants:"ร้านอาหาร",Supermarkets:"ซูเปอร์มาร์เก็ต",Shopping:"ช้อปปิ้ง",Rides:"เดินทาง",Travel:"ท่องเที่ยว","AI Tools":"เครื่องมือ AI","Card Perks":"สิทธิพิเศษบัตร"}}};
let DD=null,DCNT={},DTOT=0,dcat='All',dlang=(()=>{const q=new URLSearchParams(location.search).get('lang');return (q=='th'||q=='en')?q:(localStorage.getItem('lang')||((navigator.language||'').toLowerCase().startsWith('th')?'th':'en'))})();
const DL=()=>DI[dlang],dtr=(o,k)=>dlang=='th'&&o[k+'_th']?o[k+'_th']:o[k],dcn=c=>DL().cats[c]||c,dck=c=>String(c).replace(/[^A-Za-z0-9!_-]/g,'').slice(0,40);
const dfmt=d=>new Date(d+'T00:00:00').toLocaleDateString(dlang=='th'?'th-TH':'en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
function dcopy(t,b){const done=()=>{b.textContent=DL().copied;b.classList.add('ok');setTimeout(()=>{b.textContent=DL().copy;b.classList.remove('ok')},1500)};
 const fb=()=>{const a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();a.setSelectionRange(0,99);try{document.execCommand('copy')}catch(e){}a.remove();done()};
 if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(done,fb);else fb()}
function dpaint(){const e=document.getElementById('dtally');if(e)e.textContent=DTOT?DL().tally(DTOT):'';document.querySelectorAll('.dcnt').forEach(e=>{const n=DCNT[e.dataset.k]||0;e.textContent=n>0?DL().times(n):''})}
function dhit(code){const k=dck(code);if(!k)return;DCNT[k]=(DCNT[k]||0)+1;DTOT++;dpaint();
 fetch(COUNTER_URL+'/hit/'+encodeURIComponent(k),{method:'POST'}).then(r=>r.ok?r.json():null).then(j=>{if(j){if(j.count>DCNT[k])DCNT[k]=j.count;if(j.total>DTOT)DTOT=j.total;dpaint()}}).catch(()=>{})}
function dcard(d,base){const days=d.expiry?Math.round((new Date(d.expiry+'T00:00:00')-base)/864e5):null,soon=days!==null&&days>=0&&days<=3;
 const codes=d.codes&&d.codes.length?d.codes.map(c=>`<div class="dcode"><div class="c">${esc(c.code)}<small>${esc(dtr(c,'label'))}</small></div><button class="dcp" data-code="${esc(c.code)}">${DL().copy}</button></div><div class="dcnt" data-k="${esc(dck(c.code))}">${DCNT[dck(c.code)]>0?esc(DL().times(DCNT[dck(c.code)])):''}</div>`).join(''):`<div class="dnocode">${DL().nocode}</div>${d.claim?`<p class="dwhy">👉 ${esc(dtr(d,'claim'))}</p>`:''}`;
 return `<article class="dcard${soon?' soon':''}"><div class="dtop"><div class="drank">${d.rank}</div><span class="dchip" style="background:${DCOL[d.brand]||'#555'}">${esc(d.brand)}</span><span class="dcat">${esc(dcn(d.category))}</span>${soon?`<span class="dsoon">${DL().soon} · ${DL().left(days)}</span>`:''}</div>
<h3>${esc(dtr(d,'title'))}</h3><div class="ddisc">${esc(dtr(d,'discount'))}</div><div class="dmeta"><span>🛒 ${DL().min}: ${esc(dtr(d,'minSpend'))}</span><span>📅 ${d.expiry?DL().until+dfmt(d.expiry):DL().noend}</span></div>
${codes}<p class="dwhy">💡 ${esc(dtr(d,'why'))}</p><a class="dsrc" href="${esc(d.source)}" target="_blank" rel="noopener">${DL().src}</a></article>`}
function deals(add,links){
 const wrap=document.createElement('div');add(wrap);
 const draw=()=>{if(!DD){wrap.innerHTML='<p class="empty">Loading… · กำลังโหลด</p>';return}
  const t=DD.deals.slice().sort((a,b)=>a.rank-b.rank),top=t[0],base=new Date(DD.date+'T00:00:00');
  hero({tag:DL().title,title:top?dtr(top,'title'):'',meta:top?`#1 · ${top.brand} · ${dtr(top,'discount')}`:'',text:1,bg:'linear-gradient(135deg,#1e1b4b,#4c1d95 55%,#be185d)',
   extra:`<div class="phrase">${esc(DL().sub)}<br><span class="ex">${esc(DL().updated+dfmt(DD.date))}</span> <span class="dtally" id="dtally"></span><div class="dlang"><button data-l="th" class="${dlang=='th'?'on':''}">TH</button><button data-l="en" class="${dlang=='en'?'on':''}">EN</button></div></div>`});
  document.querySelectorAll('.dlang button').forEach(b=>b.onclick=()=>{dlang=b.dataset.l;localStorage.setItem('lang',dlang);draw()});
  const it=t.filter(d=>dcat=='All'||d.category==dcat);let h=`<div class="pbar"><div class="chips">${DCATS.map(c=>`<button data-c="${c}" class="${c==dcat?'on':''}">${esc(dcn(c))}</button>`).join('')}</div></div>`;
  const sec=(id,name,L)=>L.length?`<section class="row" id="${id}"><h2>${esc(name)}<small>${L.length}</small></h2><div class="dgrid">${L.map(d=>dcard(d,base)).join('')}</div></section>`:'';
  if(dcat=='All'){h+=sec('deals-top',DL().top10,it.filter(d=>d.rank<=10))+sec('deals-more',DL().more,it.filter(d=>d.rank>10))}else h+=sec('deals-cat',dcn(dcat),it);
  h+=`<p class="empty">${esc(DL().foot)}</p>`;wrap.innerHTML=h;dpaint();
  wrap.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{dcat=b.dataset.c;draw()});
  wrap.querySelectorAll('.dcp').forEach(b=>b.onclick=()=>{dcopy(b.dataset.code,b);dhit(b.dataset.code)});
 };
 links.push(['deals-top','Top 10'],['deals-more','More']);
 draw();
 if(!DD){fetch(DEALS_URL+'?'+Date.now(),{cache:'no-store'}).then(r=>r.json()).then(j=>{DD=j;if(location.hash.slice(1)==='deals')draw()}).catch(()=>{wrap.innerHTML=`<p class="empty">${esc(DL().err)}</p>`});
  fetch(COUNTER_URL+'/counts').then(r=>r.ok?r.json():{}).then(j=>{if(j&&typeof j=='object'){if(j.counts){DCNT=j.counts;DTOT=+j.total||0}else{DCNT=j;DTOT=Object.values(j).reduce((a,b)=>a+(+b||0),0)}dpaint()}}).catch(()=>{})}
}
