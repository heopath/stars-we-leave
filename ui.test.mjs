import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as engine from './dist/life.mjs';
import * as world from './dist/world.mjs';

const SAVE = 'stars-we-leave:lineage:v2';
const source = readFileSync(new URL('./dist/experience.mjs', import.meta.url), 'utf8').replace(/^import .*?;\r?\n/gm, '');
const html = readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8');

// Runs the real UI handlers with a minimal DOM. This is not browser/layout QA.
function harness(raw = null, options = {}) {
  const data = new Map(Object.entries(options.extra || {}));
  if (raw !== null) data.set(SAVE, raw);
  const writes = [], downloads = [], nodes = new Map();
  let randomCalls = 0;
  function node(tag = 'div') {
    return { tag, open:false, hidden:false, textContent:'', children:[],
      style:{setProperty(){}}, classList:{toggle(){}}, attributes:{},
      setAttribute(k,v){this.attributes[k]=v;}, addEventListener(){},
      append(...items){this.children.push(...items);},
      replaceChildren(...items){this.children=items;},
      showModal(){this.open=true;}, close(){this.open=false;},
      click(){downloads.push({name:this.download,href:this.href});},
      getContext(){return {setTransform(){}};}
    };
  }
  for (const [,id] of html.matchAll(/id="([^"]+)"/g)) nodes.set(id,node());
  const storage = {
    getItem(key) {
      if(options.failRead && key===SAVE)throw new Error('Storage read denied');
      if(options.failVerification && key.startsWith(SAVE+':unreadable-backup:') && data.has(key))return null;
      return data.has(key)?data.get(key):null;
    },
    setItem(key,value) {
      if(options.failAllWrites || options.failBackup && key!==SAVE || options.failMainWrite && key===SAVE)throw new Error('Storage full');
      value=String(value);writes.push([key,value]);data.set(key,value);
    }
  };
  const document = {
    hidden:false,
    getElementById(id){assert.ok(nodes.has(id),`Unknown element: ${id}`);return nodes.get(id);},
    querySelectorAll(selector){if(selector==='[data-walk]')return [];return [...nodes].filter(([id])=>selector==='dialog'?id.endsWith('-dialog'):['welcome','living','afterlife','inheritance'].includes(id)).map(([,n])=>n);},
    createElement:node,createTextNode:text=>({textContent:text}),addEventListener(){}
  };
  const blobs = [];
  const context = vm.createContext({
    ...engine,...world,document,localStorage:storage,innerWidth:1280,innerHeight:720,devicePixelRatio:1,
    window:{addEventListener(){}},matchMedia:()=>({matches:false}),requestAnimationFrame(){},
    crypto:{getRandomValues(a){a[0]=100+(++randomCalls);return a;}},structuredClone,
    Date:{now:()=>12345},Blob,
    URL:{createObjectURL(blob){blobs.push(blob);return 'blob:test';},revokeObjectURL(){}},
    setTimeout(){},setInterval(){},clearInterval(){}
  });
  vm.runInContext(source+`\nglobalThis.check = {
    getLife:()=>life, getView:()=>view, persist,
    chooseFirst:()=>{const e=currentScene(life);life=advance(life,e.id,e.choices[0].id);persist();}
  };`,context);
  return {data,writes,downloads,blobs,nodes,click:id=>nodes.get(id).onclick(),check:context.check,randomCalls:()=>randomCalls};
}

test('unreadable saves, including empty values, require confirmation and survive cancellation',()=>{
  for(const raw of ['{broken','',JSON.stringify({version:1,choices:[]}),JSON.stringify({...engine.newLife(9),choices:['unknown']})]) {
    const h=harness(raw);assert.equal(h.writes.length,0);
    h.click('begin');assert.equal(h.nodes.get('restart-dialog').open,true);
    assert.equal(h.nodes.get('download-old-save').hidden,false);
    assert.match(h.nodes.get('restart-message').textContent,/읽을 수 없는 이전 기록/);
    assert.equal(h.data.get(SAVE),raw);assert.equal(h.writes.length,0);
    h.click('restart-cancel');h.click('restart-confirm');
    assert.equal(h.writes.length,0);assert.equal(h.check.getLife(),null);
    h.click('begin');h.nodes.get('restart-dialog').close();h.click('restart-confirm');
    assert.equal(h.writes.length,0);assert.equal(h.data.get(SAVE),raw);
  }
});

test('confirmed restart preserves exact original bytes before saving a valid new life',()=>{
  for(const raw of ['{broken','']) {
    const h=harness(raw);h.click('begin');h.click('restart-confirm');
    assert.equal(h.writes.length,2);assert.match(h.writes[0][0],/:unreadable-backup:/);
    assert.equal(h.writes[0][1],raw);assert.equal(h.data.get(h.writes[0][0]),raw);
    assert.equal(h.writes[1][0],SAVE);assert.ok(engine.deserialize(h.data.get(SAVE)));
    assert.equal(h.check.getView(),'living');assert.equal(h.nodes.get('restart-dialog').open,false);
    assert.match(h.nodes.get('storage-notice').textContent,/별도 백업으로 보관했습니다/);
  }
});

