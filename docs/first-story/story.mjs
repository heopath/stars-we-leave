export const COLORS = { home: '#f2aa9d', connection: '#9ad7e5', dream: '#c2b2f1', self: '#ead398' };
export const CHAPTERS = [
  { age: 8, era: '어린 시절', title: '세상은 아직, 작은 빛들', line: '누군가에게는 평범한 저녁이, 나에게는 처음인 날.', sky: '처음의 하늘' },
  { age: 17, era: '자라는 시절', title: '조금 더 멀리 가고 싶어서', line: '같은 길 위에서도, 우리는 조금씩 다른 꿈을 꾸었다.', sky: '가능성의 하늘' },
  { age: 26, era: '나의 계절', title: '갈림길에도 별은 뜬다', line: '하나의 길을 고른다는 건, 그 길의 풍경을 만나러 가는 일.', sky: '선택의 하늘' },
  { age: 38, era: '함께하는 시절', title: '멀어져도 이어지는 것', line: '새로운 빛이 찾아오고, 오래된 빛이 다시 말을 건넨다.', sky: '인연의 하늘' },
  { age: 56, era: '함께하는 시절', title: '오래도록 남을 저녁', line: '시간이 지나서야, 작고 익숙한 순간들이 선명해졌다.', sky: '기억의 하늘' },
  { age: 78, era: '깊어진 계절', title: '내가 지나온 빛을 따라', line: '모두 기억하지 못해도, 함께했던 마음은 길을 알고 있다.', sky: '마지막 계절의 하늘' }
];
const option = (id, who, title, description, action, memory, after, tag) => ({ id, who, title, description, action, memory, after, tag, color: COLORS[tag] });
export function optionsFor(history = []) {
  const has = id => history.includes(id);
  switch (history.length) {
    case 0: return [
      option('mom_stars', '어머니', '별 이름을 배우던 밤', '어머니가 창가에서 손짓한다. 오늘은 유난히 별이 잘 보인다고, 잠깐 같이 앉자고.', '곁에 앉아 별을 본다', '어머니의 손끝을 따라 별을 세었다. 이름을 잊어도 그 밤의 온기는 남았다.', '“저 별은 네가 찾았으니까, 네 이름으로 불러도 되겠네.”', 'home'),
      option('yoon_music', '친구 윤', '둘만의 작은 합주', '옆집 윤이 빈 깡통을 두드린다. 나는 나뭇가지 두 개를 집어 든다. 아직 노래라고 부르기는 어렵지만.', '윤과 소리를 맞춘다', '박자가 자꾸 어긋나서, 연주보다 웃음이 길었다. 우리의 첫 번째 노래였다.', '“우리, 나중에도 같이 연주하자.”', 'connection'),
      option('self_lake', '나', '물에 내려앉은 하늘', '집으로 가는 길, 작은 웅덩이에 하늘이 담겨 있다. 한 발 옆으로 움직이면 별도 나를 따라온다.', '잠시 멈춰 들여다본다', '아무도 모르는 작은 하늘을 발견했다. 혼자 있는 시간이 처음으로 좋아졌다.', '작은 물결 속에서, 별 하나가 나를 따라 흔들렸다.', 'self')
    ];
    case 1: return [
      option('yoon_band', '친구 윤', '방과 후의 약속', has('yoon_music') ? '윤은 아직 그 깡통 합주를 기억한다. 이번에는 학교 축제 무대에 함께 서자고 한다.' : '반 친구 윤이 축제 연습에 초대한다. 빈자리가 하나 있다고, 잘 못해도 괜찮다고.', '함께 축제를 준비한다', '작은 무대에서 서로 눈을 맞췄다. 틀린 음 하나까지 둘의 노래가 되었다.', '윤의 빛이 조금 더 가까워졌다. 함께 갈 수 있는 길이 생겼다.', 'connection'),
      option('music_practice', '나의 꿈', '처음 끝까지 친 곡', '음악실에 혼자 남았다. 늘 틀리는 마지막 마디를 오늘은 끝까지 연주해 보고 싶다.', '다시 한번 연주한다', '수없이 멈췄던 손이 마지막 음에 닿았다. 내 안에도 노래가 있다는 걸 알았다.', '닫혀 있던 음악실 창밖으로, 나의 첫 멜로디가 흘러나갔다.', 'dream'),
      option('mom_walk', '어머니', '천천히 돌아가는 길', '어머니가 장바구니 한쪽을 내민다. 가까운 길을 두고 조금 먼 길로 돌아가자고 한다.', '먼 길을 함께 걷는다', '장바구니를 나눠 들고 걸었다. 어머니에게도 어릴 적 꿈이 있었다는 걸 처음 들었다.', '“나도 네 나이에는, 아주 멀리 가보고 싶었어.”', 'home')
    ];
    case 2: return [
      option('city', '나의 꿈', '낯선 도시의 무대', has('music_practice') ? '연습하던 곡을 들은 작은 공연장의 주인이 연락했다. 다른 도시에서 연주해 보지 않겠느냐고.' : '낯선 도시의 작은 공연장에서 새 연주자를 찾는다. 서툴러도 처음부터 배워볼 수 있다.', '새로운 도시로 떠난다', '가방 하나와 노래를 들고 떠났다. 낯선 불빛 사이에서 나의 자리를 만들기 시작했다.', '고향의 빛들은 멀어졌지만 사라지지 않았다. 편지를 보낼 수 있는 거리였다.', 'dream'),
      option('stay', '친구 윤', '골목 끝의 작은 공연장', '윤은 빈 가게를 함께 고쳐보자고 한다. 낮에는 각자의 일을 하고, 저녁에는 누구나 노래할 수 있는 곳으로.', '윤과 작은 문을 연다', '삐걱거리는 의자를 고치고 첫 손님을 맞았다. 우리 동네에 작은 무대가 생겼다.', '멀리 떠나지 않아도, 이곳에 새로운 사람들이 찾아오기 시작했다.', 'connection'),
      option('journey', '나', '아직 정하지 않은 길', '어디로 갈지 바로 정하지 않아도 된다. 모아둔 시간을 써서, 바다를 따라 천천히 걸어보기로 한다.', '나만의 속도를 찾는다', '파도 소리를 오래 들었다. 다음에 할 일을 모르면서도, 오늘을 좋아할 수 있었다.', '잠시 돌아가는 길에서, 내가 좋아하는 소리를 다시 찾았다.', 'self')
    ];
    case 3: return [
      option('letter', '친구 윤', has('city') || has('journey') ? '오랜만에 쓰는 편지' : '가게 문을 일찍 닫고', has('city') || has('journey') ? '윤에게서 오래된 사진 한 장이 왔다. “요즘 어떻게 지내?” 짧은 물음에 하고 싶은 말이 많아졌다.' : '함께 일하느라 정작 서로의 이야기는 못 들었다. 오늘은 문을 일찍 닫고 윤과 앉아보기로 한다.', '윤의 이야기를 듣는다', has('city') || has('journey') ? '길었던 침묵 뒤에 편지 한 통을 보냈다. 답장은 생각보다 빨리 도착했다.' : '관객이 모두 돌아간 무대에 둘만 앉았다. 오래된 친구의 새로운 고민을 들었다.', '달라진 삶을 이야기하는 동안, 멀었던 두 빛이 다시 가까워졌다.', 'connection'),
      option('iseul', '새로운 인연 이슬', '비를 피하던 처마 아래', '갑작스러운 비에 이슬과 나란히 선다. 같은 노래를 좋아한다는 사소한 발견으로 이야기가 길어진다.', '조금 더 이야기를 나눈다', '비가 그친 뒤에도 이야기를 멈추지 않았다. 서로의 평범한 하루를 궁금해하는 사람이 생겼다.', '서둘러 이름 붙이지 않아도 좋은, 새로운 인연이 시작되었다.', 'home'),
      option('stage', '나의 꿈', has('city') ? '무대 위, 나의 목소리' : '다시 꺼내 든 악보', has('city') ? '오늘은 내 이름으로 여는 첫 공연이다. 객석은 작지만, 나를 들으러 온 사람들이 있다.' : '한동안 접어 두었던 악보를 펼친다. 지금의 내가 연주하면, 예전과는 다른 노래가 될 것 같다.', '나의 노래를 들려준다', '누군가에게 잘 보이려던 마음을 내려놓았다. 내 이야기를 내 목소리로 연주했다.', '한 사람이 끝까지 남아 박수를 쳤다. 그 밤을 오래 기억하게 되었다.', 'dream')
    ];
    case 4: return [
      option('mom_home', '어머니', '익숙한 창가의 저녁', has('mom_stars') ? '어머니는 창가에 앉아 별을 바라본다. 오늘은 내가 먼저 아는 별을 가리켜 본다.' : '오랜만에 어머니와 저녁을 먹는다. 식탁도 창가도 그대로인데, 우리 이야기는 조금 달라졌다.', '함께 저녁을 보낸다', '어머니가 같은 이야기를 한 번 더 했다. 이번에는 끝까지 들었다. 창밖에는 별이 떴다.', '“오늘 와줘서 좋다.” 우리는 한동안 아무 말 없이 앉아 있었다.', 'home'),
      option('own_song', '나의 꿈', '기억으로 만든 노래', '어릴 적의 소리들이 문득 떠오른다. 창문을 두드리던 비, 골목의 웃음. 흩어진 기억을 한 곡으로 엮는다.', '노래를 완성해 보낸다', '내가 사랑한 시간들을 노래에 담아 보냈다. 어머니는 여러 번 들었다는 짧은 답장을 남겼다.', '서로 다른 곳에서도, 우리는 같은 멜로디를 듣고 있었다.', 'dream'),
      option('quiet', '나', '오래 미뤄 둔 쉼', '늘 다음 일을 생각하며 지냈다. 오늘은 어머니와 짧은 안부를 나누고, 아무 일정도 없는 하루를 보낸다.', '오늘만큼은 천천히 쉰다', '창을 열고 햇볕을 쬐었다. 특별한 일을 하지 않은 하루도 내 삶의 한 장이 되었다.', '어머니는 전화 너머로 말했다. “밥 잘 챙겨 먹고. 네가 편안하면 좋겠다.”', 'self')
    ];
    case 5: return [
      option('reunion', '친구 윤', '다시, 둘만의 합주', has('letter') || has('stay') ? '윤이 오래된 악기를 들고 찾아왔다. 손은 느려졌지만, 눈을 맞추면 시작할 수 있다.' : '오래 소식이 끊겼던 윤에게 연락했다. 며칠 뒤, 문 앞에 악기를 든 윤이 서 있었다.', '윤과 한 곡을 연주한다', '느린 손으로 같은 박자를 찾았다. 처음 만났을 때처럼, 연주보다 웃음이 길었다.', '처음부터 끝까지 같을 필요는 없었다. 우리는 다시 함께 연주했다.', 'connection'),
      option('pass_song', '다음 세대', '누군가의 첫 번째 노래', '처음 악기를 잡은 아이가 내 옆에 앉는다. 오래전 내가 틀렸던 바로 그 마디에서 자꾸 멈춘다.', '곁에서 천천히 알려준다', '내가 배운 노래를 누군가의 손에 건넸다. 아이는 곧 자기만의 박자로 연주하기 시작했다.', '내 노래에서 시작한 작은 빛이, 내가 가보지 못한 곳으로 향했다.', 'dream'),
      option('iseul_walk', has('iseul') ? '이슬' : '이웃 이슬', '아직 남아 있는 산책길', has('iseul') ? '이슬이 익숙한 걸음으로 나를 기다린다. 날씨 이야기를 나누며 오늘도 같은 길을 걷는다.' : '이웃 이슬이 산책을 권한다. 오래 살았어도 처음 나누는 이야기와 처음 보는 풍경은 남아 있다.', '나란히 산책을 나선다', '바람이 좋다고 말하자, 옆에서도 그렇다고 했다. 평범한 하루를 함께 좋아했다.', '멀리 가지 않아도 좋았다. 오늘의 빛이 충분히 따뜻했다.', 'home')
    ];
    default: return [];
  }
}
export function choose(history, id, expectedScene = history.length) {
  if (expectedScene !== history.length || history.length >= CHAPTERS.length) throw new Error('이미 지나온 계절입니다.');
  if (!optionsFor(history).some(o => o.id === id)) throw new Error('이 계절에 없는 선택입니다.');
  return [...history, id];
}
export function memoriesFor(history) {
  const prior = [];
  return history.map(id => {
    const found = optionsFor(prior).find(o => o.id === id);
    if (!found) throw new Error('읽을 수 없는 여정입니다.');
    const result = { ...found, ...CHAPTERS[prior.length], title: found.title, index: prior.length };
    prior.push(id); return result;
  });
}
export function restore(raw) {
  try {
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.history) || data.history.length > 6) return null;
    memoriesFor(data.history);
    return data.history;
  } catch { return null; }
}
export function endingFor(history) {
  const memories = memoriesFor(history);
  const tags = Object.keys(COLORS);
  const count = Object.fromEntries(tags.map(tag => [tag, memories.filter(m => m.tag === tag).length]));
  const dominant = tags.reduce((a, b) => count[a] >= count[b] ? a : b);
  const names = { home: '곁에 머문 빛', connection: '다시 이어진 빛', dream: '멀리 번져 간 빛', self: '나의 속도로 빛난 별' };
  const lines = { home: '당신은 평범한 날들 속에서 함께할 자리를 만들었습니다.', connection: '때로 멀어져도, 당신은 다시 이어질 길을 남겼습니다.', dream: '당신이 찾아낸 소리는 다른 누군가의 시작이 되었습니다.', self: '당신은 자신의 속도로 걸으며 작은 순간들을 발견했습니다.' };
  return { title: names[dominant], line: lines[dominant], color: COLORS[dominant], memories };
}
