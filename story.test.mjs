import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, optionsFor, choose, memoriesFor, restore, endingFor } from './dist/story.mjs';
test('729개의 생애 경로가 여섯 기억과 별자리까지 이어진다', () => {
  let endings = 0;
  function visit(history) {
    assert.deepEqual(restore(JSON.stringify({version:1, history})), history);
    if (history.length === CHAPTERS.length) {
      const end = endingFor(history); assert.equal(end.memories.length, 6);
      assert.ok(end.memories.every(m => m.memory && m.after && m.color));
      assert.ok(end.title && end.line); assert.deepEqual(optionsFor(history), []);
      assert.throws(() => choose(history, history[0])); endings++; return;
    }
    const options = optionsFor(history); assert.equal(options.length, 3);
    assert.equal(new Set(options.map(o => o.id)).size, 3);
    for (const option of options) visit(choose(history, option.id));
  }
  visit([]); assert.equal(endings, 729);
});
test('도시로 떠난 삶과 고향에 남은 삶은 실제 다음 대사가 다르다', () => {
  const first = ['yoon_music','music_practice'];
  const away = optionsFor([...first,'city']).find(o => o.id === 'letter');
  const home = optionsFor([...first,'stay']).find(o => o.id === 'letter');
  assert.notEqual(away.title, home.title); assert.notEqual(away.description, home.description); assert.notEqual(away.memory, home.memory);
});
test('어린 시절의 기억과 새 인연이 후반 대사에 반영된다', () => {
  assert.match(optionsFor(['yoon_music'])[0].description, /깡통/);
  assert.match(optionsFor(['mom_stars','mom_walk','stay','iseul','mom_home'])[2].description, /익숙한 걸음/);
  assert.match(optionsFor(['mom_stars','mom_walk','stay','letter','mom_home'])[2].description, /이웃 이슬/);
});
test('중복 클릭과 다른 계절의 선택을 거절하고 원래 배열을 보존한다', () => {
  const history = ['mom_stars']; const next = choose(history,'yoon_band',1);
  assert.deepEqual(history,['mom_stars']); assert.equal(next.length,2);
  assert.throws(() => choose(next,'yoon_band',1)); assert.throws(() => choose(history,'city'));
});
test('깨진 저장과 지원하지 않는 버전을 안전하게 거절한다', () => {
  for (const raw of [null, '', '{', 'null', '{}', '{"version":2,"history":[]}', '{"version":1,"history":["city"]}', '{"version":1,"history":"hello"}', '{"version":1,"history":[null]}']) assert.equal(restore(raw),null);
  assert.deepEqual(restore('{"version":1,"history":[]}'),[]);
});
test('회상은 선택 당시 맥락을 그대로 보존한다', () => {
  const h = ['yoon_music','music_practice','city','letter','own_song','reunion'];
  const m = memoriesFor(h); assert.deepEqual(m.map(x=>x.age),[8,17,26,38,56,78]);
  assert.match(m[3].memory,/편지/); assert.equal(m[0].who,'친구 윤');
});
