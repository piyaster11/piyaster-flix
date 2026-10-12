const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const yt=id=>`https://www.youtube.com/watch?v=${id}`,ago=d=>{const h=(Date.now()-new Date(d))/36e5;return h<24?Math.max(1,Math.round(h))+'h ago':Math.round(h/24)+'d ago'};
const fmt=n=>n>=1e6?(n/1e6).toFixed(1).replace(/\.0$/,'')+'M':n>=1e3?Math.round(n/1e3)+'K':String(n);
function play(v){$('#player').src=`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`;$('#mTitle').textContent=v.title;$('#mYt').href=yt(v.id);$('#modal').hidden=false}
function close(){$('#modal').hidden=true;$('#player').src=''}
$('#close').onclick=close;$('#modal').onclick=e=>{if(e.target.id==='modal')close()};document.onkeydown=e=>{if(e.key==='Escape')close()};
const get=u=>fetch(u+'?'+Date.now()).then(r=>r.json()).catch(()=>null);
let D,W={rows:{}},B,P,Q,J,MM=[];
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
 if(sec==='memes'){memes(add,links);}
 else if(sec==='books'){
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
const TABS=['sports','gaming','music','japan','books','memes'];
const sec=()=>{const h=location.hash.slice(1);return TABS.includes(h)?h:'sports'};
window.onhashchange=()=>D&&render(sec());
Promise.all([get('data.json'),get('weekly.json'),get('books.json'),get('phrases.json'),get('quotes.json'),get('japan.json'),get('memes.json')]).then(([d,w,b,p,q,j,mm])=>{D=d;W=w||{rows:{}};B=b;P=p;Q=q;J=j;MM=(mm||[]).sort((x,y)=>x.rank-y.rank);$('#upd').textContent='Videos updated '+new Date(d.updated).toLocaleString();render(sec())});

// ---------- Memes ----------
const OCC=[['work','Work · งาน'],['monday','Monday · วันจันทร์'],['friday','Friday · วันศุกร์'],['payday','Payday · เงินเดือนออก'],['broke','Broke · เงินหมด'],['birthday','Birthday · วันเกิด'],['thanks','Thanks · ขอบคุณ'],['sorry','Sorry · ขอโทษ'],['love','Love · รัก'],['food','Food · หิว'],['sad','Sad · เศร้า'],['happy','Happy · ดีใจ'],['shocked','Shocked · ตกใจ'],['agree','Agree · เห็นด้วย'],['disagree','Disagree · ไม่เห็นด้วย'],['no','No · ไม่'],['songkran','Songkran · สงกรานต์'],['newyear','New Year · ปีใหม่'],['loykrathong','Loy Krathong · ลอยกระทง']];
const SYN={happy:['ดีใจ','สุข','yay','happy'],sad:['เศร้า','อกหัก','ร้องไห้','sad','cry'],work:['งาน','office','ออฟฟิศ','ทำงาน','boss','หัวหน้า','meeting','ประชุม','deadline','เดดไลน์'],monday:['วันจันทร์','จันทร์','monday'],payday:['เงินเดือนออก','เงินเดือน','salary','payday','money'],friday:['วันศุกร์','ศุกร์','weekend','friday'],birthday:['วันเกิด','hbd','birthday'],thanks:['ขอบคุณ','thank','thx'],sorry:['ขอโทษ','sorry','โทษที'],reply:['ตอบแชท','reply','chat','แชท','line','ไลน์'],food:['หิว','อาหาร','กิน','food','hungry'],love:['รัก','แฟน','love','crush'],broke:['เงินหมด','จน','broke','ไม่มีเงิน'],shocked:['ตกใจ','อึ้ง','shock','wow','omg'],agree:['เห็นด้วย','ใช่','agree','yes','same'],no:['ไม่','no','nope'],disagree:['ไม่เห็นด้วย','disagree','เถียง']};
let memeQ='',memeOcc=null,fav=new Set(JSON.parse(localStorage.favs||'[]'));
const expand=q=>{q=q.toLowerCase().trim();if(!q)return[];let k=[q];for(const[a,v]of Object.entries(SYN))if(a.includes(q)||v.some(w=>w.includes(q)||q.includes(w)))k.push(a,...v);return k};
const hay=m=>(m.name+' '+(m.name_th||'')+' '+m.tags.join(' ')+' '+m.occasions.join(' ')).toLowerCase();
function toast(t){const e=$('#toast');e.textContent=t;e.style.display='block';clearTimeout(e._t);e._t=setTimeout(()=>e.style.display='none',1800)}
const mblob=async m=>(await fetch(m.img)).blob();
async function msave(m){try{const b=await mblob(m),f=new File([b],m.id+'.jpg',{type:b.type||'image/jpeg'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:m.name});return}}catch(e){if(e.name==='AbortError')return}
 const a=document.createElement('a');a.href=m.img;a.download=m.id+'.jpg';document.body.appendChild(a);a.click();a.remove();toast('Downloaded · ดาวน์โหลดแล้ว')}
