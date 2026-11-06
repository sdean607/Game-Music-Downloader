const KEY='savepoint-v3-library';
function safeUrl(value){try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}}
function getTracks(){try{const d=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(d)?d:[]}catch{return []}}
const id=new URLSearchParams(location.search).get('id');
const track=getTracks().find(item=>item.id===id);
if(!track){document.querySelector('#detail-card').hidden=true;document.querySelector('#error').hidden=false;}else{
 document.title=`${track.title} — Save Point`;
 document.querySelector('#title').textContent=track.title;
 document.querySelector('#subtitle').textContent=`${track.game}${track.artist?` · ${track.artist}`:''}`;
 document.querySelector('#genre').textContent=track.genre||'Não informado';
 document.querySelector('#license').textContent=track.license||'Não informado';
 document.querySelector('#notes').textContent=track.notes||'Sem observações.';
 const source=document.querySelector('#source-link');source.href=safeUrl(track.sourceUrl)||'/';
 if(track.audioUrl&&safeUrl(track.audioUrl)){const audio=document.querySelector('#detail-audio');audio.src=safeUrl(track.audioUrl);audio.hidden=false;const play=document.querySelector('#play-button');play.hidden=false;play.addEventListener('click',()=>audio.play().catch(()=>{}));}
 document.querySelector('#delete-button').addEventListener('click',()=>{if(confirm('Remover esta trilha da biblioteca deste navegador?')){localStorage.setItem(KEY,JSON.stringify(getTracks().filter(item=>item.id!==id)));location.href='/';}});
}
