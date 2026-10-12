const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yt=id=>`https://www.youtube.com/watch?v=${id}`,ago=d=>{const h=(Date.now()-new Date(d))/36e5;return h<24?Math.max(1,Math.round(h))+'h ago':Math.round(h/24)+'d ago'};
const fmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,'')+'M':n>=1e3?Math.round(n/1e3)+'K':String(n);
function play(v){$('#player').src=`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;$('#mTitle').textContent=v.title;$('#mYt').href=yt(v.id);$('#modal').hidden=false}
function close(){$('#modal').hidden=true;$('#player').src=''}
$('#close').onclick=close;$('#modal').onclick=e=>{if(e.target.id==='modal')close()};document.onkeydown=e=>{if(e.key==='Escape')close()};
const get=u=>fetch(u+'?'+Date.now()).then(r=>r.json()).catch(()=>null);
let D,W={rows:{}},B,P,Q,J;
const dayIdx=n=>{const d=new Date();const k=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5);return k%n};
function weekly(key){const w=W.rows[key];if(!w)return null;const b=document.createElement('div');b.className='wk';
 b.innerHTML=`<div><b>This week · สัปดาห์นี้</b><ul>${w.week.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><b>What to watch out for · ต้องจับตา</b><ul>${w.watch.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="src"><a href="${esc(w.src)}" target="_blank" rel="noopener">Source</a> · updated ${esc(W.updated)}</div>`;return b}
function section(key,name,th){const s=document.createElement('section');s.className='row';s.id=key;s.innerHTML=`<h2>${esc(name)}<small>${esc(th||'')}</small></h2><div class="track"></div>`;return s}
function videoRow(r){const s=section(r.key,r.name,r.th),t=s.querySelector('.track');
 r.videos.forEach(v=>{const c=document.createElement('div');c.className='card';
  c.innerHTML=`${v.short?'<span class="badge">SHORT</span>':''}<img loading="lazy" src="${v.thumb}" alt=""><div class="t">${esc(v.title)}<br><span class="m">${fmt(v.views||0)} views · ${esc(v.channel)} · ${ago(v.published)}</span></div>`;
  c.onclick=()=>play(v);t.appendChild(c)});return s}
function textRow(key,name,th,items,srcNote){const s=section(key,name,th),t=s.querySelector('.track');
 items.forEach(x=>{const c=document.createElement('div');c.className='card tcard';
  c.innerHTML=`<div class="tc"><b>${esc(x.n||x.t)}</b>${x.th?`<span class="thl">${esc(x.th)}</span>`:''}<p>${esc(x.d)}</p><div class="lk">${x.map?`<a href="${x.map}" target="_blank" rel="noopener">📍 Google Maps</a>`:''}${x.src?`<a href="${esc(x.src)}" target="_blank" rel="noopener">Source</a>`:''}</div></div>`;t.appendChild(c)});
 if(srcNote){const n=document.createElement('div');n.className='wk src1';n.innerHTML=srcNote;s.appendChild(n)}return s}
function bookRow(r){const s=section(r.key,r.name,r.th),t=s.querySelector('.track');
 r.books.forEach(b=>{const c=document.createElement('div');c.className='card bcard';
  c.innerHTML=`${b.cover?`<img loading="lazy" src="${b.cover}" alt="">`:`<div class="nocover">${esc(b.title)}</div>`}<div class="t"><b>${esc(b.title)}</b><br><span class="m">${esc(b.author)}${b.year?' · '+b.year:''}${b.release?' · '+esc(b.release):''}</span><p>${esc(b.line)}</p>${b.rating?`<span class="m">★ ${b.rating} (${b.ratingCount} ratings, ${b.ratingSource})</span><br>`:''}<a href="${esc(b.url)}" target="_blank" rel="noopener">${b.release?'Publisher':'Open Library'}</a> · <a href="${esc(b.goodreads)}" target="_blank" rel="noopener">Goodreads</a></div>`;
  t.appendChild(c)});return s}
function hero(o){$('#hTag').textContent=o.tag;$('#hTitle').textContent=o.title;$('#hMeta').textContent=o.meta||'';$('#hExtra').innerHTML=o.extra||'';
 $('#hero').style.backgroundImage=o.bg||'';$('#hBtns').style.display=o.v?'flex':'none';if(o.v){$('#hPlay').onclick=()=>play(o.v);$('#hYt').href=yt(o.v.id)}$('#hero').classList.toggle('textonly',!!o.text)}
function render(sec){
 document.querySelectorAll('.tabs a').forEach(a=>a.classList.toggle('on',a.dataset.s===sec));
 const rows=$('#rows');rows.innerHTML='';const add=(el,key)=>{if(!el)return;rows.appendChild(el);const w=key&&weekly(key);if(w)el.appendChild(w)};
 let links=[];
 if(sec==='books'){
  const q=Q.quotes[dayIdx(Q.quotes.length)];
  hero({tag:'Book quote of the day · คำคมประจำวัน',title:'“'+q.q+'”',meta:`— ${q.author}, ${q.book}`,text:1,bg:'linear-gradient(135deg,#2a0a0a,#141414)'});
  B.rows.forEach(r=>{add(bookRow(r),r.key);links.push([r.key,r.name])});
 } else {
  const rs=D.rows.filter(r=>(r.section||'sports')===sec);
  if(sec==='japan'){
   const p=P.phrases[dayIdx(P.phrases.length)];
   hero({tag:'Japanese phrase of the day · วลีญี่ปุ่นประจำวัน',title:p.jp,meta:`${p.romaji} — ${p.en}`,extra:`<p class="th">🇹🇭 ${esc(p.th)}</p><p class="ex">${esc(p.example)}</p>`,text:1,bg:'linear-gradient(135deg,#3a0610,#141414)'});
  } else {
   const all=rs.flatMap(r=>r.videos.filter(v=>!v.short).map(v=>({...v,row:r.name}))).sort((a,b)=>b.published.localeCompare(a.published));
   const h=all[0]||rs[0].videos[0];
   hero({tag:sec==='music'?'Newest from top artists · มาใหม่':'Latest highlight · ไฮไลต์ล่าสุด',title:h.title,meta:`${h.row||''} · ${h.channel} · ${fmt(h.views||0)} views · ${ago(h.published)}`,v:h,bg:`url(https://i.ytimg.com/vi/${h.id}/maxresdefault.jpg),url(${h.thumb})`});
  }
  rs.forEach(r=>{
   if(sec==='japan'&&r.key==='tips'&&J){add(textRow('tip-cards','Tips & Tricks','เคล็ดลับ',J.tips));links.push(['tip-cards','Tips'])}
   add(videoRow(r),r.key);links.push([r.key,r.name]);
   if(sec==='japan'&&J&&r.key==='hidden-gems'){add(textRow('gems-list','Hidden Gems – places','ที่เที่ยวลับ (แผนที่)',J.gems));}
   if(sec==='japan'&&J&&r.key==='gaming-japan'){add(textRow('anime-spots','Anime Spots','ตามรอยอนิเมะ',J.anime));links.push(['anime-spots','Anime Spots'])}
   if(sec==='japan'&&J&&r.key==='pokemon-japan'){add(textRow('pokemon-places','Pokémon Center & Café locations','ร้านโปเกมอนเซ็นเตอร์',J.pokemon,`Source: <a href="${J.pokemonSrc}" target="_blank" rel="noopener">official Pokémon Center shop list</a>`))}
  });
 }
 $('#links').innerHTML=links.map(([k,n])=>`<a href="#" data-k="${k}">${esc(n.split(' –')[0])}</a>`).join('');
 $('#links').querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById(a.dataset.k).scrollIntoView({behavior:'smooth'})});
 window.scrollTo(0,0);
}
const TABS=['sports','gaming','music','japan','books'];
const sec=()=>{const h=location.hash.slice(1);return TABS.includes(h)?h:'sports'};
window.onhashchange=()=>D&&render(sec());
Promise.all([get('data.json'),get('weekly.json'),get('books.json'),get('phrases.json'),get('quotes.json'),get('japan.json')]).then(([d,w,b,p,q,j])=>{D=d;W=w||{rows:{}};B=b;P=p;Q=q;J=j;$('#upd').textContent='Videos updated '+new Date(d.updated).toLocaleString();render(sec())});
