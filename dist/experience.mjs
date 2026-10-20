import { AGES, PALETTE, GIFTS, chance, castFor, newLife, currentScene, currentDetour, explore, advance, derive, summarize, nextGeneration, deserialize, constellationPoints } from './life.mjs?v=0.3.1';
import {WORLD, LANDMARKS, SPAWN, clampPoint, cameraFor,project,unproject,walk} from './world.mjs?v=0.3.1';

const $ = id => document.getElementById(id);
const canvas = $('universe'), ctx = canvas.getContext('2d');
const SAVE = 'stars-we-leave:lineage:v2', LEGACY = 'stars-we-leave:journey:v1';
const symbols = { bond:'✧', dream:'♪', care:'❧', self:'⌁' };
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let life = null, view = 'welcome', scene = null, selected = null;
let W = innerWidth, H = innerHeight, mobile = W <= 760, now = 0, lastTime = 0;
let player = {x:.5,y:.78}, target = null, trail = [], keys = new Set(), nodes = [], starNodes = [];
let memoryMode = 'read', soundOn = false, soundContext = null, soundTimer = 0, savedOkay = true, unreadableSave = null, protectUnknownSave = false;
let lastNear = -1, displaySummary = null, newGenerationAt = 0;
let activePlace=0, camera=cameraFor(SPAWN,W,H);
const dialogs = [...document.querySelectorAll('dialog')];
const stars = Array.from({length:170},(_,i)=>({x:chance(14253,i),y:chance(57127,i),r:.3+chance(9495,i)*1.2,phase:chance(12,i)*6.28}));
const anyDialog = () => dialogs.some(d=>d.open);
const seed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const say = text => { $('live-region').textContent = text; };
const text = (id,value) => { const el=$(id),next=String(value);if(el.textContent!==next)el.textContent=next; };
function element(tag, className, content) { const el=document.createElement(tag); if(className)el.className=className; if(content!==undefined)el.textContent=content; return el; }
function safeLoad() {
  try {
    const raw=localStorage.getItem(SAVE); life=raw!==null ? deserialize(raw) : null;
    unreadableSave=raw!==null && !life ? raw : null;
    if(unreadableSave!==null) { savedOkay=false; text('storage-notice','이전 기록을 읽을 수 없어 그대로 보존하고 있습니다. 새 삶을 시작하기 전에 기록 보관 여부를 확인합니다.'); }
    $('legacy-link').hidden=!localStorage.getItem(LEGACY);
  } catch { savedOkay=false; protectUnknownSave=true; text('storage-notice','이 브라우저에서는 이전 기록을 확인할 수 없어 덮어쓰지 않습니다. 현재 창을 열어 둔 동안에는 저장 없이 플레이할 수 있어요.'); }
  $('resume-life').hidden=!life;
  if(life)text('resume-life',life.choices.length===9?'나의 별자리 이어보기 →':'걷던 길 이어가기 →');
}
function persist() {
  if(protectUnknownSave) {
    savedOkay=false;say('이전 기록을 확인할 수 없어 덮어쓰지 않았습니다. 이번 진행은 현재 창에서만 이어집니다.');
    text('footer-copy','이전 기록을 보호하고 있어요. 이번 진행은 현재 창에서만 이어집니다.');return;
  }
  try { localStorage.setItem(SAVE,JSON.stringify(life)); savedOkay=true; }
  catch { savedOkay=false; say('자동 저장 공간이 부족합니다. 이 창에서는 계속할 수 있지만 새로고침하면 최근 진행이 사라질 수 있습니다.'); text('storage-notice','최근 진행을 저장하지 못했습니다. 이 창을 열어 둔 동안에는 계속 플레이할 수 있어요.'); }
  text('footer-copy',savedOkay?'당신이 지나온 시간은 이 브라우저에 저장됩니다.':'자동 저장이 되지 않고 있어요. 현재 창에서 계속할 수 있습니다.');
}
function setView(next) {
  view=next; document.querySelectorAll('.view').forEach(e=>e.hidden=e.id!==next);
  $('pause-button').hidden=next!=='living'; keys.clear(); target=null;
  const generation=(life?.ancestors.length||0)+1;
  text('generation-label',generation===1?'첫 번째 생애':`${generation}번째 생애`);
  text('footer-copy',next==='welcome'?'지금의 선택은, 아직 모르는 미래에 닿아 있습니다.':next==='afterlife'?'삶은 끝나도, 남긴 마음은 다른 이의 삶에서 이어집니다.':next==='inheritance'?'같은 별 아래에서도, 삶은 저마다의 방향으로 흐릅니다.':savedOkay?'당신이 지나온 시간은 이 브라우저에 저장됩니다.':'자동 저장이 되지 않고 있어요. 현재 창에서 계속할 수 있습니다.');
}
function showDialog(id) { keys.clear(); target=null; if(!$(id).open)$(id).showModal(); }
function closeDialog(id) { $(id).close(); keys.clear(); }
function showRestartDialog() {
  const unreadable=unreadableSave!==null;
  text('restart-message',unreadable?'읽을 수 없는 이전 기록이 있습니다. 새로 시작하면 원래 기록을 이 브라우저에 별도로 보관한 뒤 새 삶을 저장합니다. 먼저 파일로 내려받을 수도 있어요.':'현재의 진행과 이어진 가족 기록이 새 이야기로 바뀝니다. 기존 별자리를 이어가려면 ‘이어가기’를 선택해 주세요.');
  text('restart-confirm',unreadable?'기록을 보관하고 새로 시작':'새로 시작하기');
  $('download-old-save').hidden=!unreadable;
  text('restart-status','');showDialog('restart-dialog');
}
function preserveUnreadableSave() {
  if(localStorage.getItem(SAVE)!==unreadableSave) {
    const error=new Error('Save changed');error.code='SAVE_CHANGED';throw error;
  }
  const prefix=`${SAVE}:unreadable-backup:${Date.now()}`;
  let backupKey=prefix, index=0;
  while(localStorage.getItem(backupKey)!==null)backupKey=`${prefix}:${++index}`;
  localStorage.setItem(backupKey,unreadableSave);
  if(localStorage.getItem(backupKey)!==unreadableSave)throw new Error('Backup unavailable');
}
function beginFresh(confirmed=false) {
  const hadUnreadableSave=unreadableSave!==null;
  if(unreadableSave!==null) {
    if(!confirmed){showRestartDialog();return false;}
    try { preserveUnreadableSave(); }
    catch(error) {
      text('restart-status',error.code==='SAVE_CHANGED'?'다른 창에서 이전 기록이 바뀌었습니다. 덮어쓰지 않았습니다. 새로고침한 뒤 다시 확인해 주세요.':'이전 기록을 별도로 보관하지 못해 새로 시작하지 않았습니다. 원래 기록은 그대로 있습니다. 파일로 내려받은 뒤 브라우저 저장 공간과 설정을 확인해 주세요.');
      return false;
    }
  }
  life=newLife(seed()); persist(); scene=null; trail=[]; displaySummary=null; newGenerationAt=now;
  if(savedOkay)text('storage-notice',hadUnreadableSave?'이전 기록은 이 브라우저에 별도 백업으로 보관했습니다. 새로운 삶은 자동 저장됩니다.':'이 브라우저에 자동 저장됩니다. 시간제한은 없어요.');
  unreadableSave=null;startScene();return true;
}
function downloadOldSave() {
  if(unreadableSave===null)return;
  try {
    const blob=new Blob([unreadableSave],{type:'text/plain;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='우리가-남긴-별-이전기록.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
    text('restart-status','이전 기록 파일 다운로드를 시작했습니다. 내려받은 파일이 있는지 확인해 주세요.');
  } catch {text('restart-status','파일을 내려받지 못했습니다. 원래 기록은 그대로 보존되어 있습니다.');}
}
function startScene(keepPosition=false) {
  scene=currentScene(life); if(!scene){showEnding();return;}
  setView('living'); selected=null; lastNear=-1;
  if(!keepPosition){player={...SPAWN};trail=[];}
  text('era',scene.era); text('age',scene.age);
  text('place',scene.step===0?'처음의 작은 마당':scene.state.home==='city'?'낯선 도시의 하루':scene.state.home==='sea'?'바다가 보이는 마을':'익숙한 동네의 하루');
  text('scene-kind',scene.kind); text('scene-title',scene.title); text('scene-text',scene.text);
  const progress=$('progress'); progress.replaceChildren(); AGES.forEach((age,i)=>{const dot=element('span',i<scene.step?'past':i===scene.step?'now':'');dot.title=`${age}살`;progress.append(dot);});
  progress.setAttribute('aria-label',`아홉 순간 중 ${scene.step+1}번째, ${scene.age}살`);
  const gift=life.ancestors.at(-1)?.gift;
  $('inheritance-hint').hidden=!gift;
  if(gift)text('inheritance-hint',`${GIFTS[gift].symbol} 물려받은 ${GIFTS[gift].object}\n먼저 살았던 사람의 마음이 곁에 있습니다.`);
  $('paths').replaceChildren();$('map-places').replaceChildren();
  scene.places.forEach((name,i)=>{
    const c=scene.choices[i],visited=life.wander.some(v=>v.step===scene.step&&v.place===i);
    const b=element('button','path-node'); b.style.setProperty('--node',PALETTE[c.tag]);
    b.setAttribute('aria-label',`${name} 둘러보기`);
    b.append(element('span','path-symbol',['⌂','✧','⌁'][i]),element('span','path-who',visited?'작은 만남을 기억한 곳':'작은 만남 · 2개의 선택'),element('span','path-title',name),element('span','path-arrow','다가가 둘러보기 ↗'));
    b.onclick=()=>goToPlace(i);
    $('paths').append(b);
    const m=element('button','map-place',name);m.setAttribute('aria-label',`${name} 찾아가기`);m.style.setProperty('--node',PALETTE[c.tag]);
    m.append(element('small','',visited?'머문 곳':'아직 모르는 이야기'));m.onclick=()=>goToPlace(i);$('map-places').append(m);
  });
  layoutNodes(); renderRelations(); text('travel-hint','어느 방향이든 걸어보세요. 장소를 고르면 찾아갑니다.');
  text('wander-count',`이 시기의 작은 만남 ${life.wander.filter(v=>v.step===scene.step).length} / 3`);
  say(`${scene.age}살. ${scene.title}. ${scene.text}`);
}
function layoutNodes() {
  nodes=LANDMARKS;
  if(view==='afterlife')layoutStars();
}
function goToPlace(i){if(anyDialog())return;target={...nodes[i],index:i};text('travel-hint',`${scene.places[i]}에 가는 중 · 방향키로 언제든 다른 곳에 갈 수 있어요.`);}
function openPlace(index) {
  if(view!=='living'||anyDialog())return;
  activePlace=index;target=null;lastNear=index;
  text('visit-title',scene.places[index]);text('visit-note','잠깐 머물거나, 이곳에서 앞으로의 삶을 골라보세요.');
  $('visit-moment').replaceChildren();$('visit-choices').replaceChildren();
  const moment=currentDetour(life,index);
  if(moment){
    $('visit-moment').append(element('small','eyebrow','나이를 넘기지 않는 작은 만남'),element('h3','',moment.title),element('p','',moment.text));
    moment.choices.forEach(c=>{const b=element('button','moment-action',`${c.title} →`);b.onclick=()=>{selected={...c,detour:index};closeDialog('visit-dialog');openChoice();};$('visit-moment').append(b);});
  } else {
    $('visit-moment').append(element('small','eyebrow','이곳에서 기억한 순간'),element('p','',derive(life).detours.find(r=>r.step===scene.step&&r.place===index)?.memory||'마음에 남은 이야기를 기억장에 적어 두었습니다.'));
  }
  const groups=[
    [[0,1],[3,4],[2,5]],[[3,4],[0,1],[2,5]],[[0,2],[1,3],[4,5]],
    [[0,1],[2,3],[4,5]],[[0,2],[1,3],[4,5]],[[0,1],[3,4],[2,5]],
    [[0,2],[1,3],[4,5]],[[0,3],[1,5],[2,4]],[[0,1],[2,4],[3,5]]
  ];
  groups[scene.step][index].forEach(i=>{const c=scene.choices[i];if(!c)return;const b=element('button','life-option');b.style.setProperty('--node',PALETTE[c.tag]);b.append(element('small','',c.who),element('strong','',c.title),element('span','',c.detail));b.onclick=()=>{closeDialog('visit-dialog');inspect(i);};$('visit-choices').append(b);});
  showDialog('visit-dialog');
}
function renderRelations() {
  const s=scene.state, cast=castFor(life), items=[['어머니',scene.age>=64?'기억 속에서':'익숙한 온기','care'],[cast.friend,s.friend>=3?'다시 닿은 마음':s.distance?'멀리 있는 인연':'알아가는 사이','bond']];
  if(s.companion)items.push([s.companion>1?cast.companion:'가족',s.companion>1?'일상을 묻는 사이':'곁을 나누는 사람','bond']);
  if(s.child)items.push([scene.age>=75?'아이와 손주':'아이','이어지는 시간','care']);
  $('relations').replaceChildren(...items.map(([name,status,tag])=>{const el=element('span','relation',name);el.style.setProperty('--node',PALETTE[tag]);el.append(element('small','',status));return el;}));
}
function inspect(index) {
  if(view!=='living'||anyDialog())return;
  selected=scene.choices[index];lastNear=index;target=null;
  openChoice();
}
function openChoice(){
  text('choice-who',`${scene.age}살 · ${selected.who}`);text('choice-title',selected.title);text('choice-text',selected.detail);
  text('choice-note',selected.detour!==undefined?'이 작은 만남 뒤에는 같은 나이로 돌아옵니다. 다른 장소도 계속 둘러볼 수 있어요.':'이 선택은 이 시기를 마무리하고 다음 나이로 이어집니다. 아직 다른 장소를 둘러봐도 괜찮아요.');
  text('choose-path',selected.detour!==undefined?'이 순간에 머무르기 →':'이 삶을 선택하고 다음 시기로 →');
  $('choice-art').innerHTML=illustration(selected.tag,scene.age);
  showDialog('choice-dialog');
}
function commitChoice() {
  if(!selected || !scene || view!=='living')return;
  const chosen=selected; selected=null;
  if(chosen.detour!==undefined){
    life=explore(life,chosen.detour,chosen.id);persist();closeDialog('choice-dialog');playChord(chosen.tag);
    showMemory(derive(life).detours.at(-1),'wander');return;
  }
  try { life=advance(life,scene.id,chosen.id); } catch { closeDialog('choice-dialog');startScene();return; }
  persist();closeDialog('choice-dialog');
  playChord(chosen.tag);showMemory(derive(life).records.at(-1),'continue');
}
function showMemory(record, mode='read') {
  memoryMode=mode;
  text('memory-meta',`${record.age}살 · ${record.who}`);text('memory-title',record.title);
  text('memory-content',record.memory);text('memory-echo',record.echo);
  $('memory-turn').hidden=!record.turn;text('memory-turn',record.turn?`✧ ${record.turn}`:'');
  $('memory-art').innerHTML=illustration(record.tag,record.age);
  $('memory-next').replaceChildren(document.createTextNode(mode==='continue'?(life.choices.length===9?'나의 삶을 별로 남기기':'삶은 계속 흘러갑니다'):mode==='wander'?'같은 하루, 다른 곳으로 걸어가기':'기억에서 돌아가기'),element('span','',mode==='continue'?'→':'↩'));
  showDialog('memory-dialog');say(`${record.title}. ${record.memory}`);
}
function finishMemory() {closeDialog('memory-dialog');if(memoryMode==='continue')startScene();else if(memoryMode==='wander')startScene(true);}
function showEnding() {
  displaySummary=summarize(life); setView('afterlife');
  text('ending-name',displaySummary.title);text('ending-line',displaySummary.line);text('download-status','');
  $('memory-stars').replaceChildren();
  displaySummary.records.forEach((r,i)=>{const b=element('button','memory-star');b.style.setProperty('--node',PALETTE[r.tag]);b.setAttribute('aria-label',`${r.age}살의 기억: ${r.title}`);b.append(element('span','','✦'),element('small','',`${r.age}살`),element('strong','',r.title));b.onclick=()=>showMemory(r);$('memory-stars').append(b);});
  layoutStars();say(`당신이 남긴 별. ${displaySummary.title}. 별을 눌러 기억을 돌아볼 수 있습니다.`);
}
function layoutStars() {
  if(!displaySummary)return;
  const pts=constellationPoints(displaySummary.records,displaySummary.seed);
  starNodes=pts.map(p=>({x:.5+p.x*(mobile?.36:.29),y:(mobile?.505:.48)+p.y*(mobile?.14:.20),tag:p.tag}));
  [...$('memory-stars').children].forEach((b,i)=>{b.style.left=`${starNodes[i].x*100}%`;b.style.top=`${starNodes[i].y*100}%`;});
}
function showInheritance() {
  displaySummary=summarize(life);const gift=GIFTS[displaySummary.gift]; setView('inheritance');newGenerationAt=now;
  text('descendant-text',`당신이 남긴 ${gift.object}${['dream','bond'].includes(displaySummary.gift)?'를':'을'} 품고, 손주는 또 다른 하루를 맞습니다. 아직 누구를 만나고 어디로 갈지는 알 수 없습니다. 다만 그 아이의 첫 하늘에는, 당신이 살다 간 빛이 있습니다.`);
  text('heirloom-symbol',gift.symbol);text('heirloom-title',gift.title);text('heirloom-line',gift.line);
  say('당신의 별 아래, 또 하나의 시작. 마지막에 남긴 물건을 손주가 이어받습니다.');
}
function beginDescendant() {
  if(view!=='inheritance'||life.choices.length!==9)return;
  life=nextGeneration(life,seed());persist();newGenerationAt=now;displaySummary=null;startScene();
}
function showJournal() {
  $('ancestor-list').replaceChildren();
  const ordered=(records,detours=[])=>[...records,...detours].sort((a,b)=>a.age-b.age||(a.place!==undefined?-1:1));
  const entries=(life?.ancestors||[]).map((a,i)=>({name:`${i+1}번째 삶 · ${a.title}`,records:ordered(a.records,a.detours),summary:a}));
  entries.push({name:life?.ancestors.length?`${life.ancestors.length+1}번째 삶 · 지금의 나`:'지금의 나',records:life?ordered(derive(life).records,derive(life).detours):[]});
  entries.forEach((entry,i)=>{const b=element('button','ancestor-chip',entry.name);b.onclick=()=>selectJournal(i);$('ancestor-list').append(b);});
  function selectJournal(index) {
    [...$('ancestor-list').children].forEach((el,i)=>{el.classList.toggle('active',i===index);el.setAttribute('aria-pressed',String(i===index));});
    const entry=entries[index];$('journal-records').replaceChildren();
    if(entry.summary){const p=element('p','journal-intro',`${entry.summary.line} 남긴 것: ${GIFTS[entry.summary.gift].title}.`);$('journal-records').append(p);}
    if(!entry.records.length){$('journal-records').append(element('p','empty-journal','아직 쓰이지 않은 시간입니다. 첫 만남을 향해 걸어가 보세요.'));return;}
    entry.records.forEach(r=>{const article=element('article','journal-entry');article.append(element('small','',`${r.age}살 · ${r.place!==undefined?'산책 중 만난 순간 · ':''}${r.who}`),element('h3','',r.title),element('p','',r.memory));$('journal-records').append(article);});
  }
  selectJournal(entries.length-1);showDialog('journal-dialog');
}

// The illustrations are drawn for this game, without external artwork or fonts.
function illustration(tag,age) {
  const c=PALETTE[tag];
  const starsSvg=Array.from({length:20},(_,i)=>`<circle cx="${25+chance(age,i)*500}" cy="${8+chance(age,i+50)*91}" r="${i%4===0?1.4:.6}" fill="${c}" opacity="${.2+chance(age,i+2)*.5}"/>`).join('');
  const shapes={
    bond:'<path d="M219 78V40q0-5 5-5h102q5 0 5 5v38z" fill="#c7dfdf12" stroke="currentColor"/><path d="m219 36 56 35 56-35M219 78l34-27m78 27-34-27" fill="none" stroke="currentColor" opacity=".7"/><path d="M170 64q22-23 40-9M343 48q26-7 42 13" fill="none" stroke="currentColor" stroke-dasharray="2 5"/><circle cx="176" cy="63" r="3" fill="currentColor"/><circle cx="382" cy="60" r="3" fill="currentColor"/>',
    dream:'<path d="M195 50q40-20 80 0t80 0M195 59q40-20 80 0t80 0M195 68q40-20 80 0t80 0" stroke="currentColor" stroke-width=".7" opacity=".3" fill="none"/><path d="M258 69V31l35-7v37M258 37l35-7" stroke="currentColor" stroke-width="2" fill="none"/><ellipse cx="251" cy="70" rx="8" ry="5" transform="rotate(-20 251 70)" fill="currentColor"/><ellipse cx="286" cy="62" rx="8" ry="5" transform="rotate(-20 286 62)" fill="currentColor"/><path d="m330 26 2-6 2 6 6 2-6 2-2 6-2-6-6-2z" fill="currentColor"/>',
    care:'<path d="M269 85q8-35 3-55" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M273 61q-31 0-34-27 30-1 34 27M273 48q27-1 30-25-26 0-30 25" fill="#c9dcbc12" stroke="currentColor"/><path d="M236 84q39-10 77 0" stroke="currentColor" opacity=".4" fill="none"/><circle cx="226" cy="25" r="2" fill="currentColor"/><circle cx="322" cy="47" r="1" fill="currentColor"/>',
    self:'<path d="M180 85 242 33 285 75 312 46 370 85" fill="#dcdcc40a" stroke="currentColor" stroke-width=".8"/><path d="m224 49 18-16 15 15-16-7z" fill="currentColor" opacity=".35"/><circle cx="303" cy="24" r="11" fill="#dcdcc40d" stroke="currentColor"/><path d="M267 80q-15 4-4 10t-4 12" fill="none" stroke="currentColor" opacity=".5"/>'
  };
  return `<svg viewBox="0 0 550 112" xmlns="http://www.w3.org/2000/svg" style="color:${c}">${starsSvg}<path d="M0 108q100-32 180-10t190-5 180 12" fill="#08172544"/>${shapes[tag]}</svg>`;
}

// Canvas: a slowly moving landscape, the paths we share, and the sky we leave.
function resize() {
  const oldMobile=mobile; W=innerWidth;H=innerHeight;mobile=W<=760;
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  layoutNodes();if(oldMobile!==mobile&&view==='living')target=null;
}
function glow(x,y,r,color,alpha=1) {
  const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+'80');g.addColorStop(.25,color+'25');g.addColorStop(1,color+'00');ctx.globalAlpha=alpha;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.globalAlpha=1;
}
function point(x,y,r,color,bright=true) {if(bright)glow(x,y,r*7,color,.65);ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}
function ribbon(x1,y1,x2,y2,color,width=1,opacity=.35,curve=0) {
  ctx.strokeStyle=color;ctx.globalAlpha=opacity;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1*W,y1*H);
  ctx.bezierCurveTo((x1+curve)*W,(y1*.35+y2*.65)*H,(x2-curve)*W,(y1*.65+y2*.35)*H,x2*W,y2*H);ctx.stroke();ctx.globalAlpha=1;
}
function landscape() {
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0a1223');bg.addColorStop(.53,'#11263b');bg.addColorStop(.83,'#203947');bg.addColorStop(1,'#102334');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  glow(W*.78,H*.22,W*.43,'#527a9c',.26);glow(W*.38,H*.66,W*.38,'#9c786d',.13);
  stars.forEach((s,i)=>{if(s.y>.83)return;ctx.globalAlpha=(.25+.40*(reduced.matches?.5:(1+Math.sin(now*.25+s.phase))/2));ctx.fillStyle=i%7===0?'#c6b6e2':'#c1d2e4';ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
  const mx=W*(view==='living'?.77:mobile?.85:.84),my=H*(mobile?.16:.23);glow(mx,my,42,'#d8dfd6',.3);ctx.fillStyle='#b9c6c5';ctx.beginPath();ctx.arc(mx,my,11,0,6.29);ctx.fill();ctx.fillStyle='#14283a';ctx.beginPath();ctx.arc(mx+5,my-3,10.5,0,6.29);ctx.fill();
  for(let k=0;k<3;k++) {
    ctx.fillStyle=['#213c49','#182f40','#0e2334'][k];ctx.beginPath();ctx.moveTo(0,H);
    for(let x=0;x<=W+10;x+=10){const y=H*(.84+k*.035)+Math.sin(x/W*8+k*2)*H*.025+Math.sin(x/W*19+k)*H*.012;ctx.lineTo(x,y);}ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  }
  // A small house, with one window still lit, places the distant sky in everyday life.
  const hx=W*(mobile?.80:.73),hy=H*.884,hs=mobile?.7:1;ctx.save();ctx.translate(hx,hy);ctx.scale(hs,hs);ctx.fillStyle='#122736';ctx.fillRect(-12,-16,25,18);ctx.beginPath();ctx.moveTo(-17,-16);ctx.lineTo(0,-29);ctx.lineTo(18,-16);ctx.fill();glow(2,-8,17,'#dcb67c',.55);ctx.fillStyle='#d1b581';ctx.fillRect(-1,-11,5,6);ctx.restore();
  if(view==='living'&&scene?.kind==='우연'&&(scene.id.includes('rain')||scene.id==='returned-letter')&&!reduced.matches) {
    ctx.strokeStyle='#a6c4d1';ctx.lineWidth=.6;ctx.globalAlpha=.07;
    for(let i=0;i<30;i++){const x=(chance(520,i)*W-now*20+i*30)%W,y=(chance(419,i)*H+now*110)%H;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+17);ctx.stroke();}ctx.globalAlpha=1;
  }
}
function drawSmallConstellation(a,x,y,scale,alpha=.42) {
  const pts=constellationPoints(a.records,a.seed);ctx.globalAlpha=alpha;ctx.strokeStyle=PALETTE[a.tag];ctx.lineWidth=.7;
  ctx.beginPath();pts.forEach((p,i)=>{const px=x+p.x*scale,py=y+p.y*scale*.65;i?ctx.lineTo(px,py):ctx.moveTo(px,py);});ctx.stroke();
  pts.forEach((p,i)=>{ctx.fillStyle=PALETTE[p.tag];ctx.beginPath();ctx.arc(x+p.x*scale,y+p.y*scale*.65,i===0?2:1.1,0,6.29);ctx.fill();});ctx.globalAlpha=1;
}
function drawAncestors() {
  const list=life?.ancestors.slice(-5)||[];
  list.forEach((a,i)=>drawSmallConstellation(a,W*(.5+(i-(list.length-1)/2)*.115),H*.15,Math.min(45,W*.045),view==='living'?.34:.18));
  if(list.length&&view==='living'&&!mobile){ctx.fillStyle='#a7b3c476';ctx.font='9px "Malgun Gothic", sans-serif';ctx.textAlign='center';ctx.fillText('먼저 살다 간 빛',W*.5,H*.235);}
}
function drawWelcome() {
  const shift=mobile?-.05:0, fade=mobile?.50:.8;
  const lines=[['#e9ce99',.66,.93,.73,.20,.19],['#9fd7d9',.88,.91,.63,.27,-.18],['#b6a9de',.56,.94,.79,.36,.17],['#e1a99b',.84,.96,.66,.43,-.16]];
  lines.forEach(([color,x1,y1,x2,y2,curve],i)=>{ribbon(x1+shift,y1,x2+shift,y2,color,12,.012,curve);ribbon(x1+shift,y1,x2+shift,y2,color,1,fade*.44,curve);point((x2+shift)*W,y2*H,2.2,color);});
  const t=reduced.matches?.55:(Math.sin(now*.12)+1)/2;
  point((.70+shift+Math.sin(t*3.14)*.025)*W,(.55+t*.08)*H,3.3,'#f5dfad');
  glow((.72+shift)*W,H*.37,90,'#d2bc8f',.35);
  ctx.strokeStyle='#d8cbad66';ctx.lineWidth=.65;const dots=[[.67,.27],[.74,.22],[.81,.31],[.77,.42],[.68,.38]];
  ctx.beginPath();dots.forEach(([x,y],i)=>{i?ctx.lineTo((x+shift)*W,y*H):ctx.moveTo((x+shift)*W,y*H);});ctx.stroke();dots.forEach(([x,y])=>point((x+shift)*W,y*H,1.7,'#e8d3a6'));
}
function drawLiving() {
  if(!scene)return;
  camera=cameraFor(player,W,H);
  ctx.save();ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y);
  const land=ctx.createLinearGradient(0,120,1500,1100);land.addColorStop(0,'#203e48');land.addColorStop(1,'#183b40');
  ctx.fillStyle=land;ctx.strokeStyle='#56828466';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(70,160);ctx.bezierCurveTo(450,15,1400,50,1525,280);ctx.bezierCurveTo(1710,670,1500,1040,1250,1050);ctx.bezierCurveTo(860,1150,100,1040,65,810);ctx.bezierCurveTo(-15,590,30,320,70,160);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#b9b89a17';ctx.lineWidth=36;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(390,470);ctx.bezierCurveTo(550,200,990,160,1130,350);ctx.bezierCurveTo(1340,570,1250,790,1050,870);ctx.bezierCurveTo(730,980,360,800,390,470);ctx.stroke();
  ctx.lineWidth=1;ctx.strokeStyle='#c9c8ac30';ctx.stroke();
  ctx.strokeStyle='#80a5ac28';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(30,930);ctx.bezierCurveTo(480,800,630,670,620,90);ctx.stroke();
  for(let i=0;i<42;i++){
    const x=130+chance(601,i)*1330,y=155+chance(777,i)*825;
    if(LANDMARKS.some(n=>Math.hypot(x-n.x,y-n.y)<160)||Math.hypot(x-SPAWN.x,y-SPAWN.y)<120)continue;
    ctx.strokeStyle='#b1b99b25';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-22);ctx.stroke();
    ctx.fillStyle=i%3===0?'#49665a88':'#35584d';ctx.beginPath();ctx.ellipse(x,y-30,18+i%9,24,0,0,6.29);ctx.fill();
  }
  nodes.forEach((n,i)=>{
    const color=PALETTE[scene.choices[i].tag],x=n.x-62,y=n.y-20;
    glow(n.x,n.y,145,color,.18);
    ctx.fillStyle='#0f2934';ctx.fillRect(x-28,y-32,56,42);ctx.strokeStyle='#a3b9b657';ctx.lineWidth=1;ctx.strokeRect(x-28,y-32,56,42);
    ctx.fillStyle=['#597369','#657480','#777563'][i];ctx.beginPath();ctx.moveTo(x-36,y-32);ctx.lineTo(x,y-61);ctx.lineTo(x+36,y-32);ctx.fill();
    ctx.fillStyle=color;ctx.globalAlpha=.7;ctx.fillRect(x-15,y-20,10,12);ctx.fillRect(x+5,y-20,10,12);ctx.globalAlpha=1;
    ctx.strokeStyle=color+'44';ctx.beginPath();ctx.ellipse(n.x,n.y+28,85,38,0,0,6.29);ctx.stroke();
  });
  if(trail.length>1){ctx.lineWidth=1.6;ctx.strokeStyle='#edcf9777';ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}
  if(target){ctx.strokeStyle='#e9d2a033';ctx.setLineDash([3,8]);ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(target.x,target.y);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e9d2a077';ctx.beginPath();ctx.arc(target.x,target.y,9,0,6.29);ctx.stroke();}
  glow(player.x,player.y,32,'#f3d39e',.9);point(player.x,player.y,4,'#f9e7c1',false);
  ctx.strokeStyle='#eddaa977';ctx.lineWidth=1;ctx.beginPath();ctx.arc(player.x,player.y,12,0,6.29);ctx.stroke();ctx.restore();
  [...$('paths').children].forEach((b,i)=>{const p=project(nodes[i],camera);b.style.left=`${p.x}px`;b.style.top=`${p.y-72*camera.zoom}px`;b.hidden=p.x<70||p.x>W-70||p.y<(mobile?H*.39:210)||p.y>H-95;});
  const near=nodes.findIndex(n=>Math.hypot(n.x-player.x,n.y-player.y)<115);
  $('nearby-place').hidden=near<0;
  if(near>=0){text('nearby-place',`${scene.places[near]} 둘러보기 · E`);$('nearby-place').onclick=()=>openPlace(near);}
  text('position-label',`나의 발걸음 ${Math.round(player.x)}, ${Math.round(player.y)}`);
  $('map-player').setAttribute('cx',String(player.x/10));$('map-player').setAttribute('cy',String(player.y/10));
}
function drawEnding() {
  if(!displaySummary)return;
  ctx.strokeStyle='#d2c29d60';ctx.lineWidth=1;ctx.beginPath();starNodes.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H-20):ctx.moveTo(p.x*W,p.y*H-20));ctx.stroke();
  const cx=W*.5,cy=H*(mobile?.505:.48)-20;glow(cx,cy,Math.min(W,H)*.23,'#a09abe',.14);
  starNodes.forEach((p,i)=>{if(i%3===0)ribbon(.5,cy/H,p.x,p.y-20/H,PALETTE[p.tag],.7,.17,.02);});
  point(cx,cy,3,'#f4dca7');
}
function drawInheritance() {
  if(!displaySummary)return;
  const x=W*(mobile?.78:.76),y=H*(mobile?.72:.30),size=Math.min(W*.13,125);
  drawSmallConstellation(displaySummary,x,y,size,.8);
  const end={x:mobile?.82:.76,y:mobile?.90:.72};
  ribbon(x/W,y/H,end.x,end.y,'#e4c998',1,.6,.04);
  const t=reduced.matches?1:Math.min(1,(now-newGenerationAt)/3.5),py=y+(H*end.y-y)*t;
  point(x+Math.sin(t*Math.PI)*W*.01,py,3,'#f4dca7');point(W*end.x,H*end.y,3.5,'#f9e4b3');
  if(!mobile){ctx.fillStyle='#b0b7c4';ctx.font='12px Batang,serif';ctx.textAlign='center';ctx.fillText('당신이 남긴 빛',x,y-size*.85);ctx.fillText('아직 쓰이지 않은 삶',W*end.x,H*end.y+40);}
}
function movePlayer(dt) {
  if(view!=='living'||anyDialog()||document.hidden)return;
  let dx=0,dy=0;
  if(keys.has('arrowleft')||keys.has('a'))dx--;if(keys.has('arrowright')||keys.has('d'))dx++;
  if(keys.has('arrowup')||keys.has('w'))dy--;if(keys.has('arrowdown')||keys.has('s'))dy++;
  if(dx||dy){target=null;player=walk(player,{x:dx,y:dy},dt);}
  else if(target){dx=target.x-player.x;dy=target.y-player.y;const len=Math.hypot(dx,dy);if(len<7){player=clampPoint(target);const index=target.index;target=null;if(index!==undefined)openPlace(index);return;}player=walk(player,{x:dx,y:dy},Math.min(dt,len/300));}
  else return;
  trail.push({...player});if(trail.length>700)trail.shift();
}
function frame(time) {
  const dt=Math.min((time-lastTime)/1000||0,.04);lastTime=time;
  if(!document.hidden && !anyDialog())now+=dt;
  movePlayer(dt);landscape();
  if(view==='welcome')drawWelcome();else if(view==='living')drawLiving();else if(view==='afterlife')drawEnding();else drawInheritance();
  drawAncestors();
  requestAnimationFrame(frame);
}

