// Optional moments happen before the chapter's lasting choice. Their effects are
// replayed in order, so taking a detour is part of the saved life, not a reroll.
const make = (id,who,title,detail,tag,effect,memory,echo,extra={}) => ({id,who,title,detail,tag,effect,memory,echo,...extra});
export const PLACES = [
  ['담장과 작은 집','동네 책방','언덕의 공터'],
  ['학교 뒤뜰','작은 음악실','낡은 공방'],
  ['밤의 정거장','여행자의 쉼터','강 건너 골목'],
  ['단골 가게','사람들이 모이는 광장','나만의 작업실'],
  ['우리 집 창가','동네 정원','강변의 산책길'],
  ['비를 피하는 가게','오래된 우체국','갈림길의 벤치'],
  ['어머니의 집','마을 기록실','물가의 작은 집'],
  ['느린 오후의 마당','아이들의 작업실','해 질 녘 언덕'],
  ['별이 보이는 창가','남겨 둔 작은 서랍','다음 봄의 정원']
];
const detourScenes = [
  [
    ['우체통에 끼인 비행기','담장 위에 걸린 종이비행기를 아이가 올려다보고 있다.','같이 꺼내 주기','이름을 물어본 뒤 함께 막대기를 찾아왔다. 짧은 인사가 다음 놀이 약속이 되었다.'],
    ['책 속의 낙서','책방 구석에서 누군가 음표를 그려 놓은 책을 발견했다.','소리 내어 따라 읽기','읽을 수 없는 음표를 내 마음대로 불렀다. 주인은 웃으며 작은 악보 한 장을 주었다.'],
    ['처음 보는 샛길','공터 뒤로 낯선 작은 길이 이어진다.','길 끝까지 가보기','길 끝에는 낮에도 달이 보이는 자리가 있었다. 다시 찾아올 수 있도록 돌 하나를 놓았다.']
  ],
  [
    ['혼자 남은 친구','친구가 축제 준비를 하다가 혼자 의자를 나르고 있다.','함께 의자 옮기기','말없이 의자를 함께 날랐다. 끝나고 나서야 친구가 요즘의 고민을 털어놓았다.'],
    ['열린 음악실','아무도 없는 음악실에서 한 마디만 더 연주할 수 있다.','한 번 더 연습하기','잘 안 되던 마디가 잠깐 자연스럽게 흘렀다. 내일 다시 틀리더라도 오늘의 감각은 남았다.'],
    ['고장 난 라디오','공방 주인이 오래된 라디오 뚜껑을 열고 있다.','옆에서 고쳐 보기','나사를 건네고 주파수를 맞췄다. 잡음 사이에서 노래가 들리는 순간을 함께 들었다.']
  ],
  [
    ['누군가 기다리는 전화','출발 전, 아직 전하지 못한 안부가 떠오른다.','짧게 전화 걸기','어디로 가는지 이야기했다. 친구는 멀리 가더라도 도착하면 연락해 달라고 했다.'],
    ['이름 없는 노래','여행자가 작은 악기로 낯선 노래를 연주한다.','마지막 마디 배우기','손가락을 몇 번이나 바꾸어 짚었다. 헤어질 때는 서로 같은 멜로디를 흥얼거렸다.'],
    ['돌아가는 배','강을 건너는 작은 배가 마지막 손님을 기다린다.','강 건너 풍경 보기','반대편에서 보니 떠나온 곳이 작고 낯설었다. 다른 곳에 살아도 괜찮을 것 같았다.']
  ],
  [
    ['가게 앞의 안부','늘 인사하던 이웃이 오늘은 말없이 앉아 있다.','옆에 앉아 듣기','해결해 줄 수 없는 이야기였다. 그래도 끝까지 듣고 나니 다음에 차 한 잔 하자는 말이 나왔다.'],
    ['연습을 듣는 사람','누군가 서툰 연주에도 발걸음을 멈춘다.','한 곡 끝까지 들려주기','관객은 한 사람이었다. 눈을 마주치고 마지막 음까지 내보는 연습을 했다.'],
    ['빈 공간의 열쇠','작업실 주인이 주말 동안 공간을 써도 좋다고 한다.','작은 모임 열어보기','서로 할 줄 아는 것을 가져왔다. 한 사람의 빈 방이 잠깐 동네의 거실이 되었다.']
  ],
  [
    ['말하지 못한 피곤함','가족의 하루가 오늘따라 길어 보인다.','서로의 시간 나누기','각자 혼자 있고 싶은 시간도 이야기했다. 내일은 한 사람이 잠깐 쉬기로 했다.'],
    ['아이의 다른 박자','아이가 노래를 전혀 다른 박자로 따라 부른다.','아이 박자에 맞추기','고치려던 말을 멈췄다. 처음 들어보는 리듬인데, 둘이 같이 부르니 노래가 되었다.'],
    ['빈 화단 한 칸','동네 정원에 아직 주인이 없는 화단이 있다.','이웃과 함께 심기','무엇을 심을지 한참 상의했다. 내 식물이 아니라 함께 돌볼 작은 자리가 생겼다.']
  ],
  [
    ['묻어 둔 연락처','수첩에서 오래된 전화번호 하나를 찾았다.','안부 남겨 두기','한동안 쓰지 않던 말투로 안부를 적었다. 답장을 재촉하지 않고, 닿을 자리를 남겼다.'],
    ['상자 속 연습장','오래전 연습하던 악보가 접힌 채 남아 있다.','다시 펼쳐 연주하기','손이 기억하는 부분과 잊어버린 부분이 있었다. 지금의 속도로 한 마디씩 채웠다.'],
    ['어느 길로 갈까','늘 가던 길 옆으로 물가를 따라 걷는 길이 있다.','처음 보는 길로 걷기','약속이 없는 오후를 길게 걸었다. 낯선 골목의 작은 간판을 수첩에 적어 두었다.']
  ],
  [
    ['어머니를 알던 이웃','이웃이 당신은 모르는 어머니의 별명을 부른다.','그 시절 이야기 듣기','내가 태어나기 전의 웃음과 꿈을 들었다. 어머니라는 이름 바깥의 한 사람이 가까워졌다.'],
    ['오래된 녹음기','테이프에 아주 짧은 노랫소리가 남아 있다.','남은 소리 따라 부르기','끊어진 소리 뒤를 오늘의 목소리로 이었다. 사라진 부분에도 내 기억이 들어갈 수 있었다.'],
    ['집 밖의 첫 아침','오랫동안 미뤄 둔 작은 여행을 생각한다.','가벼운 가방 꾸리기','꼭 필요한 것만 넣고 문을 닫았다. 늦게 시작하는 일에도 처음의 설렘이 있었다.']
  ],
  [
    ['늦은 오후의 초대','이웃이 의자를 하나 더 내어 놓는다.','차 한 잔 함께하기','처음 듣는 이름과 익숙한 고민이 섞였다. 나이와 상관없이 친구가 되는 데는 시간이 필요했다.'],
    ['아이의 첫 연습','손주가 잘 안 된다며 악기를 내려놓는다.','옆에서 천천히 맞추기','대신 해주지 않고 같은 속도로 연주했다. 아이는 자기 음을 찾아 다시 시작했다.'],
    ['멀리 보이는 지붕','언덕 아래에 내가 지나온 동네가 보인다.','걸어온 곳 그려 보기','정확한 지도는 아니었다. 생각나는 사람과 냄새를 적자 나만 알아볼 수 있는 길이 되었다.']
  ],
  [
    ['마지막으로 하고 싶은 말','짧게라도 전하고 싶은 안부가 남아 있다.','누군가의 손 잡기','대단한 말은 떠오르지 않았다. 함께 있어 줘서 고맙다는 말을 천천히 전했다.'],
    ['다음 사람의 노래','손주가 아직 끝나지 않은 노래를 흥얼거린다.','끝까지 들어 주기','내가 알던 멜로디와 다른 곳으로 흘러갔다. 그 다름을 고치지 않고 들어 주었다.'],
    ['다음 봄의 자리','정원 한쪽이 비어 있다. 다음 봄을 위한 자리다.','작은 이름표 남기기','아직 피지 않은 꽃의 이름 대신 “네가 좋아하는 것”이라고 적었다.']
  ]
];
export function detourFor(life,state,step,place) {
  const row=detourScenes[step]?.[place]; if(!row)return null;
  const [title,detail,act,memory]=row;
  const effect=place===0?{friend:Math.min(4,state.friend+1),called:step>=2?true:state.called}
    :place===1?{practice:state.practice+1}
    :{horizon:(state.horizon||0)+1,community:(state.community||0)+(step===3||step===4?1:0)};
  return {id:`detour-${step}-${place}`,title,text:detail,choices:[
    make('stay',PLACES[step][place],act,detail,place===0?'bond':place===1?'dream':'self',effect,memory,
      place===0?'이 짧은 안부가 훗날 다시 연락할 자리를 남겼다.':place===1?'오늘의 작은 연습은 훗날 갑작스러운 무대에서 힘이 된다.':'걸어본 곳이 늘어날수록, 다음에 고를 수 있는 삶의 방향도 달라진다.'),
    make('notice',PLACES[step][place],'잠깐 바라보고 기록하기','마음을 보태는 대신, 지금의 내 느낌을 수첩에 적는다.','self',{horizon:(state.horizon||0)+1},`그날의 ${title}을 수첩에 적었다. 모든 만남에 머무르지는 않았지만, 보지 못했던 하루는 아니었다.`,'곁에 머무르는 것과 지나가는 것, 둘 다 나의 선택이었다.')
  ]};
}
export function extraChoices(life,s,step) {
  const artisan=s.vocation==='artisan', traveler=s.vocation==='traveler',keeper=s.vocation==='keeper';
  const rows=[
    [
      ['book','책방 주인','모르는 이야기 따라 읽기','책 속에서 지금의 동네보다 넓은 세상을 만난다.','self',{horizon:s.horizon+1},'글자를 다 읽을 수는 없었다. 그림을 따라 나만의 이야기를 만들었다.','모르는 것을 궁금해하는 마음이 생겼다.'],
      ['rhythm','동네 악사','처음의 박자 배우기','어설픈 손뼉으로 거리의 노래에 끼어든다.','dream',{practice:1},'박자가 자꾸 어긋났다. 악사는 내 박자에 맞추어 속도를 늦추었다.','잘하기 전에 함께할 수 있다는 것을 배웠다.'],
      ['lost','낯선 이웃','길 잃은 사람 도와주기','집으로 돌아가는 길을 함께 찾는다.','care',{community:1},'둘이 길을 묻다 보니 동네를 한 바퀴 돌았다. 집에 도착했을 때는 이름을 아는 사이가 되었다.','한 번의 친절은 동네를 조금 덜 낯설게 했다.']
    ],
    [
      ['reading','나의 관심','책방에서 다른 꿈 찾기','음악 밖에도 내가 좋아할 수 있는 세계가 있을까.','self',{horizon:s.horizon+1,vocation:'traveler'},'지도와 여행기를 읽으며 가보고 싶은 곳을 골랐다. 남의 꿈을 따라가지 않아도 좋았다.','훗날 떠나는 선택에서 이 작은 목록이 떠오른다.'],
      ['club','동네 친구들','작은 모임 만들기','누구나 잠깐 들를 수 있는 자리를 만든다.','care',{community:s.community+1,vocation:'keeper'},'음악을 못 하는 친구도, 말없이 있는 친구도 들어왔다. 모임에 특별한 자격은 필요 없었다.','함께 있을 곳을 만드는 일이 나의 관심이 되었다.'],
      ['apprentice','공방 주인','손으로 만드는 일 배우기','연주 대신 고장 난 물건을 고쳐 보고 싶다.','dream',{vocation:'artisan'},'처음 고친 의자는 조금 흔들렸다. 주인은 다시 풀어보자고 했다. 두 번째에는 오래 앉을 수 있었다.','이날 배운 손일이 훗날 나의 일로 이어질 수 있다.']
    ],
    [
      ['wander-road','먼 길','목적지 없이 더 가보기',s.horizon>1?'산책하며 적어 둔 장소 중 하나로 떠난다.':'예정에 없던 작은 마을에서 며칠 머문다.','self',{home:'sea',distance:true,horizon:s.horizon+1,vocation:'traveler'},'표를 다시 끊었다. 지도에서 작은 이름이던 곳에 내 방과 단골 가게가 생겼다.','그곳에서의 생활은 처음 세운 계획에는 없었다.'],
      ['repair-shop','골목 공방',artisan?'배운 손일로 첫 일 시작하기':'수리점의 견습생 되기','낯선 동네에서 손으로 만드는 일을 시작한다.','dream',{home:'city',distance:true,vocation:'artisan'},artisan?'예전에 익힌 손길이 첫 일감을 끝내 주었다. 완성된 물건보다 내 이름이 적힌 작업표를 오래 바라봤다.':'모르는 것투성이였지만 하나씩 물었다. 월급보다 먼저 손에 작은 굳은살이 생겼다.','작은 기술이 삶을 지탱하는 일로 자라기 시작했다.'],
      ['neighbors','고향 이웃','마을에 남아 함께 일하기','누군가 떠나고 남긴 가게를 이웃과 나누어 쓴다.','care',{home:'town',distance:false,vocation:'keeper',community:s.community+1},'가게의 빈 자리를 각자의 물건으로 채웠다. 큰 성공은 아니어도 아침마다 열어야 할 문이 생겼다.','가까이 있는 사람들과 새로운 생활을 만들었다.']
    ],
    [
      ['community-table','이웃들',keeper?'함께 쓰는 가게 넓히기':'동네의 저녁 식탁 열기','혼자 이루는 일보다 함께 머물 자리를 만든다.','care',{community:s.community+1,vocation:'keeper'},'각자 할 수 있는 만큼 가져왔다. 식탁은 작았지만 다음에 또 만나자는 말이 많았다.','이곳을 기억하는 사람들이 이후의 삶에도 찾아온다.'],
      ['journey-work','나의 길',traveler?'다른 마을에서 일해 보기':'쉬어 가며 방향 바꾸기','한 번 선택한 일이 평생의 답일 필요는 없다.','self',{home:'sea',horizon:s.horizon+1,vocation:'traveler'},'익숙한 일을 내려놓는 데 시간이 걸렸다. 새로운 생활은 불안했지만 내가 고른 리듬이었다.','기존의 길로 돌아가지 않아도 삶은 계속되었다.'],
      ['workshop','나의 손',artisan?'내 이름의 공방 열기':'서툰 취미를 일로 키우기','크지 않아도 내가 책임질 수 있는 일을 만든다.','dream',{vocation:'artisan'},artisan?'처음 고쳤던 의자를 문 앞에 놓았다. 공방의 첫 손님은 그 의자에 앉아 오래 이야기를 나눴다.':'저녁마다 익힌 손일을 이웃에게 보여주었다. 주문은 작았지만 처음으로 내 이름을 붙였다.','음악과는 다른 방식으로 나의 꿈이 자리를 얻었다.']
    ],
    [
      ['shared-garden','이웃과 아이','아이와 동네 정원 가꾸기','가족 밖에도 아이를 반겨줄 사람을 만난다.','care',{child:true,community:s.community+1},'아이는 이웃의 이름을 하나씩 외웠다. 돌봄은 집의 벽 안에서만 이루어지는 일이 아니었다.','내가 없는 날에도 아이를 반겨줄 자리가 생겼다.'],
      ['family-trip','아이','함께 낯선 곳에 살아보기','익숙함을 잠시 내려놓고 가족의 다른 생활을 찾는다.','self',{child:true,home:'sea',horizon:s.horizon+1},'짐은 적게 쌌지만 걱정은 많았다. 아이는 먼저 바다의 소리를 좋아하게 되었다.','우리 가족에게는 같은 풍경을 처음 본 기억이 생겼다.'],
      ['make-toy','아이',artisan?'작은 나무 장난감 만들기':'일하는 모습을 보여주기','내가 하는 일과 그 일을 좋아하는 이유를 들려준다.','dream',{child:true},'아이는 완성품보다 실패한 조각을 좋아했다. 잘 안 된 것도 내 하루의 일부라고 말해 주었다.','아이는 자라서 나와 다른 일을 꿈꾸게 될 것이다.']
    ],
    [
      ['new-skill','나','늦게 시작하는 배움 고르기','지금의 생활 안에 새로운 관심사를 넣는다.','dream',{practice:s.practice+1},'교실에서 가장 나이가 많았다. 대신 질문을 가장 많이 했다. 처음 배우는 사람은 모두 서툴렀다.','오래 살아도 아직 시작하지 않은 나의 모습이 남아 있었다.'],
      ['return-place','옛 이웃',keeper?'함께 만들던 가게 돌아보기':'한때 살던 동네 찾아가기','사람은 달라졌어도 남아 있는 흔적을 찾아본다.','bond',{called:true,friend:Math.max(2,s.friend)},'가게의 주인은 바뀌었지만 나를 기억하는 사람이 있었다. 그 사람을 통해 오래된 친구의 안부를 들었다.','익숙한 장소가 다시 만날 실마리가 되었다.'],
      ['long-walk','나의 길',traveler?'다음 마을로 걸어가기':'며칠간 혼자 여행하기','누군가의 역할에서 잠깐 벗어나 나로 걸어본다.','self',{horizon:s.horizon+1},'누구의 부모인지 무슨 일을 하는지 묻지 않는 곳에서 며칠을 보냈다. 집에 돌아오니 그 이름들도 다시 소중했다.','혼자 다녀온 길이 곁의 사람을 멀어지게만 하지는 않았다.']
    ],
    [
      ['archive','동네 사람들','누군가의 삶 기록하기','가족의 기억을 넘어 동네에 살았던 사람들의 이야기를 모은다.','care',{community:s.community+1},'서로의 기억은 조금씩 달랐다. 한 사람의 삶을 하나의 문장으로 정리하지 않기로 했다.','남겨진 기록은 훗날 처음 온 사람에게 건네졌다.'],
      ['teach-craft','배우려는 이웃',artisan?'공방의 문을 열어 두기':'내가 아는 작은 것 가르치기','잘하는 일이 누군가의 처음이 될 수 있다.','dream',{},'설명하다 보니 나도 처음의 어려움을 떠올렸다. 가르치는 사람과 배우는 사람의 경계가 흐려졌다.','내 손에서 끝날 줄 알았던 일이 다른 손으로 이어졌다.'],
      ['new-home','나','작은 집에서 새로 시작하기','떠난 사람의 기억을 품고 내 생활의 모양을 바꾼다.','self',{home:'sea',horizon:s.horizon+1},'필요한 것만 가져왔다. 버린 것은 추억이 아니라, 더는 쓰지 않는 물건들이었다.','기억을 간직하면서도 다른 풍경을 고를 수 있었다.']
    ],
    [
      ['open-door','찾아온 이웃',s.community>1?'함께한 사람들이 찾아오다':'처음 보는 이웃 초대하기','어느 시절이든 새로운 관계를 시작할 수 있다.','care',{community:s.community+1},s.community>1?'작은 식탁과 정원에서 만났던 사람들이 음식을 들고 왔다. 내가 만든 줄 알았던 자리가 어느새 나를 돌보고 있었다.':'문을 열고 차를 내었다. 오래된 이야기를 처음 듣는 사람에게 들려주는 오후였다.','건넨 친절은 내가 예상하지 못한 모양으로 돌아왔다.'],
      ['last-trip','손주',s.horizon>2?'내가 사랑한 길 함께 걷기':'손주와 처음 보는 곳 가기','내가 고른 길을 보여주되, 같은 길을 강요하지 않는다.','self',{},'갈림길에서 아이는 내가 고르지 않았을 쪽을 가리켰다. 따라가 보니 내가 몰랐던 풍경이 있었다.','다음 삶은 내 삶의 반복이 아닐 것이다.'],
      ['finish-work','나의 꿈',artisan?'미완성 물건 마무리하기':'아직 남은 꿈에 손 대기','결과를 남기지 못하더라도 지금 하고 싶은 것을 해본다.','dream',{},'완벽하지 않은 채로 마무리했다. 누군가 이어 고칠 수 있도록 쓰던 도구도 옆에 놓았다.','끝낸 것뿐 아니라 남겨 둔 빈칸도 누군가에게는 시작이다.']
    ],
    [
      ['leave-seeds','손주','씨앗과 기다림 건네기','어떤 꽃을 키울지는 아이가 정한다.','care',{},'씨앗마다 이름을 쓰지 않았다. 함께 기다렸던 시간을 기억해 주면 좋겠다고 생각했다.','내가 보지 못할 봄을 위한 작은 선물이다.',{gift:'care'}],
      ['leave-notebook','손주','빈 장이 남은 수첩 건네기','아이가 나와 다른 길을 기록할 자리를 남긴다.','self',{},'수첩의 마지막 절반은 비워 두었다. 내가 걸은 길보다 아이가 걸을 길이 더 궁금했다.','누군가의 끝 다음에도 길은 이어진다.',{gift:'self'}],
      ['leave-invitation','다음 사람','열린 문을 기억하게 하기','나의 집에 모였던 사람들의 이름을 남긴다.','bond',{},'서로를 모르는 사람들의 이름을 같은 종이에 적었다. 언젠가 그들이 서로를 알아볼 수 있기를 바랐다.','내가 맺은 인연의 다음 장은 다른 사람들이 쓴다.',{gift:'bond'}]
    ]
  ];
  return rows[step].map(r=>make(...r));
}

