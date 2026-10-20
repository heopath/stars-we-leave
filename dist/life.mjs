export const VERSION = 2;
export const AGES = [8, 16, 24, 33, 42, 53, 64, 75, 84];
export const ERAS = ['작은 시작','마음이 자라는 날','멀리 가보는 계절','뜻밖의 갈림길','함께 살아가는 날','돌아보는 계절','다시 열리는 문','나누어 갖는 시간','마지막 저녁'];
export const PALETTE = { bond:'#91d8dc', dream:'#b9b0ed', care:'#f0b7a4', self:'#e9d2a0' };
export const GIFTS = {
  bond: { title:'접힌 편지', object:'편지', line:'멀어져도 다시 말을 걸 수 있다는 마음', symbol:'✉', intro:'서랍 속 편지에는, 오래 끊겼던 인연에게 다시 안부를 묻던 날이 적혀 있다.' },
  dream: { title:'손때 묻은 악보', object:'악보', line:'서툴러도 자기만의 소리를 내는 용기', symbol:'♪', intro:'오래된 악보 귀퉁이에 서툰 음표가 가득하다. 누군가 끝내 완성했던 노래다.' },
  care: { title:'작은 씨앗 봉투', object:'씨앗', line:'곁에 있는 것을 오래 돌보는 마음', symbol:'❧', intro:'작은 봉투에 씨앗과 짧은 메모가 들어 있다. “서두르지 말고, 볕이 드는 곳에.”' },
  self: { title:'여행자의 수첩', object:'수첩', line:'세상을 자기 속도로 바라보는 시선', symbol:'⌁', intro:'빛바랜 수첩에는 지명보다 날씨와 냄새가 많다. 길을 잃고도 좋았던 날의 기록이다.' }
};
export function chance(seed, salt) { let x = (seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x7feb352d); x ^= x >>> 15; x = Math.imul(x, 0x846ca68b); x ^= x >>> 16; return (x >>> 0) / 4294967296; }
export function newLife(seed, ancestors = []) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) throw new Error('Invalid seed');
  return { version: VERSION, seed, ancestors: structuredClone(ancestors), choices: [] };
}
function choice(id, who, title, detail, tag, effect, memory, echo, extra = {}) { return {id,who,title,detail,tag,effect,memory,echo,...extra}; }
function event(id,title,text,kind,choices) { return {id,title,text,kind,choices}; }
export function derive(life) {
  const state = { friend:1, companion:0, home:'town', practice:0, voice:false, child:false, called:false, joined:false, distance:false, records:[], tags:{bond:0,dream:0,care:0,self:0} };
  for (const [step,id] of life.choices.entries()) {
    const e = sceneFor(life, state, step), selected = e.choices.find(c=>c.id===id);
    if (!selected) throw new Error('이 여정에는 없는 선택입니다.');
    Object.assign(state, selected.effect);
    state.tags[selected.tag]++;
    state.records.push({id,step,age:AGES[step],era:ERAS[step],event:e.title,eventId:e.id,kind:e.kind,who:selected.who,title:selected.title,tag:selected.tag,memory:selected.memory,echo:selected.echo,turn:selected.turn || null});
  }
  return state;
}
export function castFor(life) {
  if(!life.ancestors.length)return {friend:'윤',companion:'이슬'};
  const index=Math.floor(chance(life.seed,902)*4);
  return {friend:['하늘','서우','해솔','다온'][index],companion:['여울','노을','유리','별하'][index]};
}
export function sceneFor(life, s = derive(life), step = life.choices.length) {
  const result=buildScene(life,s,step);if(!result)return null;
  const cast=castFor(life);
  const replace=value=>typeof value==='string'?value.replace(/(윤|이슬)(이라는|이라고|이|은|을|과)?/g,(_match,old,particle)=>{
    const name=old==='윤'?cast.friend:cast.companion,final=(name.charCodeAt(name.length-1)-44032)%28!==0;
    const particles={이라는:['이라는','라는'],이라고:['이라고','라고'],이:['이','가'],은:['은','는'],을:['을','를'],과:['과','와']};
    return name+(particle?particles[particle][final?0:1]:'');
  }):value;
  if(life.ancestors.length) {
    for(const k of ['title','text'])result[k]=replace(result[k]);
    for(const c of result.choices)for(const k of ['who','title','detail','memory','echo','turn'])if(c[k])c[k]=replace(c[k]);
    const gift=life.ancestors.at(-1).gift;
    if(step===1){
      const inherited=gift==='dream'?'practice':gift==='care'?'garden':gift==='bond'?'band':null;
      const c=result.choices.find(c=>c.id===inherited);
      if(c)c.memory+=` 집으로 돌아와 ${GIFTS[gift].title}를 다시 꺼내 보았다. 먼저 살았던 사람도 이런 마음이었을까.`;
    }
    if(step===8)result.text+=' 오래전 내 손에 건네졌던 마음을, 이제 나의 다음 사람에게 건넬 차례다.';
  }
  return result;
}
function buildScene(life, s, step) {
  if (step >= AGES.length) return null;
  const rnd = salt=>chance(life.seed,step*37+salt);
  const gift = life.ancestors.at(-1)?.gift;
  switch(step) {
  case 0: return event('paper-plane',gift ? '오래된 별 아래, 새로운 아침' : '담장 너머에서 날아온 것',gift ? `${GIFTS[gift].intro} 그 물건을 남긴 사람은 이제 밤하늘의 별이다. 오늘, 그 손주인 당신에게도 처음의 하루가 열린다.` : '봄바람에 종이비행기 하나가 마당으로 날아들었다. 담장 너머에서 또래 아이가 빼꼼 고개를 내민다. “그거, 다시 던져줄래?”','시작',[
    choice('friend','새 친구 윤','담장 너머로 답하기','종이비행기를 다시 접어 날린다. 이웃집 아이와의 첫 인사다.','bond',{friend:2},'비행기는 담장을 넘지 못했다. 우리는 양쪽에서 한참 웃었다. 그날부터 윤이라는 이름이 생겼다.','아무 계획도 없던 오후가, 오래 기억할 사람의 시작이 되었다.'),
    choice('window','어머니','창가에 나란히 앉기',gift ? `물려받은 ${GIFTS[gift].object}에 대해 어머니에게 물어본다.` : '어머니가 들려주는 옛날이야기에 귀를 기울인다.','care',{},gift ? `어머니와 ${GIFTS[gift].title}${gift==='self'?'을':'를'} 조심스레 꺼내 보았다. 내 손에 이 물건을 쥐여 주던 순간이 떠올랐다. 그때는 다 알지 못했던 마음이 조금 가까워졌다.` : '어머니는 어린 시절 살던 집을 그려 주었다. 나를 키우는 사람에게도 작은 아이였던 날들이 있었다.','“너도 언젠가, 오늘 이야기를 누군가에게 들려주겠지.”'),
    choice('puddle','나','작은 하늘 발견하기','웅덩이에 비친 구름을 따라 걷는다. 조금 늦게 집으로 돌아가도 좋다.','self',{},'길가의 작은 물에 하늘이 들어 있었다. 한 발 옮길 때마다 별빛 같은 햇살이 따라왔다.','혼자 바라본 풍경도, 나의 첫 기억이 되었다.')]);
  case 1: return event('festival','아직 이름 없는 나의 꿈','학교 축제가 한 달 앞으로 다가왔다. 빈 음악실에서는 낯선 소리가 들리고, 운동장 끝에서는 윤이 손을 흔든다. 어떤 오후를 보내고 싶을까?','선택',[
    choice('practice','나의 꿈','처음 끝까지 연주하기','자꾸 틀리는 마지막 마디를 다시 연습한다.','dream',{practice:2},'교실이 텅 비고 나서야 마지막 음에 닿았다. 박수는 없었지만 내 손이 그 순간을 기억했다.','이날의 연습은, 훗날 뜻밖의 무대에서 손을 붙잡아 준다.'),
    choice('band','친구 윤','둘이서 축제에 서기','잘하지 못해도, 친구와 함께라면 무대에 서볼 수 있을 것 같다.','bond',{friend:3,practice:1},s.friend>=2 ? '담장 너머로 비행기를 던지던 친구와 나란히 섰다. 이번에는 두 사람의 소리가 담장을 넘었다.' : '윤이 먼저 박자를 세어 주었다. 틀린 음 하나도 함께 웃으면 노래가 되었다.','우리에게만 통하는 시작 신호가 생겼다.'),
    choice('garden','어머니','작은 화분 돌보기','축제 대신 집에서 어머니와 흙을 고른다. 아직 피지 않은 꽃도 궁금하다.','care',{},'흙을 너무 꼭 누르지 말라는 말을 배웠다. 뿌리도 숨 쉴 자리가 필요하다고 했다.','돌보는 일에는, 서두르지 않는 시간이 필요했다.')]);
  case 2: return event(rnd(1)<.5?'missed-train':'rain-delay',rnd(1)<.5?'막차가 떠난 뒤':'갑자기 쏟아진 비',rnd(1)<.5 ? '낯선 도시로 가려던 기차를 놓쳤다. 전광판이 꺼지고, 작은 역 대합실에는 당신과 여행자 한 사람이 남았다. 계획에 없던 밤이다.' : '가던 길에 비가 쏟아진다. 오래된 처마 아래, 이슬이라는 여행자가 마른 자리를 내어 준다. 예정한 버스는 이미 떠나고 있다.','우연',[
    choice('city','나의 길','다음 차를 기다리기','조금 늦어져도 처음 가려던 도시로 향한다.','dream',{home:'city',distance:true,friend:Math.max(0,s.friend-1)},'다음 날 아침, 낯선 역에 내렸다. 작고 서툰 방 하나가 새로운 일상의 시작이 되었다.','고향의 사람들은 멀어졌다. 연락할 수 없는 거리는 아니었다.'),
    choice('talk','이슬','낯선 사람과 이야기하기','일정을 잠시 내려놓고, 그 사람은 어디로 가는지 물어본다.','bond',{companion:2,home:rnd(2)<.5?'sea':'city',distance:true},'시간 가는 줄 모르고 이야기를 나눴다. 이슬은 바닷가 마을의 주소 하나를 수첩에 적어 주었다.',rnd(2)<.5?'며칠 뒤 그 주소를 찾아갔다. 우연히 나눈 이야기가 삶의 터전을 바꾸었다.':'당장 함께 떠나지는 않았다. 하지만 서로의 하루를 묻는 편지가 오가기 시작했다.',{turn:'계획 밖의 만남이 새로운 인연을 만들었다.'}),
    choice('home','고향','돌아가는 길 고르기','윤에게 전화를 건다. 오늘은 익숙한 곳에서 다시 생각해 보고 싶다.','self',{home:'town',distance:false},'윤은 늦은 밤에도 역으로 나와 주었다. 돌아가는 길에, 빈 가게 하나를 같이 써보자는 이야기가 나왔다.','돌아옴도 하나의 방향이었다. 이곳에서 시작할 일이 생겼다.')]);
  case 3: {
    const invite = rnd(3)<.55;
    const success = rnd(4) < (s.practice>=2?.82:s.practice===1?.62:.38);
    return event(invite?'stage-invitation':'empty-shop',invite?'예상하지 못한 초대':'비어 버린 작은 자리',invite ? '단골 가게 주인이 공연의 빈 순서를 맡아달라고 한다. 원래 오기로 한 연주자가 갑자기 올 수 없게 되었다. 준비할 시간은 많지 않다.' : '동네의 작은 가게가 문을 닫는다. 주인은 당신에게 열쇠를 잠깐 맡긴다. 비어 버린 공간을 보고 있자니, 오래 묻어 둔 꿈이 떠오른다.','우연',[
      choice('stage','나의 꿈',invite?'갑작스러운 무대에 서기':'작은 무대 열어보기','완벽하게 준비되지는 않았다. 그래도 내 소리를 들려주고 싶다.','dream',{voice:success,practice:s.practice+1},success?'긴장해서 첫 음을 놓쳤지만, 끝까지 연주했다. 누군가 문 앞에 멈춰 서서 마지막 곡까지 들어 주었다.':'준비한 날, 손님은 거의 오지 않았다. 기대했던 일은 일어나지 않았다. 그래도 한 사람이 남아, 다음에도 들을 수 있느냐고 물었다.',success?'작은 무대가 이어졌다. 꿈은 생각했던 모양과 조금 다르게 자랐다.':'그날의 실패는 꿈을 끝내지 않았다. 내 곁에 남은 한 사람의 얼굴을 오래 기억했다.',{turn:success?(s.practice?'오래전 연습이 갑작스러운 기회를 붙잡아 주었다.':'서툰 도전이 뜻밖의 기회로 이어졌다.'):'기회가 기대한 결과를 보장하지는 않았다.'}),
      choice('invite-friend','친구 윤','윤에게 함께하자고 하기',s.distance?'오랫동안 보지 못한 친구에게 조심스럽게 연락해 본다.':'가까이 있어도 바빠서 만나지 못했던 윤에게 연락한다.','bond',{friend:rnd(5)<.7?3:Math.max(s.friend,1),called:true},rnd(5)<.7?'윤은 망설이다가 찾아왔다. 우리는 서로 달라진 모습에 웃었다. 옛날의 박자는 아직 몸에 남아 있었다.':'윤은 이번에는 갈 수 없다고 했다. 잠깐 서운했지만, 며칠 뒤 긴 편지가 도착했다. 친구도 자기 삶을 건너는 중이었다.',rnd(5)<.7?'한 통의 연락이, 멀어졌던 두 길을 다시 만나게 했다.':'만나지 못한 날에도, 끊어진 줄 알았던 관계가 다시 이어졌다.',{turn:rnd(5)<.7?'선택한 연락과 맞아떨어진 시간이 재회를 만들었다.':'다시 만나려는 마음에도, 서로의 시간이 필요했다.'}),
      choice('ordinary','나','평범한 하루를 지키기','지금의 일과 생활을 이어가며, 내게 필요한 속도를 생각한다.','self',{},'늘 걷던 길을 천천히 걸었다. 익숙한 가게의 불빛과 늦은 저녁이 나를 편안하게 했다.','모든 기회를 붙잡아야만 삶이 앞으로 가는 것은 아니었다.')]); }
  case 4: return event('little-hand','작은 손이 내 손을 잡았다','가족이 된 아이가 처음으로 당신의 손가락을 꼭 쥔다. 아이에게 당신은 이미 하나의 세상이다. 바뀐 하루들 속에서 오늘 한 시간을 고른다.','새로운 인연',[
    choice('lullaby','아이','서툰 자장가 불러주기','잘 부르는 것보다 함께 있는 목소리가 중요할 것 같다.','dream',{child:true},s.voice?'무대에서 부르던 노래를 아주 작게 불렀다. 관객은 한 명뿐인데, 가장 오래 기억할 공연이 되었다.':'잊고 있던 노래를 더듬더듬 불렀다. 아이는 틀린 음을 모른 채 내 손을 놓지 않았다.','그 목소리는 아이가 자란 뒤에도, 오래된 안심으로 남는다.'),
    choice('seed','아이','함께 심을 씨앗 고르기','작은 화분을 창가에 놓는다. 아이와 함께 자라는 것을 보고 싶다.','care',{child:true},'작은 화분 하나를 아이의 자리 옆에 놓았다. 매일 조금씩 달라지는 두 생명을 바라보았다.','언젠가 아이가, 내 대신 물을 주는 날이 올 것이다.'),
    choice('share-day',s.companion?'이슬과 아이':'가족과 아이','돌봄을 함께 나누기','혼자 해내려고 애쓰지 않고, 서로에게 필요한 시간을 물어본다.','bond',{child:true,companion:Math.max(1,s.companion)},'오늘은 다른 사람이 아이를 안았다. 나는 오래 미뤄 둔 산책을 하고 돌아왔다. 도움받는 것도 함께 사는 방법이었다.','각자의 시간을 지켜 주면서, 우리의 생활도 조금씩 자리를 잡았다.')]);
  case 5: {
    const reunion = rnd(7) < (s.called?.8:s.home==='town'?.7:.42);
    return event(reunion?'rain-reunion':'returned-letter',reunion?'비를 피하다 들은 목소리':'돌아온 편지 한 통',reunion?'소나기를 피해 들어간 작은 가게에서 누군가 당신의 이름을 부른다. 돌아보니 윤이다. 서로 다른 일로 이곳에 왔다. 약속한 적 없는 만남이다.':'오래된 주소로 보낸 편지가 되돌아왔다. 윤이 이사를 했다는 것만 알 수 있다. 마지막으로 나눈 대화를 떠올려 본다.','우연',[
      choice('reconnect','친구 윤',reunion?'다음 일정 잠시 미루기':'다시 연락할 길 찾아보기',reunion?'오랜 친구와 앉아, 그동안의 이야기를 듣는다.':'옛 친구에게 물어 새 연락처를 구한다. 답장이 올지는 모른다.','bond',{friend:reunion?4:rnd(8)<.65?3:1,called:true},reunion?'커피가 식을 때까지 이야기를 나눴다. 윤은 내 기억보다 조금 지쳐 있었고, 웃을 때는 예전과 똑같았다.':rnd(8)<.65?'몇 주 뒤 모르는 번호로 전화가 왔다. “나야, 윤.” 다음 주말에 만나기로 했다.':'연락은 바로 닿지 않았다. 하고 싶었던 말을 편지에 남겼다. 내 마음에서 그 사람을 밀어내지는 않기로 했다.',reunion?'우연은 만나게 했고, 머무르겠다는 선택은 다시 가까워지게 했다.':rnd(8)<.65?'우연히 얻은 연락처가, 당신의 시도와 만나 재회가 되었다.':'다시 만나는 일은 나의 선택만으로 정해지지 않았다.',{turn:reunion?'예상하지 못한 재회':rnd(8)<.65?'시간이 지나 도착한 답장':'아직 닿지 않은 마음'}),
      choice('keep-promise','아이','먼저 한 약속 지키기','오늘은 아이와 함께 보내기로 한 날이다. 이야기는 다음을 기약한다.','care',{friend:Math.max(1,s.friend),child:true},'아이와 나란히 걸었다. 이제는 내 손을 잡는 대신, 자기 이야기를 들려주는 사람이 되어 있었다.','하나의 만남을 뒤로 미루고, 이미 곁에 있는 시간을 선택했다.'),
      choice('listen-self','나','마음을 수첩에 적기','그리웠던 건 사람인지, 그때의 나인지 천천히 생각해 본다.','self',{},'사람도 장소도 기억 속 그대로 머물지는 않았다. 돌아오지 않는 시절을 그리워하면서, 오늘의 풍경도 적었다.','지나간 관계를 소중히 여기는 방법은 하나만 있는 게 아니었다.')]); }
  case 6: return event(rnd(9)<.5?'letter-from-home':'quiet-window',rnd(9)<.5?'상자에 담겨 온 집':'조용해진 창가','어머니가 먼저 별이 된 뒤, 오래된 물건을 정리한다. 내 어린 시절보다 더 오래된 사진과 손글씨가 있다. 한 사람의 삶에는 내가 몰랐던 시간이 많았다.','흐르는 시간',[
    choice('keep-letters','어머니의 기억','처음 듣는 이야기 찾기','오래된 편지를 읽고, 어머니를 알던 사람에게 이야기를 청한다.','care',{},'가족에게 전부를 바친 사람이라고만 생각했었다. 편지 속에는 여행하고 싶고, 웃고 싶고, 사랑받고 싶던 한 사람이 있었다.','나를 키운 사람의 인생을, 조금 늦게 알아갔다.'),
    choice('song-memory','나의 꿈','기억을 한 곡에 담기','사라지는 소리들을 내 방식으로 남겨 본다.','dream',{voice:true},'부엌에서 흥얼거리던 소리, 창문을 여는 소리. 정확히 기억나지 않는 부분은 오늘의 내가 채웠다.','아이에게 노래를 보내자, 자기도 그 소리를 기억한다고 했다.'),
    choice('tell-child','자란 아이','아이에게 이야기 건네기','사진 한 장을 앞에 두고, 우리가 어떻게 이어져 왔는지 이야기한다.','bond',{child:true},'아이는 내가 기억하지 못하는 어머니의 말투를 기억했다. 서로 다른 조각들을 맞추자, 한 사람이 잠깐 곁에 돌아온 것 같았다.','한 사람을 기억하는 빛이, 이제는 나 혼자만의 것이 아니었다.')]);
  case 7: {
    const friendBack=s.friend>=3 || (s.called && rnd(10)<.5);
    return event(friendBack?'last-duet':'new-neighbor',friendBack?'느린 손으로 맞추는 박자':'처음 듣는 이웃의 이름',friendBack?'윤이 오래된 악기를 들고 찾아온다. 손은 느려졌지만, 눈을 맞추면 언제 시작할지 알 수 있다. 아이의 아이가 옆에서 신기한 듯 바라본다.':s.companion>1?'이슬과 산책을 나왔다. 길가에서 낯선 이웃이 인사를 건넨다. 오래 살았어도 처음 듣는 이야기와 처음 만나는 사람은 남아 있다.':'이웃이 산책을 권한다. 오래 살았어도 처음 나누는 이야기는 남아 있다. 집에 돌아오면, 손주가 당신의 오래된 물건을 궁금해한다.','또 다른 만남',[
      choice('together',friendBack?'친구 윤':s.companion>1?'이슬':'새로운 이웃',friendBack?'다시 한 곡 연주하기':'조금 더 함께 걷기','오늘의 누군가와, 오늘만의 시간을 보낸다.','bond',{friend:friendBack?4:s.friend,companion:friendBack?s.companion:Math.max(1,s.companion)},friendBack?'틀린 음에 먼저 웃음이 났다. 서로 다르게 살아왔어도, 같은 박자로 시작할 수 있는 순간이 있었다.':'처음 듣는 이야기에 해가 기울었다. 늦게 시작한 인연에도 처음의 설렘은 있었다.','삶의 후반에도 새로운 만남과 재회가 들어올 자리는 남아 있었다.'),
      choice('teach','손주','처음의 서툶 곁에 앉기','손주가 처음 무언가를 배우는 모습을 지켜본다.','dream',{},'손주가 자꾸 같은 곳에서 멈춘다. 나는 대신 해주려던 손을 거두고 기다렸다. 아이는 곧 자기 방식으로 해냈다.','내가 시작한 길에서, 나와 다른 길이 자라나고 있었다.'),
      choice('sunlight','나','볕 좋은 곳에 머무르기','해야 할 일보다, 오늘 좋았던 것을 떠올린다.','self',{},'바람이 좋다고 혼잣말했다. 꼭 대답이 돌아오지 않아도 괜찮았다. 오늘을 좋아할 이유가 아직 있었다.','작고 평범한 하루도 한 생애를 이루는 빛이었다.')]); }
  case 8: return event('last-evening','아주 평범한 마지막 저녁','창밖에 하나둘 별이 켜진다. 당신의 무릎 곁에서 손주가 묻는다. “이건 누구 거야?” 오래 함께한 물건들을 바라보다가, 한 가지를 아이의 손에 쥐여 준다.','남겨지는 것',[
    choice('leave-song','손주','오래된 악보 건네기','정답 없이 자기 노래를 찾아가라는 마음을 담는다.','dream',{},'악보의 빈칸은 고치지 않았다. 아이가 자기 음표를 쓸 수 있도록 그대로 남겨 두었다.','이 노래의 다음 마디는, 내가 알 수 없는 시간에서 시작될 것이다.',{gift:'dream'}),
    choice('leave-letter','손주','한 사람의 이야기 남기기','멀어졌던 인연과 다시 닿았던 날에 대해 적는다.','bond',{},'한때 모든 것이 끝났다고 생각했던 날과, 다시 누군가의 이름을 불렀던 날을 편지에 적었다.','살다 보면, 생각하지 못한 곳에서 다시 만날 수도 있다고.',{gift:'bond'}),
    choice('leave-small','손주',s.tags.care>=s.tags.self?'씨앗 한 봉지 건네기':'여행 수첩 건네기',s.tags.care>=s.tags.self?'천천히 자라는 것을 기다리는 마음을 남긴다.':'다른 사람이 정한 길 밖에도 풍경이 있음을 남긴다.',s.tags.care>=s.tags.self?'care':'self',{},s.tags.care>=s.tags.self?'씨앗 봉투에 아이의 이름을 썼다. 어떤 꽃이 필지는 끝까지 알려주지 않았다.':'수첩의 마지막 장은 비워 두었다. 아이가 처음 보는 세상을 적을 자리가 필요했다.',s.tags.care>=s.tags.self?'내가 보지 못할 봄에, 새로운 꽃이 필 것이다.':'내가 걷지 못한 길에도, 이 작은 시선이 함께할 것이다.',{gift:s.tags.care>=s.tags.self?'care':'self'})]);
  }
}
export function currentScene(life) { const s=derive(life); const e=sceneFor(life,s); return e ? {...e,age:AGES[life.choices.length],era:ERAS[life.choices.length],step:life.choices.length,state:s} : null; }
export function advance(life, eventId, choiceId) {
  const e=currentScene(life); if (!e || e.id!==eventId || !e.choices.some(c=>c.id===choiceId)) throw new Error('이미 지나갔거나 다른 계절의 선택입니다.');
  return {...life,choices:[...life.choices,choiceId]};
}
export function summarize(life) {
  if(life.choices.length!==AGES.length) throw new Error('아직 이어지는 생애입니다.');
  const s=derive(life), keys=Object.keys(PALETTE), dominant=keys.reduce((a,b)=>s.tags[a]>=s.tags[b]?a:b);
  const lastScene=sceneFor(life,derive({...life,choices:life.choices.slice(0,-1)}),8);
  const gift=lastScene.choices.find(c=>c.id===life.choices[8]).gift;
  const titles={bond:'다시 이어진 빛',dream:'멀리 번져 간 노래',care:'곁을 따뜻하게 한 별',self:'자기 속도로 흐른 빛'};
  const lines={bond:'때로 멀어졌고, 때로 다시 만났습니다. 당신은 사람에게 닿는 길을 남겼습니다.',dream:'마음속의 작은 소리가 다른 누군가의 시작이 되었습니다.',care:'당신이 돌본 평범한 날들이 누군가에게는 온 세상이었습니다.',self:'서두르지 않고 바라본 풍경들이 당신만의 하늘을 만들었습니다.'};
  return {generation:life.ancestors.length+1,seed:life.seed,title:titles[dominant],line:lines[dominant],tag:dominant,gift,records:s.records};
}
export function nextGeneration(life, seed) { return newLife(seed,[...life.ancestors,summarize(life)]); }
function validAncestor(a,index) { return a && a.generation===index+1 && Number.isInteger(a.seed) && a.seed>=0 && a.seed<=4294967295 && typeof a.title==='string' && a.title.length<100 && typeof a.line==='string' && a.line.length<400 && Object.hasOwn(PALETTE,a.tag) && Object.hasOwn(GIFTS,a.gift) && Array.isArray(a.records) && a.records.length===9 && a.records.every((r,i)=>r && r.age===AGES[i] && Object.hasOwn(PALETTE,r.tag) && ['title','memory','echo','who'].every(k=>typeof r[k]==='string' && r[k].length<1000)); }
export function deserialize(raw) {
  try { if(typeof raw!=='string' || raw.length>2e6) return null; const life=JSON.parse(raw); if(life.version!==VERSION || !Number.isInteger(life.seed) || life.seed<0 || life.seed>4294967295 || !Array.isArray(life.choices) || life.choices.length>9 || !Array.isArray(life.ancestors) || life.ancestors.length>200 || !life.ancestors.every(validAncestor)) return null; derive(life); return {version:VERSION,seed:life.seed,choices:[...life.choices],ancestors:life.ancestors}; } catch{return null;}
}
export function constellationPoints(records, seed) {
  return records.map((r,i)=>{const angle=-Math.PI/2+i*Math.PI*2/records.length;const radius=.72+chance(seed,i+300)*.24;return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius,tag:r.tag};});
}