async function mcopy(m){try{const b=await mblob(m);const png=await new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.naturalWidth;c.height=i.naturalHeight;c.getContext('2d').drawImage(i,0,0);c.toBlob(r,'image/png')};i.src=URL.createObjectURL(b)});await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);toast('Copied! · คัดลอกแล้ว')}catch(e){toast('Copy not supported – use Save · ใช้ปุ่มบันทึกแทน')}}
function mfav(m){fav.has(m.id)?fav.delete(m.id):fav.add(m.id);localStorage.favs=JSON.stringify([...fav]);render('memes')}
function macts(m){const d=document.createElement('div');d.className='acts';const b=(t,f,c)=>{const x=document.createElement('button');x.textContent=t;if(c)x.className=c;x.onclick=e=>{e.stopPropagation();f(m)};d.append(x)};
 b('⬇️ Save · บันทึก',msave);b('📋 Copy',mcopy);b(fav.has(m.id)?'❤️':'🤍',mfav,'fav');return d}
function mopen(m){$('#mvi').src=m.img;$('#mvn').textContent=m.name+(m.caption_original?' · '+m.caption_original:'');$('#mva').replaceWith(Object.assign(macts(m),{id:'mva'}));$('#mv').hidden=false}
$('#mvx').onclick=()=>$('#mv').hidden=true;$('#mv').onclick=e=>{if(e.target.id==='mv')$('#mv').hidden=true};
function mcard(m){const c=document.createElement('div');c.className='card mcard'+(m.ratio==='1:1'?' sq':'');
 c.innerHTML=`${m.ratio==='1:1'?'<span class="badge">1:1</span>':''}<img loading="lazy" src="${m.img}" alt="${esc(m.name)}"><div class="t"><b>${esc(m.name)}</b><br><span class="m">${m.occasions.map(o=>'#'+o).join(' ')}</span></div>`;
 c.querySelector('img').onclick=()=>mopen(m);c.append(macts(m));return c}
function mrow(key,name,th,list){if(!list.length)return null;const s=section(key,name,th),t=s.querySelector('.track');list.forEach(m=>t.appendChild(mcard(m)));return s}
function memes(add,links){
 hero({tag:'Meme library · คลังมีม',title:'Find the perfect meme',meta:`${MM.length} memes · tap Save to keep it on your phone`,text:1,bg:'linear-gradient(135deg,#2a0a0a,#141414)',
  extra:`<input id="mq" type="search" placeholder="Search memes… ค้นหามีม (เช่น เงินเดือนออก, monday)" value="${esc(memeQ)}"><div class="chips">${OCC.map(([k,l])=>`<button data-o="${k}" class="${memeOcc===k?'on':''}">${l}</button>`).join('')}</div><p class="ex">📱 iPhone: tap <b>Save</b> → “Save Image”. Or long-press an image → “Save to Photos”. · กด “บันทึก” หรือกดค้างที่รูป</p>`});
 const mq=$('#mq');mq.oninput=()=>{memeQ=mq.value;draw()};document.querySelectorAll('.chips button').forEach(b=>b.onclick=()=>{memeOcc=memeOcc===b.dataset.o?null:b.dataset.o;document.querySelectorAll('.chips button').forEach(x=>x.classList.toggle('on',x.dataset.o===memeOcc));draw()});
 const box=document.createElement('div');$('#rows').appendChild(box);
 function draw(){box.innerHTML='';const keys=expand(memeQ);
  if(memeQ||memeOcc){const L=MM.filter(m=>(!memeOcc||m.occasions.includes(memeOcc))&&(!keys.length||keys.some(k=>hay(m).includes(k))));
   const s=section('results',`Results · ผลลัพธ์ (${L.length})`,'');s.querySelector('.track').className='mgrid';L.forEach(m=>s.querySelector('.mgrid').appendChild(mcard(m)));if(!L.length)s.append('No memes found · ไม่พบมีม');box.appendChild(s);return}
  const R=[mrow('m-reply','💬 Reply memes','มีมตอบแชท (1:1 for LINE)',MM.filter(m=>m.type==='reply')),mrow('m-top','🔥 Top memes','มีมยอดนิยม',MM.filter(m=>m.type!=='reply').slice(0,20)),mrow('m-fav','❤️ Favorites','ที่ชอบ',MM.filter(m=>fav.has(m.id)))];
  OCC.forEach(([k,l])=>R.push(mrow('m-'+k,l.split(' · ')[0],l.split(' · ')[1],MM.filter(m=>m.occasions.includes(k)&&m.type!=='reply'))));
  R.forEach(r=>r&&box.appendChild(r))}
 draw();links.push(['m-reply','Reply'],['m-top','Top'],['m-fav','Favorites']);
}