export const WORLD = {width:1600,height:1100};
export const LANDMARKS = [{x:390,y:470},{x:1130,y:350},{x:1050,y:870}];
export const SPAWN = {x:690,y:710};
export function clampPoint(p) {
  return {x:Math.max(60,Math.min(WORLD.width-60,p.x)),y:Math.max(90,Math.min(WORLD.height-60,p.y))};
}
export function cameraFor(player,width,height) {
  const zoom=width<=760?.7:.9;
  return {x:player.x-width/2/zoom,y:player.y-height*.57/zoom,zoom};
}
export function project(p,camera) {return {x:(p.x-camera.x)*camera.zoom,y:(p.y-camera.y)*camera.zoom};}
export function unproject(p,camera) {return clampPoint({x:p.x/camera.zoom+camera.x,y:p.y/camera.zoom+camera.y});}
export function walk(player,vector,dt,speed=300) {
  const length=Math.hypot(vector.x,vector.y); if(!length)return {...player};
  const distance=Math.min(Math.max(0,dt),.05)*speed;
  return clampPoint({x:player.x+vector.x/length*distance,y:player.y+vector.y/length*distance});
}

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
export function newLife(seed, ancestors = [], edition = 3) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 4294967295) throw new Error('Invalid seed');
  return { version: VERSION, edition, seed, ancestors: structuredClone(ancestors), choices: [], wander: [] };
}
function choice(id, who, title, detail, tag, effect, memory, echo, extra = {}) { return {id,who,title,detail,tag,effect,memory,echo,...extra}; }
function event(id,title,text,kind,choices) { return {id,title,text,kind,choices}; }
export function derive(life) {
  const state = { friend:1, companion:0, home:'town', practice:0, voice:false, child:false, called:false, joined:false, distance:false, horizon:0, community:0, vocation:null, detours:[], records:[], tags:{bond:0,dream:0,care:0,self:0} };
  const visits=life.wander||[];
  if(!Array.isArray(visits)||visits.length>27)throw new Error('잘못된 산책 기록입니다.');
  let lastStep=-1;const seen=new Set();
  for(const v of visits){
    const key=`${v?.step}:${v?.place}`;
    if(life.edition!==3||!Number.isInteger(v?.step)||v.step<lastStep||v.step<0||v.step>Math.min(8,life.choices.length)||!Number.isInteger(v.place)||v.place<0||v.place>2||seen.has(key)||!['stay','notice'].includes(v.choice))throw new Error('잘못된 산책 기록입니다.');
    seen.add(key);lastStep=v.step;
  }
  for (let step=0;step<=life.choices.length;step++) {
    for(const v of visits.filter(v=>v.step===step)){
      const e=detourFor(life,state,step,v.place),c=e.choices.find(c=>c.id===v.choice);
      Object.assign(state,c.effect);state.tags[c.tag]+=.25;
      state.detours.push({step,place:v.place,age:AGES[step],title:c.title,event:e.title,who:c.who,memory:c.memory,echo:c.echo,tag:c.tag});
    }
    if(step===life.choices.length)break;
    const id=life.choices[step];
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
  if(life.edition===3)result.choices.push(...extraChoices(life,s,step));
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
export function currentScene(life) { const s=derive(life); const e=sceneFor(life,s); return e ? {...e,age:AGES[life.choices.length],era:ERAS[life.choices.length],step:life.choices.length,state:s,places:PLACES[life.choices.length]} : null; }
export function currentDetour(life,place) {
  if(life.edition!==3||life.choices.length>=9||!Number.isInteger(place)||place<0||place>2)return null;
  if(life.wander.some(v=>v.step===life.choices.length&&v.place===place))return null;
  return detourFor(life,derive(life),life.choices.length,place);
}
export function explore(life,place,choiceId) {
  const e=currentDetour(life,place);
  if(!e||!e.choices.some(c=>c.id===choiceId))throw new Error('이미 머물렀거나 없는 장소입니다.');
  return {...life,wander:[...life.wander,{step:life.choices.length,place,choice:choiceId}]};
}
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
  if(dominant==='dream'&&s.vocation==='artisan'){titles.dream='다른 손으로 이어진 빛';lines.dream='당신의 손이 고치고 만들던 것들이, 다른 누군가의 시작이 되었습니다.';}
  return {generation:life.ancestors.length+1,seed:life.seed,title:titles[dominant],line:lines[dominant],tag:dominant,gift,records:s.records,detours:s.detours};
}
export function nextGeneration(life, seed) { return newLife(seed,[...life.ancestors,summarize(life)]); }
function validAncestor(a,index) { return a && a.generation===index+1 && Number.isInteger(a.seed) && a.seed>=0 && a.seed<=4294967295 && typeof a.title==='string' && a.title.length<100 && typeof a.line==='string' && a.line.length<400 && Object.hasOwn(PALETTE,a.tag) && Object.hasOwn(GIFTS,a.gift) && Array.isArray(a.records) && a.records.length===9 && a.records.every((r,i)=>r && r.age===AGES[i] && Object.hasOwn(PALETTE,r.tag) && ['title','memory','echo','who'].every(k=>typeof r[k]==='string' && r[k].length<1000)); }
export function deserialize(raw) {
  try { if(typeof raw!=='string' || raw.length>2e6) return null; const life=JSON.parse(raw); if(life.version!==VERSION || !Number.isInteger(life.seed) || life.seed<0 || life.seed>4294967295 || !Array.isArray(life.choices) || life.choices.length>9 || !Array.isArray(life.ancestors) || life.ancestors.length>200 || !life.ancestors.every(validAncestor)) return null; life.edition??=3;life.wander??=[];if(![2,3].includes(life.edition))return null;derive(life); return {version:VERSION,edition:life.edition,seed:life.seed,choices:[...life.choices],ancestors:life.ancestors,wander:life.wander}; } catch{return null;}
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
