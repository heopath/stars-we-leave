import test from 'node:test';
import assert from 'node:assert/strict';
import {AGES, PALETTE, GIFTS, chance, castFor, newLife as freshLife, currentScene, advance, derive, summarize, nextGeneration, deserialize, constellationPoints} from './dist/life.mjs';

const newLife = (seed,ancestors=[])=>freshLife(seed,ancestors,2);
function choose(life,id) { return advance(life,currentScene(life).id,id); }
function through(seed,choices) { let life=newLife(seed); for(const id of choices)life=choose(life,id);return life; }
function finish(life,index=0) { while(currentScene(life))life=choose(life,currentScene(life).choices[index].id);return life; }

test('every one of the 19,683 choice routes reaches a coherent nine-memory ending',()=>{
  let count=0;const titles=new Set(),gifts=new Set();
  function visit(life) {
    const scene=currentScene(life);
    if(!scene){const end=summarize(life);assert.equal(end.records.length,9);assert.deepEqual(end.records.map(r=>r.age),AGES);assert.ok(Object.hasOwn(GIFTS,end.gift));assert.ok(Object.hasOwn(PALETTE,end.tag));assert.deepEqual(derive(deserialize(JSON.stringify(life))).records,end.records);titles.add(end.title);gifts.add(end.gift);count++;return;}
    assert.equal(scene.choices.length,3);assert.equal(new Set(scene.choices.map(c=>c.id)).size,3);
    for(const c of scene.choices){assert.ok(c.detail&&c.memory&&c.echo);visit(advance(life,scene.id,c.id));}
  }
  visit(newLife(73921));assert.equal(count,3**9);assert.equal(titles.size,4);assert.equal(gifts.size,4);
});
test('random events vary between lives and stay identical after reload',()=>{
  const events=new Set(),outcomes=new Set();
  for(let seed=0;seed<100;seed++) {
    let life=through(seed,['friend','practice']);events.add(currentScene(life).id);
    assert.deepEqual(currentScene(deserialize(JSON.stringify(life))),currentScene(life));
    life=choose(life,'city');life=choose(life,'stage');outcomes.add(derive(life).voice);
    assert.deepEqual(derive(deserialize(JSON.stringify(life))),derive(life));
  }
  assert.equal(events.size,2);assert.equal(outcomes.size,2);
});
test('earlier practice changes opportunity outcome under the same chance',()=>{
  const seed=Array.from({length:1000},(_,i)=>i).find(seed=>{const r=chance(seed,3*37+4);return r>.38&&r<.82;});
  const practiced=through(seed,['friend','practice','city','stage']);
  const unpracticed=through(seed,['friend','garden','city','stage']);
  assert.equal(derive(practiced).voice,true);assert.equal(derive(unpracticed).voice,false);
  assert.match(derive(practiced).records[3].turn,/연습/);
});
test('reaching out earlier can change whether a chance reunion happens',()=>{
  const seed=Array.from({length:1000},(_,i)=>i).find(seed=>{const r=chance(seed,5*37+7);return r>.42&&r<.8;});
  const called=through(seed,['friend','garden','city','invite-friend','seed']);
  const notCalled=through(seed,['friend','garden','city','ordinary','seed']);
  assert.equal(currentScene(called).id,'rain-reunion');assert.equal(currentScene(notCalled).id,'returned-letter');
  const reunited=choose(called,'reconnect');assert.equal(derive(reunited).friend,4);
});
test('each heirloom reaches a playable descendant and retains all prior memories',()=>{
  const routes=[['practice','leave-song','dream'],['band','leave-letter','bond'],['garden','leave-small','care'],['practice','leave-small','self']];
  for(const [young,last,gift] of routes) {
    let life=through(7,gift==='care'?['window',young,'home','ordinary','seed','keep-promise','keep-letters','together',last]:['puddle',young,'home','ordinary','lullaby','listen-self','song-memory','sunlight',last]);
    assert.equal(summarize(life).gift,gift);
    const before=JSON.stringify(life),descendant=nextGeneration(life,167);
    assert.equal(JSON.stringify(life),before);assert.equal(descendant.choices.length,0);assert.equal(descendant.ancestors.length,1);
    assert.match(currentScene(descendant).text,/손주/);assert.ok(currentScene(descendant).text.includes(GIFTS[gift].intro));
    assert.notEqual(castFor(descendant).friend,castFor(life).friend);
    assert.deepEqual(descendant.ancestors[0].records,summarize(life).records);
    const continued=finish(descendant,1);assert.equal(summarize(continued).generation,2);
    const third=nextGeneration(continued,997);assert.equal(third.ancestors.length,2);assert.deepEqual(deserialize(JSON.stringify(third)),third);
  }
});
test('inherited object returns in the descendant’s own choice, not only a title card',()=>{
  const ancestor=finish(newLife(33));let child=nextGeneration(ancestor,521);child=choose(child,'window');child=choose(child,'practice');
  assert.match(derive(child).records[1].memory,/손때 묻은 악보/);
});
test('all four descendant heirlooms remember the person who handed them over',()=>{
  const routes=[['practice','leave-song','dream'],['band','leave-letter','bond'],['garden','leave-small','care'],['practice','leave-small','self']];
  for(const [young,last,gift] of routes) {
    const life=through(7,gift==='care'?['window',young,'home','ordinary','seed','keep-promise','keep-letters','together',last]:['puddle',young,'home','ordinary','lullaby','listen-self','song-memory','sunlight',last]);
    const before=JSON.stringify(life);const child=nextGeneration(life,167);
    const firstMemory=derive(choose(child,'window')).records[0].memory;
    assert.ok(firstMemory.includes(GIFTS[gift].title));
    assert.match(firstMemory,/내 손에 이 물건을 쥐여 주던 순간/);
    assert.doesNotMatch(firstMemory,/한 번도 만나지 못한/);
    if(gift==='self')assert.match(firstMemory,/수첩을/);
    assert.equal(JSON.stringify(life),before);
    assert.deepEqual(child.ancestors[0].records,summarize(life).records);
  }
});
test('a family care choice does not invent a prior meeting with Iseul',()=>{
  const life=through(418,['puddle','garden','city','ordinary','share-day','listen-self','keep-letters']);
  assert.ok(!currentScene(life).text.includes('이슬'));
});
test('invalid, stale, and completed choices do not mutate a journey',()=>{
  const life=newLife(12),saved=JSON.stringify(life);assert.throws(()=>advance(life,'other-event','friend'));assert.throws(()=>choose(life,'not-a-choice'));assert.throws(()=>summarize(life));
  const after=choose(life,'friend');assert.throws(()=>advance(after,'paper-plane','friend'));assert.equal(JSON.stringify(life),saved);
  assert.throws(()=>advance(finish(life),'last-evening','leave-song'));
});
test('corrupt and legacy saves are rejected without resetting source data',()=>{
  for(const raw of ['{','null','{}',JSON.stringify({version:1,choices:[]}),JSON.stringify({...newLife(0),seed:-1}),JSON.stringify({...newLife(0),choices:['unknown']}),JSON.stringify({...newLife(0),ancestors:[null]})])assert.equal(deserialize(raw),null);
  const child=nextGeneration(finish(newLife(123)),456);child.ancestors[0].gift='__proto__';assert.equal(deserialize(JSON.stringify(child)),null);
  assert.throws(()=>newLife(-1));assert.throws(()=>newLife(Infinity));
});
test('constellations and descendant names are stable across save restoration',()=>{
  const life=finish(newLife(8921)),summary=summarize(life),pts=constellationPoints(summary.records,life.seed);
  assert.equal(pts.length,9);assert.ok(pts.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<1&&Math.abs(p.y)<1));
  assert.deepEqual(pts,constellationPoints(summarize(deserialize(JSON.stringify(life))).records,life.seed));
  const child=nextGeneration(life,102);assert.deepEqual(castFor(child),castFor(deserialize(JSON.stringify(child))));
});