function playChord(tag='self') {
  if(!soundOn||document.hidden||$('pause-dialog').open||!soundContext)return;
  const freqs={self:[174.61,261.63,349.23],bond:[196,293.66,392],dream:[220,329.63,440],care:[164.81,246.94,329.63]};
  freqs[tag].forEach((f,i)=>{const osc=soundContext.createOscillator(),gain=soundContext.createGain();osc.type='sine';osc.frequency.value=f;osc.connect(gain);gain.connect(soundContext.destination);const t=soundContext.currentTime+i*.15;gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.018,t+.25);gain.gain.exponentialRampToValueAtTime(.0001,t+3.8);osc.start(t);osc.stop(t+4);});
}
async function toggleSound() {
  soundOn=!soundOn;
  if(soundOn){try{soundContext ||= new (window.AudioContext||window.webkitAudioContext)();await soundContext.resume();playChord();soundTimer=setInterval(()=>playChord(scene?.choices[0]?.tag||'self'),9000);}catch{soundOn=false;say('이 브라우저에서는 소리를 재생할 수 없습니다.');}}
  else {clearInterval(soundTimer);await soundContext?.suspend();}
  $('audio-button').setAttribute('aria-pressed',String(soundOn));$('audio-button').setAttribute('aria-label',soundOn?'소리 끄기':'소리 켜기');text('audio-button',soundOn?'♫':'♪');
}
function pause() {if(view==='living'&&!anyDialog()){showDialog('pause-dialog');soundContext?.suspend();}}
function unpause() {closeDialog('pause-dialog');if(soundOn)soundContext?.resume();}
async function exportSky() {
  if(!displaySummary)return;
  try {
    const out=document.createElement('canvas');out.width=1400;out.height=1600;const g=out.getContext('2d');
    const bg=g.createLinearGradient(0,0,1400,1600);bg.addColorStop(0,'#0b1427');bg.addColorStop(1,'#1a3545');g.fillStyle=bg;g.fillRect(0,0,1400,1600);
    stars.forEach(s=>{g.fillStyle='#b4c6df66';g.beginPath();g.arc(s.x*1400,s.y*1600,s.r,0,6.29);g.fill();});
    g.textAlign='center';g.fillStyle='#e9d2a0';g.font='23px "Malgun Gothic",sans-serif';g.fillText(`THE LIGHT WE LEAVE · ${displaySummary.generation}번째 생애`,700,170);
    g.fillStyle='#f2ede1';g.font='65px Batang,serif';g.fillText('당신이 남긴 별',700,280);
    const pts=constellationPoints(displaySummary.records,displaySummary.seed).map(p=>({x:700+p.x*465,y:750+p.y*360,tag:p.tag}));
    g.strokeStyle='#d7c59b80';g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();
    pts.forEach((p,i)=>{g.shadowColor=PALETTE[p.tag];g.shadowBlur=28;g.fillStyle=PALETTE[p.tag];g.beginPath();g.arc(p.x,p.y,7,0,6.29);g.fill();g.shadowBlur=0;g.font='19px "Malgun Gothic",sans-serif';g.fillStyle='#b7c8dd';g.fillText(`${displaySummary.records[i].age}살`,p.x,p.y+37);});
    g.fillStyle='#ead2a1';g.font='39px Batang,serif';g.fillText(displaySummary.title,700,1240);g.fillStyle='#bdc9d9';g.font='22px "Malgun Gothic",sans-serif';
    const line=displaySummary.line;const parts=line.length>42?line.split('. ').map((s,i,a)=>s+(i<a.length-1?'.':'')):[line];parts.forEach((s,i)=>g.fillText(s,700,1310+i*38));
    const gift=GIFTS[displaySummary.gift];g.fillStyle='#b6a88d';g.font='20px "Malgun Gothic",sans-serif';g.fillText(`다음 삶에 남긴 것 · ${gift.title}`,700,1460);
    const blob=await new Promise(resolve=>out.toBlob(resolve,'image/png'));if(!blob)throw new Error('Image unavailable');
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`우리가-남긴-별-${displaySummary.generation}번째-삶.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);text('download-status','별자리 이미지 다운로드를 시작했습니다.');
  }catch{text('download-status','이미지를 저장하지 못했습니다. 브라우저의 다운로드 설정을 확인해 주세요.');}
}

$('begin').onclick=()=>{if(view!=='welcome'||anyDialog())return;if(unreadableSave!==null || life&&(life.choices.length||life.ancestors.length))showRestartDialog();else beginFresh();};
$('restart-confirm').onclick=()=>{if(view!=='welcome'||!$('restart-dialog').open)return;if(beginFresh(true))closeDialog('restart-dialog');};$('restart-cancel').onclick=()=>closeDialog('restart-dialog');
$('download-old-save').onclick=downloadOldSave;
$('resume-life').onclick=()=>{if(life)startScene();};
$('close-choice').onclick=$('explore-paths').onclick=()=>{closeDialog('choice-dialog');text('travel-hint','다른 빛을 살펴보거나, 마음이 향한 길을 골라보세요.');};
$('choose-path').onclick=commitChoice;$('memory-next').onclick=finishMemory;
$('pass-light').onclick=showInheritance;$('descendant-begin').onclick=beginDescendant;$('back-ending').onclick=showEnding;
$('export-sky').onclick=exportSky;$('journal-button').onclick=showJournal;$('close-journal').onclick=()=>closeDialog('journal-dialog');
$('audio-button').onclick=toggleSound;$('help-button').onclick=()=>showDialog('help-dialog');
$('close-help').onclick=$('help-done').onclick=()=>closeDialog('help-dialog');$('pause-button').onclick=pause;$('unpause').onclick=unpause;
$('pause-dialog').addEventListener('cancel',e=>{e.preventDefault();unpause();});
$('memory-dialog').addEventListener('cancel',e=>{e.preventDefault();finishMemory();});
document.addEventListener('keydown',e=>{
  if(anyDialog())return;
  if(e.key==='Escape'){pause();return;}
  if(e.key.toLowerCase()==='e'&&view==='living'){const near=nodes.findIndex(n=>Math.hypot(n.x-player.x,n.y-player.y)<115);if(near>=0){e.preventDefault();openPlace(near);}return;}
  const k=e.key.toLowerCase();if(view==='living'&&['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'].includes(k)){e.preventDefault();keys.add(k);}
});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown',e=>{if(view!=='living'||anyDialog())return;target=unproject({x:e.clientX,y:e.clientY},camera);lastNear=-1;text('travel-hint','가고 싶은 곳 어디든. 가까운 장소에서는 E로 이야기를 열어요.');});
$('close-visit').onclick=$('keep-walking').onclick=()=>closeDialog('visit-dialog');
for(const b of document.querySelectorAll('[data-walk]')){
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.walk);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.walk));
}
window.addEventListener('blur',()=>{keys.clear();pause();});
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden){pause();soundContext?.suspend();}else if(soundOn&&!$('pause-dialog').open)soundContext?.resume();});
window.addEventListener('resize',resize);
window.addEventListener('storage',e=>{if(e.key===SAVE&&e.newValue!==JSON.stringify(life)){say('다른 창에서 진행이 바뀌었습니다. 이 창의 진행은 유지되며 다음 선택이 현재 저장을 갱신합니다.');text('storage-notice','다른 창에서도 이야기가 진행되고 있습니다. 저장이 덮이지 않도록 한 창에서 이어가 주세요.');}});
safeLoad();resize();requestAnimationFrame(frame);
