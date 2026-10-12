const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yt=id=>`https://www.youtube.com/watch?v=${id}`,ago=d=>{const h=(Date.now()-new Date(d))/36e5;return h<24?Math.max(1,Math.round(h))+'h ago':Math.round(h/24)+'d ago'};
function play(v){$('#player').src=`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;$('#mTitle').textContent=v.title;$('#mYt').href=yt(v.id);$('#modal').hidden=false}
function close(){$('#modal').hidden=true;$('#player').src=''}
$('#close').onclick=close;$('#modal').onclick=e=>{if(e.target.id==='modal')close()};document.onkeydown=e=>{if(e.key==='Escape')close()};
let D,W={rows:{}};const fmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,'')+'M':n>=1e3?Math.round(n/1e3)+'K':String(n);
function render(sec){
 document.querySelectorAll('.tabs a').forEach(a=>a.classList.toggle('on',a.dataset.s===sec));
 const rs=D.rows.filter(r=>(r.section||'sports')===sec);
 const all=rs.flatMap(r=>r.videos.filter(v=>!v.short).map(v=>({...v,row:r.name}))).sort((a,b)=>b.published.localeCompare(a.published));
 const h=all[0]||rs[0].videos[0];
 $('#hero').style.backgroundImage=`url(https://i.ytimg.com/vi/${h.id}/maxresdefault.jpg),url(${h.thumb})`;
 $('#hTitle').textContent=h.title;$('#hMeta').textContent=`${h.row||''} · ${h.channel} · ${ago(h.published)}`;$('#hPlay').onclick=()=>play(h);$('#hYt').href=yt(h.id);
 $('#links').innerHTML=rs.map(r=>`<a href="#" data-k="${r.key}">${esc(r.name.split(' –')[0])}</a>`).join('');
 $('#links').querySelectorAll('a').forEach(a=>a.onclick=e=>{e.preventDefault();document.getElementById(a.dataset.k).scrollIntoView({behavior:'smooth'})});
 const rows=$('#rows');rows.innerHTML='';
 rs.forEach(r=>{const s=document.createElement('section');s.className='row';s.id=r.key;
  s.innerHTML=`<h2>${esc(r.name)}<small>${esc(r.th)}</small></h2><div class="track"></div>`;
  const t=s.querySelector('.track');
  r.videos.forEach(v=>{const c=document.createElement('div');c.className='card';
   c.innerHTML=`${v.short?'<span class="badge">SHORT</span>':''}<img loading="lazy" src="${v.thumb}" alt=""><div class="t">${esc(v.title)}<br><span style="color:#888">${fmt(v.views||0)} views · ${esc(v.channel)} · ${ago(v.published)}</span></div>`;
   c.onclick=()=>play(v);t.appendChild(c)});const w=W.rows[r.key];if(w){const b=document.createElement('div');b.className='wk';b.innerHTML=`<div><b>This week · สัปดาห์นี้</b><ul>${w.week.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div><b>What to watch out for · ต้องจับตา</b><ul>${w.watch.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div><div class="src"><a href="${esc(w.src)}" target="_blank" rel="noopener">Source</a> · updated ${esc(W.updated)}</div>`;s.appendChild(b)}
  rows.appendChild(s)});
 window.scrollTo(0,0);
}
const sec=()=>location.hash==='#gaming'?'gaming':'sports';
window.onhashchange=()=>D&&render(sec());
Promise.all([fetch('data.json?'+Date.now()).then(r=>r.json()),fetch('weekly.json?'+Date.now()).then(r=>r.json()).catch(()=>({rows:{}}))]).then(([d,w])=>{D=d;W=w;$('#upd').textContent='Updated '+new Date(d.updated).toLocaleString();render(sec())});
