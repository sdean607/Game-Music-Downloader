const DB_KEY = 'savepoint-v3-library';
const API = '/api/tracks';
const form = document.querySelector('#track-form');
const grid = document.querySelector('#track-grid');
const search = document.querySelector('#search');
const genreFilter = document.querySelector('#genre-filter');
const sort = document.querySelector('#sort');
const emptyState = document.querySelector('#empty-state');
const player = document.querySelector('#audio-player');
const playerBar = document.querySelector('#mini-player');
const status = document.querySelector('#form-message');
let tracks = [];
let backendAvailable = false;

function safeUrl(value, optional = false) {
  if (!value && optional) return '';
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
}
function readLocal() { try { const value = JSON.parse(localStorage.getItem(DB_KEY) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } }
function saveLocal() { localStorage.setItem(DB_KEY, JSON.stringify(tracks)); }
async function loadTracks() {
  try { const response = await fetch(API); if (!response.ok) throw new Error('API unavailable'); const data = await response.json(); if (!Array.isArray(data)) throw new Error('Invalid API data'); tracks = data; backendAvailable = true; }
  catch { tracks = readLocal(); backendAvailable = false; }
  render();
}
async function persist() {
  if (backendAvailable) {
    try { const response = await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tracks) }); if (!response.ok) throw new Error('Could not save'); return; }
    catch { backendAvailable = false; }
  }
  saveLocal();
}
function make(tag, className, text) { const el = document.createElement(tag); if (className) el.className = className; if (text !== undefined) el.textContent = text; return el; }
function render() {
  const genres = [...new Set(tracks.map(track => track.genre).filter(Boolean))].sort((a,b) => a.localeCompare(b, 'pt-BR'));
  const old = genreFilter.value; genreFilter.replaceChildren(new Option('Todos os gêneros', ''));
  genres.forEach(genre => genreFilter.add(new Option(genre, genre)));
  if (genres.includes(old)) genreFilter.value = old;
  const query = search.value.trim().toLocaleLowerCase('pt-BR');
  let visible = tracks.filter(t => [t.title,t.game,t.artist,t.genre].some(v => (v || '').toLocaleLowerCase('pt-BR').includes(query)) && (!genreFilter.value || t.genre === genreFilter.value));
  visible.sort((a,b) => sort.value === 'title' ? a.title.localeCompare(b.title,'pt-BR') : sort.value === 'game' ? a.game.localeCompare(b.game,'pt-BR') : b.createdAt-a.createdAt);
  document.querySelector('#track-count').textContent = `${tracks.length} ${tracks.length === 1 ? 'trilha' : 'trilhas'}${backendAvailable ? ' · sincronizado no servidor' : ' · salvo neste navegador'}`;
  grid.replaceChildren();
  visible.forEach(track => {
    const card = make('article','track-card');
    const cover = make('div','cover','♫'); cover.setAttribute('aria-hidden','true');
    const info = make('div','track-info'); info.append(make('h3','',track.title), make('p','',`${track.game}${track.artist ? ` · ${track.artist}` : ''}`));
    const top = make('div','card-top'); top.append(cover,info);
    const badge = make('span','genre-badge',track.genre || 'Sem gênero');
    const details = make('a','small-link','Detalhes ↗'); details.href = `track.html?id=${encodeURIComponent(track.id)}`;
    const reference = make('a','small-link','Fonte ↗'); reference.href = track.sourceUrl; reference.target='_blank'; reference.rel='noopener noreferrer';
    const actions = make('div','card-actions'); actions.append(details,reference);
    if (track.audioUrl) { const play = make('button','play-button','▶ Ouvir'); play.type='button'; play.addEventListener('click',() => playTrack(track)); actions.append(play); }
    const bottom = make('div','card-bottom'); bottom.append(badge,actions); card.append(top,bottom); grid.append(card);
  });
  emptyState.hidden = visible.length > 0;
}
function playTrack(track) {
  player.src = track.audioUrl; document.querySelector('#player-title').textContent = track.title; document.querySelector('#player-game').textContent = track.game; playerBar.hidden = false;
  player.play().catch(() => { status.textContent = 'O navegador ou a fonte não permitiu iniciar a reprodução. Use os controles do player.'; });
}
form.addEventListener('submit', async event => {
  event.preventDefault(); const data = new FormData(form);
  const audioRaw = String(data.get('audioUrl') || '').trim(); const sourceRaw = String(data.get('sourceUrl') || '').trim();
  const audioUrl = safeUrl(audioRaw, true); const sourceUrl = safeUrl(sourceRaw);
  if (audioUrl === null || !sourceUrl) { status.textContent = 'Use links válidos começando com http:// ou https://.'; status.className='error'; return; }
  const item = { id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, title:String(data.get('title')).trim(), game:String(data.get('game')).trim(), artist:String(data.get('artist')).trim(), genre:String(data.get('genre')).trim(), license:String(data.get('license')).trim(), audioUrl, sourceUrl, notes:String(data.get('notes')).trim(), createdAt:Date.now() };
  tracks.unshift(item); try { await persist(); } catch { tracks.shift(); status.textContent='Não foi possível salvar. Verifique o espaço disponível.'; status.className='error'; return; }
  form.reset(); status.className='success'; status.textContent=backendAvailable ? 'Faixa salva no servidor.' : 'Faixa salva neste navegador.'; render(); document.querySelector('#library').scrollIntoView({behavior:'smooth'});
});
search.addEventListener('input',render); genreFilter.addEventListener('change',render); sort.addEventListener('change',render);
document.querySelector('#stop-player').addEventListener('click',() => { player.pause(); player.currentTime=0; player.removeAttribute('src'); player.load(); playerBar.hidden=true; });
document.querySelector('#theme-toggle').addEventListener('click',() => { const root=document.documentElement; const theme=root.dataset.theme === 'dark' ? 'light' : 'dark'; root.dataset.theme=theme; localStorage.setItem('savepoint-theme',theme); });
document.querySelector('#export-button').addEventListener('click',() => { const blob=new Blob([JSON.stringify(tracks,null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='savepoint-library.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); });
loadTracks();
