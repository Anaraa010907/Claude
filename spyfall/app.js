const $=s=>document.querySelector(s), LS=window.localStorage;
const me={name:LS.getItem('name')||'Beatna · Ta',img:LS.getItem('avatar')||''};
const bots=[{n:'Zaya',e:'🐯',h:'🕶️'},{n:'Bold',e:'🐻',h:'🎩'},{n:'Sarnai',e:'🦊',h:'🧢'},{n:'Nomin',e:'🐱',h:'🎀'},{n:'Temka',e:'🐼',h:'🎓'}];
let micOn=false,stream=null,speakingId=null;
// ---- Дэлгэц солих
function go(n){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));$('#s-'+(n==='home'?'home':n)).classList.add('active');if(n==='table')render()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-go]');if(t)go(t.dataset.go)});
// ---- Ширээ зурах (8 суудал)
function avaHTML(p){return p.img?`<img src="${p.img}" alt="">`:(p.e||'🐸')}
function render(){
 const seats=[{...me,me:1,e:'🐸',h:'👑',id:'me'},...bots.map((b,i)=>({name:b.n,e:b.e,h:b.h,id:'b'+i})),null,null];
 const order=[0,2,3,5,6,4,1,7]; // байрлалын дараалал
 const el=$('#table');el.querySelectorAll('.seat').forEach(x=>x.remove());
 const spots=[[50,88],[80,74],[90,50],[80,26],[50,12],[20,26],[10,50],[20,74]];
 // би доод талд, бусад цагийн зүүний дагуу
 seats.forEach((p,i)=>{const [x,y]=spots[i],d=document.createElement('div');
  d.className='seat'+(p?'':' empty')+(p&&p.me?' me':'')+(p&&p.id===speakingId?' speak':'')+(p&&p.me&&!micOn?' muted':'');
  d.style.left=x+'%';d.style.top=y+'%';
  d.innerHTML=p?`<div class="ava">${avaHTML(p.me?{img:me.img,e:'🐸'}:p)}</div><span class="hat">${p.h||''}</span><span class="nm">${p.me?me.name:p.name}</span><span class="tag">ярьж байна</span>`
   :`<div class="ava">+</div><span class="nm">Урих</span>`;
  el.appendChild(d)});
 $('#count').textContent='6/8 тоглогч холбогдсон';
}
// ---- Профайл + зураг оруулах
$('#pname').value=me.name;$('#pava').replaceWith(Object.assign(document.createElement('span'),{id:'pava'}));
function paintProfile(){$('#pava').innerHTML=me.img?`<img src="${me.img}" style="width:100%;height:100%;object-fit:cover">`:'🐸'}paintProfile();
$('#pname').oninput=e=>{me.name=e.target.value||'Тоглогч';LS.setItem('name',me.name)};
$('#file').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{
 const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d'),s=Math.min(im.width,im.height);
  x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);me.img=c.toDataURL('image/jpeg',.85);LS.setItem('avatar',me.img);paintProfile();render()};im.src=r.result};r.readAsDataURL(f)};
// ---- Микрофон асаах/хаах
async function toggleMic(){
 const b=$('#mic');
 if(!micOn){try{stream=stream||await navigator.mediaDevices.getUserMedia({audio:true});}catch{sys('Микрофонд хандах эрх олгоно уу');return}
  stream.getAudioTracks().forEach(t=>t.enabled=true);micOn=true;watch();}
 else{stream.getAudioTracks().forEach(t=>t.enabled=false);micOn=false;speakingId=null}
 b.className='mic '+(micOn?'on':'off');b.textContent=micOn?'🎙️ Микрофон асаалттай':'🎙️ Микрофон асаах';render();
}
$('#mic').onclick=toggleMic;
function watch(){const ctx=new (window.AudioContext||webkitAudioContext)(),an=ctx.createAnalyser();ctx.createMediaStreamSource(stream).connect(an);
 const buf=new Uint8Array(an.fftSize);(function loop(){if(!micOn){ctx.close();return}an.getByteTimeDomainData(buf);
  let m=0;for(const v of buf)m=Math.max(m,Math.abs(v-128));const s=m>14?'me':null;if(s!==speakingId){speakingId=s;render()}requestAnimationFrame(loop)})()}
// ---- Чат (нэг төхөөрөмж дээрх tab-уудад BroadcastChannel-ээр; сервертэй холбохдоо send()-ийг солино)
const bc='BroadcastChannel' in window?new BroadcastChannel('spy-room'):null;
function add(n,t,cls){const d=document.createElement('div');d.innerHTML=cls?`<span class="${cls}"></span>`:`<b></b> <span></span>`;
 if(cls)d.firstChild.textContent=t;else{d.children[0].textContent=n+':';d.children[1].textContent=t}$('#log').appendChild(d);$('#log').scrollTop=1e9}
function sys(t){add('',t,'sys')}
function send(t){add(me.name,t);bc&&bc.postMessage({n:me.name,t})} // <- WebSocket дуудлагыг энд нэмнэ
if(bc)bc.onmessage=e=>add(e.data.n,e.data.t);
$('#cf').onsubmit=e=>{e.preventDefault();const v=$('#ci').value.trim();if(v){send(v);$('#ci').value=''}};
sys('Ширээнд тавтай морил!');
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
