import test from 'node:test';
import assert from 'node:assert/strict';
import {newLife,currentScene,advance,derive,currentDetour,explore,summarize,nextGeneration,deserialize,chance} from './dist/life.mjs';
import {WORLD,SPAWN,LANDMARKS,walk,cameraFor,project,unproject} from './dist/world.mjs';
const pick=(l,id)=>advance(l,currentScene(l).id,id);
test('5,184 expanded journeys cover every choice and retain optional memories across reload',()=>{
  const coverage=Array.from({length:9},()=>new Set());
  let count=0;
  for(let seed=0;seed<24;seed++)for(let route=0;route<216;route++){
    let life=newLife(seed);
    for(let step=0;step<9;step++){
      for(let p=0;p<3;p++)if(chance(seed+route,step*3+p)<.3)life=explore(life,p,(route+p)%2?'stay':'notice');
      const scene=currentScene(life);assert.equal(scene.choices.length,6);
      assert.equal(new Set(scene.choices.map(c=>c.id)).size,6);
      const index=step<3?Math.floor(route/6**step)%6:(route+step+seed)%6;
      const choice=scene.choices[index];coverage[step].add(choice.id);
      assert.ok(choice.memory&&choice.echo&&choice.detail);
      life=advance(life,scene.id,choice.id);
    }
    const end=summarize(life);assert.equal(end.records.length,9);
    assert.equal(end.detours.length,life.wander.length);
    assert.deepEqual(derive(deserialize(JSON.stringify(life))),derive(life));count++;
  }
  assert.equal(count,5184);assert.ok(coverage.every(c=>c.size===6));
});
test('optional encounters remain in the same age and change later opportunities',()=>{
  const seed=Array.from({length:1000},(_,i)=>i).find(s=>{const r=chance(s,3*37+4);return r>.38&&r<.62;});
  let plain=newLife(seed);plain=pick(plain,'friend');plain=pick(plain,'garden');plain=pick(plain,'city');
  let wandered=explore(plain,1,'stay');
  assert.equal(currentScene(wandered).age,33);assert.equal(wandered.choices.length,plain.choices.length);
  assert.equal(derive(pick(wandered,'stage')).voice,true);
  assert.equal(derive(pick(plain,'stage')).voice,false);
  assert.equal(currentDetour(wandered,1),null);
  assert.throws(()=>explore(wandered,1,'notice'));
  assert.equal(currentDetour(plain,1).choices.length,2);
});
test('the same seed responds to choosing contact during a walk',()=>{
  const seed=Array.from({length:1000},(_,i)=>i).find(s=>{const r=chance(s,5*37+7);return r>.42&&r<.8;});
  let life=newLife(seed);for(const id of ['puddle','garden','city','ordinary'])life=pick(life,id);
  const called=pick(explore(life,0,'stay'),'seed'),silent=pick(life,'seed');
  assert.equal(currentScene(called).id,'rain-reunion');assert.equal(currentScene(silent).id,'returned-letter');
});
test('vocations and community alter the later choices and payoff, not only the ending score',()=>{
  let life=pick(newLife(88),'book');life=pick(life,'apprentice');
  assert.equal(derive(life).vocation,'artisan');
  assert.match(currentScene(life).choices.find(c=>c.id==='repair-shop').title,/배운 손일/);
  life=pick(life,'repair-shop');
  assert.match(currentScene(life).choices.find(c=>c.id==='workshop').title,/내 이름/);
  life=pick(life,'community-table');life=pick(life,'shared-garden');life=pick(life,'return-place');life=pick(life,'archive');
  assert.match(currentScene(life).choices.find(c=>c.id==='open-door').memory,/정원에서/);
});
test('an artisan life ends with a craft legacy rather than assuming a musical career',()=>{
  let life=newLife(50);
  for(const id of ['book','apprentice','repair-shop','workshop','make-toy','long-walk','teach-craft','finish-work','leave-notebook'])life=pick(life,id);
  assert.equal(summarize(life).title,'다른 손으로 이어진 빛');
  assert.match(summarize(life).line,/손이 고치고/);
});
test('27 optional memories are inherited and valid older v2 saves gain the additional choices',()=>{
  let life=newLife(15);
  while(currentScene(life)){for(let p=0;p<3;p++)life=explore(life,p,'stay');life=pick(life,currentScene(life).choices[5].id);}
  assert.equal(derive(life).detours.length,27);
  const child=nextGeneration(life,16);assert.equal(child.ancestors[0].detours.length,27);
  assert.deepEqual(deserialize(JSON.stringify(child)),child);
  const old={version:2,seed:9,choices:['friend','garden'],ancestors:[]};
  const upgraded=deserialize(JSON.stringify(old));
  assert.deepEqual(upgraded.choices,old.choices);assert.equal(currentScene(upgraded).choices.length,6);
  assert.equal(upgraded.wander.length,0);assert.equal(currentScene(upgraded).age,24);
});
test('invalid, duplicate and future side choices are rejected without changing the source',()=>{
  const life=newLife(17),raw=JSON.stringify(life);assert.throws(()=>explore(life,-1,'stay'));assert.throws(()=>explore(life,0,'bad'));
  const after=explore(life,0,'stay');
  for(const wander of [[...after.wander,...after.wander],[{step:1,place:0,choice:'stay'}],[{step:0,place:7,choice:'stay'}],[{step:0,place:0,choice:'bad'}]]){
    assert.equal(deserialize(JSON.stringify({...life,wander})),null);
  }
  assert.equal(JSON.stringify(life),raw);
});
test('free movement supports both axes, equal diagonal speed, bounded destinations and camera round trips',()=>{
  const right=walk(SPAWN,{x:1,y:0},.04),left=walk(SPAWN,{x:-1,y:0},.04),up=walk(SPAWN,{x:0,y:-1},.04),down=walk(SPAWN,{x:0,y:1},.04);
  assert.ok(right.x>SPAWN.x&&left.x<SPAWN.x&&up.y<SPAWN.y&&down.y>SPAWN.y);
  const diag=walk(SPAWN,{x:1,y:1},.04);assert.ok(Math.abs(Math.hypot(diag.x-SPAWN.x,diag.y-SPAWN.y)-12)<1e-9);
  for(const [width,height] of [[1440,900],[390,844],[740,580]]){
    const c=cameraFor(SPAWN,width,height);
    for(const p of LANDMARKS){const back=unproject(project(p,c),c);assert.ok(Math.hypot(back.x-p.x,back.y-p.y)<1e-9);}
  }
  const edge=walk({x:WORLD.width-60,y:WORLD.height-60},{x:1,y:1},.05);assert.deepEqual(edge,{x:1540,y:1040});
});
