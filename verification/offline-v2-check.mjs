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
const dialogs = [...document.querySelectorAll('dialog')];
const stars = Array.from({length:170},(_,i)=>({x:chance(14253,i),y:chance(57127,i),r:.3+chance(9495,i)*1.2,phase:chance(12,i)*6.28}));
const anyDialog = () => dialogs.some(d=>d.open);
const seed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const say = text => { $('live-region').textContent = text; };
const text = (id,value) => { $(id).textContent = value; };
function element(tag, className, content) { const el=document.createElement(tag); if(className)el.className=className; if(content!==undefined)el.textContent=content; return el; }
function safeLoad() {
  try {
    const raw=localStorage.getItem(SAVE); life=raw!==null ? deserialize(raw) : null;
    unreadableSave=raw!==null && !life ? raw : null;
    if(unreadableSave!==null) { savedOkay=false; text('storage-notice','이전 기록을 읽을 수 없어 그대로 보존하고 있습니다. 새 삶을 시작하기 전에 기록 보관 여부를 확인합니다.'); }
    $('legacy-link').hidden=true;
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
function startScene() {
  scene=currentScene(life); if(!scene){showEnding();return;}
  setView('living'); selected=null; lastNear=-1;
  player={x:.5,y:mobile?.78:.79}; trail=[];
  text('era',scene.era); text('age',scene.age);
  text('place',scene.step===0?'처음의 작은 마당':scene.state.home==='city'?'낯선 도시의 하루':scene.state.home==='sea'?'바다가 보이는 마을':'익숙한 동네의 하루');
  text('scene-kind',scene.kind); text('scene-title',scene.title); text('scene-text',scene.text);
  const progress=$('progress'); progress.replaceChildren(); AGES.forEach((age,i)=>{const dot=element('span',i<scene.step?'past':i===scene.step?'now':'');dot.title=`${age}살`;progress.append(dot);});
  progress.setAttribute('aria-label',`아홉 순간 중 ${scene.step+1}번째, ${scene.age}살`);
  const gift=life.ancestors.at(-1)?.gift;
  $('inheritance-hint').hidden=!gift;
  if(gift)text('inheritance-hint',`${GIFTS[gift].symbol} 물려받은 ${GIFTS[gift].object}\n먼저 살았던 사람의 마음이 곁에 있습니다.`);
  $('paths').replaceChildren();
  scene.choices.forEach((c,i)=>{
    const b=element('button','path-node'); b.style.setProperty('--node',PALETTE[c.tag]);
    b.setAttribute('aria-label',`${c.who} · ${c.title}`);
    b.append(element('span','path-symbol',symbols[c.tag]),element('span','path-who',c.who),element('span','path-title',c.title),element('span','path-arrow','다가가 살펴보기 ↗'));
    b.onclick=()=>{if(anyDialog())return;lastNear=-1;target={...nodes[i],index:i};text('travel-hint',`${c.who}에게 향하는 중…`);};
    $('paths').append(b);
  });
  layoutNodes(); renderRelations(); text('travel-hint','마음이 향하는 빛에 다가가 보세요.');
  say(`${scene.age}살. ${scene.title}. ${scene.text}`);
}
function layoutNodes() {
  nodes=mobile ? [{x:.23,y:.51},{x:.77,y:.55},{x:.49,y:.70}] : [{x:.35,y:.39},{x:.64,y:.45},{x:.43,y:.65}];
  if(mobile && H<710) nodes=[{x:.23,y:.52},{x:.77,y:.56},{x:.49,y:.72}];
  [...$('paths').children].forEach((b,i)=>{ b.style.left=`${nodes[i].x*100}%`; b.style.top=`${nodes[i].y*100}%`; });
  if(view==='afterlife')layoutStars();
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
  text('choice-who',`${scene.age}살 · ${selected.who}`);text('choice-title',selected.title);text('choice-text',selected.detail);
  $('choice-art').innerHTML=illustration(selected.tag,scene.age);
  showDialog('choice-dialog');
}
function commitChoice() {
  if(!selected || !scene || view!=='living')return;
  const chosen=selected; selected=null;
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
  $('memory-next').replaceChildren(document.createTextNode(mode==='continue'?(life.choices.length===9?'나의 삶을 별로 남기기':'삶은 계속 흘러갑니다'):'기억에서 돌아가기'),element('span','',mode==='continue'?'→':'↩'));
  showDialog('memory-dialog');say(`${record.title}. ${record.memory}`);
}
function finishMemory() {closeDialog('memory-dialog');if(memoryMode==='continue')startScene();}
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
  const entries=(life?.ancestors||[]).map((a,i)=>({name:`${i+1}번째 삶 · ${a.title}`,records:a.records,summary:a}));
  entries.push({name:life?.ancestors.length?`${life.ancestors.length+1}번째 삶 · 지금의 나`:'지금의 나',records:life?derive(life).records:[]});
  entries.forEach((entry,i)=>{const b=element('button','ancestor-chip',entry.name);b.onclick=()=>selectJournal(i);$('ancestor-list').append(b);});
  function selectJournal(index) {
    [...$('ancestor-list').children].forEach((el,i)=>{el.classList.toggle('active',i===index);el.setAttribute('aria-pressed',String(i===index));});
    const entry=entries[index];$('journal-records').replaceChildren();
    if(entry.summary){const p=element('p','journal-intro',`${entry.summary.line} 남긴 것: ${GIFTS[entry.summary.gift].title}.`);$('journal-records').append(p);}
    if(!entry.records.length){$('journal-records').append(element('p','empty-journal','아직 쓰이지 않은 시간입니다. 첫 만남을 향해 걸어가 보세요.'));return;}
    entry.records.forEach(r=>{const article=element('article','journal-entry');article.append(element('small','',`${r.age}살 · ${r.who}`),element('h3','',r.title),element('p','',r.memory));$('journal-records').append(article);});
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
  layoutNodes();if(oldMobile!==mobile&&view==='living'){player={x:.5,y:mobile?.78:.79};trail=[];target=null;}
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
  // Separate lives drift close, cross briefly, and continue in their own direction.
  ribbon(.22,1,.24,.20,'#91d8dc',.7,.14,.17);ribbon(.83,1,.65,.17,'#b9b0ed',.7,.17,-.22);
  ribbon(.5,1,.5,.78,'#f1d49d',2,.65,.04);
  nodes.forEach((n,i)=>{const c=scene.choices[i];ribbon(.5,.80,n.x,n.y,PALETTE[c.tag],1,.18,i===1?.12:-.08);glow(n.x*W,(n.y*H)-30,48,PALETTE[c.tag],.2);});
  if(trail.length>1){ctx.lineWidth=1.4;ctx.strokeStyle='#edcf97';ctx.globalAlpha=.7;ctx.beginPath();trail.forEach((p,i)=>i?ctx.lineTo(p.x*W,p.y*H):ctx.moveTo(p.x*W,p.y*H));ctx.stroke();ctx.globalAlpha=1;}
  const px=player.x*W,py=player.y*H;
  glow(px,py,reduced.matches?24:27+Math.sin(now*2)*3,'#f3d39e',.85);point(px,py,3.2,'#f9e7c1',false);
  ctx.strokeStyle='#eddaa955';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(px,py,10,0,6.29);ctx.stroke();
  if(trail.length<2){ctx.fillStyle='#b5b5a4';ctx.font='9px "Malgun Gothic", sans-serif';ctx.textAlign='center';ctx.fillText('나',px,py+25);}
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
  const keyboard=dx!==0||dy!==0;
  if(keyboard){target=null;const len=Math.hypot(dx,dy);dx/=len;dy/=len;}
  else if(target){dx=(target.x-player.x)*W;dy=(target.y-player.y)*H;const len=Math.hypot(dx,dy);if(len<7){player={x:target.x,y:target.y};const index=target.index;target=null;if(index!==undefined)inspect(index);return;}dx/=len;dy/=len;dt=Math.min(dt,len/250);}
  else return;
  const prev={...player};player.x=Math.max(.06,Math.min(.94,player.x+dx*dt*250/W));player.y=Math.max(mobile?.41:.24,Math.min(.85,player.y+dy*dt*250/H));
  if(Math.hypot((prev.x-player.x)*W,(prev.y-player.y)*H)>0.1){trail.push({...player});if(trail.length>700)trail.shift();}
  if(keyboard){const near=nodes.findIndex(n=>Math.hypot((n.x-player.x)*W,(n.y-player.y)*H)<27);if(near<0)lastNear=-1;else if(near!==lastNear)inspect(near);}
}
function frame(time) {
  const dt=Math.min((time-lastTime)/1000||0,.04);lastTime=time;
  if(!document.hidden && !anyDialog())now+=dt;
  movePlayer(dt);landscape();drawAncestors();
  if(view==='welcome')drawWelcome();else if(view==='living')drawLiving();else if(view==='afterlife')drawEnding();else drawInheritance();
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
  const k=e.key.toLowerCase();if(view==='living'&&['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'].includes(k)){e.preventDefault();keys.add(k);}
});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
canvas.addEventListener('pointerdown',e=>{if(view!=='living'||anyDialog())return;const x=e.clientX/W,y=e.clientY/H;if(y<(mobile?.41:.24)||y>.85)return;target={x:Math.max(.06,Math.min(.94,x)),y};lastNear=-1;});
window.addEventListener('blur',()=>{keys.clear();pause();});
document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden){pause();soundContext?.suspend();}else if(soundOn&&!$('pause-dialog').open)soundContext?.resume();});
window.addEventListener('resize',resize);
window.addEventListener('storage',e=>{if(e.key===SAVE&&e.newValue!==JSON.stringify(life)){say('다른 창에서 진행이 바뀌었습니다. 이 창의 진행은 유지되며 다음 선택이 현재 저장을 갱신합니다.');text('storage-notice','다른 창에서도 이야기가 진행되고 있습니다. 저장이 덮이지 않도록 한 창에서 이어가 주세요.');}});
safeLoad();resize();requestAnimationFrame(frame);