test('an existing backup is not replaced when backup names collide',()=>{
  const key=SAVE+':unreadable-backup:12345';
  const h=harness('{new broken',{extra:{[key]:'older backup'}});h.click('begin');h.click('restart-confirm');
  assert.equal(h.data.get(key),'older backup');assert.equal(h.data.get(key+':1'),'{new broken');
});

test('backup write or verification failure blocks restart and keeps the original save',()=>{
  for(const option of ['failBackup','failVerification']) {
    const h=harness('{broken',{[option]:true});h.click('begin');h.click('restart-confirm');
    assert.equal(h.data.get(SAVE),'{broken');assert.equal(h.check.getLife(),null);
    assert.equal(h.check.getView(),'welcome');assert.equal(h.nodes.get('restart-dialog').open,true);
    assert.ok(!h.writes.some(([key])=>key===SAVE));
    assert.match(h.nodes.get('restart-status').textContent,/새로 시작하지 않았습니다/);
  }
});

test('a changed save is not overwritten by a stale corrupt-save confirmation',()=>{
  const h=harness('{broken');h.click('begin');const newer=JSON.stringify(engine.newLife(321));
  h.data.set(SAVE,newer);h.click('restart-confirm');
  assert.equal(h.writes.length,0);assert.equal(h.data.get(SAVE),newer);
  assert.match(h.nodes.get('restart-status').textContent,/다른 창/);
});
test('backup success followed by a failed main write preserves both copies and warns honestly',()=>{
  const h=harness('{broken',{failMainWrite:true});h.click('begin');h.click('restart-confirm');
  assert.equal(h.writes.length,1);assert.match(h.writes[0][0],/:unreadable-backup:/);
  assert.equal(h.data.get(h.writes[0][0]),'{broken');assert.equal(h.data.get(SAVE),'{broken');
  assert.equal(h.check.getView(),'living');assert.match(h.nodes.get('storage-notice').textContent,/저장하지 못했습니다/);
  h.check.chooseFirst();assert.equal(h.data.get(SAVE),'{broken');
});

test('download offers the exact unreadable contents without changing storage',async()=>{
  const raw='{broken 한국어\n';const h=harness(raw);h.click('begin');h.click('download-old-save');
  assert.equal(await h.blobs[0].text(),raw);assert.equal(h.downloads.length,1);
  assert.equal(h.writes.length,0);assert.equal(h.data.get(SAVE),raw);
  assert.match(h.nodes.get('restart-status').textContent,/다운로드를 시작/);
});

test('repeated Start or confirmation invokes only one fresh life',()=>{
  const empty=harness();empty.click('begin');empty.click('begin');
  assert.equal(empty.randomCalls(),1);assert.equal(empty.writes.length,1);
  const corrupt=harness('{broken');corrupt.click('begin');corrupt.click('begin');
  corrupt.click('restart-confirm');corrupt.click('restart-confirm');corrupt.click('begin');
  assert.equal(corrupt.randomCalls(),1);assert.equal(corrupt.writes.length,2);
});

test('valid in-progress save still resumes unchanged and requires confirmation before restart',()=>{
  const life=engine.advance(engine.newLife(44),'paper-plane','friend');const raw=JSON.stringify(life);
  const h=harness(raw);h.click('begin');assert.equal(h.nodes.get('restart-dialog').open,true);
  assert.equal(h.nodes.get('download-old-save').hidden,true);assert.equal(h.writes.length,0);
  h.click('restart-cancel');h.click('resume-life');
  assert.equal(h.check.getView(),'living');assert.equal(h.data.get(SAVE),raw);assert.equal(h.writes.length,0);
});

test('unknown storage stays protected during session-only play and later choices',()=>{
  const h=harness('unread original',{failRead:true});h.click('begin');h.check.chooseFirst();h.check.persist();
  assert.equal(h.check.getView(),'living');assert.equal(h.check.getLife().choices.length,1);
  assert.equal(h.writes.length,0);assert.equal(h.data.get(SAVE),'unread original');
  assert.match(h.nodes.get('storage-notice').textContent,/덮어쓰지 않습니다/);
});

test('ordinary write failure still allows play with a truthful no-save warning',()=>{
  const h=harness(null,{failAllWrites:true});h.click('begin');h.check.chooseFirst();
  assert.equal(h.check.getView(),'living');assert.equal(h.check.getLife().choices.length,1);
  assert.equal(h.writes.length,0);assert.match(h.nodes.get('storage-notice').textContent,/저장하지 못했습니다/);
});
