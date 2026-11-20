/**
 * ZERO가 먼저 만든 무구의 이야기·생김새·참고 글. 도감과 출처 목록에서만 쓰므로 첫 화면 묶음에서 빼고 따로 받습니다(lore.js).
 * 이야기와 생김새는 위키백과·나무위키를 참고했고(sources), 확인되지 않는 설은 글에 그렇다고 적었습니다.
 * @type {Record<string, { lore: string, look: string, sources: string[] }>}
 */
export const TUNED_LORE = {
  mjolnir: {
    lore: "드베르그 형제 신드리와 브로크가 만든 토르의 망치. 던지면 반드시 토르의 손으로 돌아옵니다. 만드는 동안 로키가 방해해 손잡이가 짧아졌다고 합니다.",
    look: "짧은 손잡이에 굵은 망치머리",
    sources: ["https://ko.wikipedia.org/wiki/묠니르", "https://namu.wiki/w/묠니르"],
  },
  gungnir: {
    lore: "이발디의 아들들이 만든 오딘의 투창. 멈추지 않고 꿰뚫는다고 전해 방어를 무시합니다. ‘반드시 명중한다’는 이야기는 후대의 해석입니다.",
    look: "날에 룬을 새긴 긴 투창",
    sources: ["https://ko.wikipedia.org/wiki/궁니르", "https://namu.wiki/w/궁니르"],
  },
  brisingamen: {
    lore: "드베르그 넷이 만든 프레이야의 목걸이. 로키가 훔쳐 갔으나 헤임달이 되찾아 돌려주었습니다. 이름은 ‘불’ 또는 ‘호박’ 목걸이로 풀이됩니다.",
    look: "금빛 고리에 불빛 보석을 단 목걸이",
    sources: ["https://ko.wikipedia.org/wiki/브리싱가멘", "https://namu.wiki/w/브리싱가멘"],
  },
  aegis: {
    lore: "헤파이스토스가 만들었다는 제우스의 방패. 본래는 염소가죽 외투였다고도 합니다. 흔들면 폭풍과 공포가 일고, 가운데에는 고르곤의 머리가 달려 있습니다.",
    look: "가운데 고르곤의 머리, 가장자리에 뱀",
    sources: ["https://ko.wikipedia.org/wiki/아이기스", "https://namu.wiki/w/아이기스"],
  },
  trident: {
    lore: "키클롭스가 만들었다는 세 갈래 창. 아크로폴리스의 바위를 내리쳐 샘을 솟게 했고, 땅과 바다를 뒤흔듭니다.",
    look: "세 갈래로 갈라진 긴 창",
    sources: ["https://en.wikipedia.org/wiki/Trident_of_Poseidon"],
  },
  kerykeion: {
    lore: "뱀 두 마리가 감기고 날개가 달린 전령의 지팡이. 사람을 잠재우는 힘도 있습니다. 뱀 한 마리가 감긴 아스클레피오스의 지팡이와는 다릅니다.",
    look: "뱀 두 마리와 날개가 달린 지팡이",
    sources: ["https://ko.wikipedia.org/wiki/케뤼케이온", "https://namu.wiki/w/카두케우스"],
  },
  sudarshana: {
    lore: "비슈누가 오른쪽 뒷손에 드는 불꽃 원반. 날아가 적을 베고 돌아옵니다. 「마하바라타」에서 크리슈나가 이것으로 시슈팔라를 벱니다.",
    look: "테두리에 불꽃이 솟는 원반",
    sources: ["https://ko.wikipedia.org/wiki/수다르샤나차크라"],
  },
  trishula: {
    lore: "시바의 세 갈래 창. 두르가도 이 창을 들고 악을 물리칩니다. 다마루 북을 매단 모습으로 자주 그려집니다.",
    look: "작은 북을 매단 세 갈래 창",
    sources: ["https://ko.wikipedia.org/wiki/트리슐라"],
  },
  kusanagi: {
    lore: "스사노오가 머리 여덟 달린 뱀 야마타노오로치를 쓰러뜨리고 그 꼬리에서 꺼낸 검. 일본 삼종신기의 하나입니다.",
    look: "곧은 양날 검",
    sources: ["https://ko.wikipedia.org/wiki/쿠사나기의_검"],
  },
  was: {
    lore: "위에는 세트 동물의 머리, 아래는 두 갈래로 갈라진 긴 지팡이. 신과 파라오가 쥐는 권력과 지배, 혼돈을 다스림의 상징입니다.",
    look: "동물 머리 장식과 갈라진 끝의 지팡이",
    sources: ["https://en.wikipedia.org/wiki/Was-sceptre"],
  },
  wedjat: {
    lore: "세트와 싸우다 다친 호루스의 왼눈. 토트가 되살렸다고 하여 치유와 온전함의 부적이 되었습니다. 쓰면 약화·취약·침식도 씻어 냅니다.",
    look: "매의 눈 모양 부적",
    sources: ["https://ko.wikipedia.org/wiki/호루스의_눈", "https://namu.wiki/w/호루스"],
  },
  cheonbuin: {
    lore: "환인이 환웅에게 내린 세 가지 신물. 「삼국유사」는 무엇이었는지 적지 않았고, 검·방울·거울로 보는 것은 하나의 설입니다.",
    look: "세 가지 신물 (검·방울·거울이라는 설)",
    sources: ["https://ko.wikipedia.org/wiki/천부인", "https://namu.wiki/w/천부인"],
  },
  gaebolg: {
    lore: "스카하크에게 받은, 바다괴물의 뼈로 만든 창. 몸에 박히면 안에서 미늘이 퍼져 뽑을 수 없다고 합니다.",
    look: "가지처럼 미늘이 돋은 창끝",
    sources: ["https://ko.wikipedia.org/wiki/게_볼그", "https://namu.wiki/w/게 볼그"],
  },
  xiuhcoatl: {
    lore: "불의 뱀. 우이칠로포치틀리는 태어나자마자 이것으로 누이 코욜샤우키를 찌르고 별의 무리 센손 위츠나우아를 물리쳤습니다.",
    look: "주둥이가 젖혀지고 몸에 마디가 있는 불뱀",
    sources: ["https://en.wikipedia.org/wiki/Xiuhcoatl"],
  },
  excalibur: {
    lore: "호수의 여인이 아서에게 준 검. 멀린은 칼집이 검보다 귀하다고 했고, 칼집을 지닌 자는 피를 흘리지 않았다고 합니다. 아서가 쓰러지자 베디비어가 호수에 돌려주었습니다.",
    look: "빛을 머금은 곧은 양날 검",
    sources: ["https://ko.wikipedia.org/wiki/엑스칼리버"],
  },
  galatine: {
    lore: "가웨인의 검. 이름은 중세 후기의 아서왕 이야기에 나옵니다.",
    look: "태양빛을 받아 빛나는 검",
    sources: ["https://ko.wikipedia.org/wiki/갈라틴"],
  },
  arondight: {
    lore: "호수의 여인이 랜슬롯에게 주었다는, 이가 빠지지 않는 검. 이 이름은 14세기 「햄턴의 베비스」에서 처음 나오는 후대의 이름입니다.",
    look: "이가 빠지지 않는 기사의 검",
    sources: ["https://ko.wikipedia.org/wiki/아론다이트"],
  },
  gram: {
    lore: "오딘이 나무에 꽂은 검을 시그문드가 뽑았고, 부러진 조각을 레긴이 다시 벼렸습니다. 시구르드가 모루를 쪼개 보인 뒤 용 파프니르를 베었습니다. (볼숭 사가, 에다)",
    look: "모루까지 쪼갠 날카로운 검",
    sources: ["https://ko.wikipedia.org/wiki/그람_(신화)"],
  },
  balmung: {
    lore: "「니벨룽겐의 노래」에서 지크프리트가 니벨룽족에게서 얻은 검.",
    look: "니벨룽의 보물과 함께 얻은 검",
    sources: ["https://ko.wikipedia.org/wiki/그람_(신화)"],
  },
  durandal: {
    lore: "롤랑의 검. 죽음을 앞둔 롤랑이 적의 손에 넘기지 않으려 바위에 내리쳤으나 부러지지 않았습니다.",
    look: "바위에 내리쳐도 부러지지 않는 검",
    sources: ["https://ko.wikipedia.org/wiki/뒤랑달"],
  },
  joyeuse: {
    lore: "샤를마뉴의 검. 손잡이에 롱기누스의 창끝이 들었다는 이야기는 19세기 편찬서에 실린 후대 전승입니다.",
    look: "하루에 서른 번 빛깔이 바뀐다는 황제의 검",
    sources: ["https://ko.wikipedia.org/wiki/주와이외즈"],
  },
  gandiva: {
    lore: "칸다바 숲을 태우려던 아그니가 아르주나에게 준 활. 화살이 마르지 않는 화살통 둘과 함께였고, 전쟁이 끝난 뒤 돌려주었습니다. (마하바라타)",
    look: "화살이 마르지 않는 하늘의 활",
    sources: ["https://ko.wikipedia.org/wiki/간디바"],
  },
  "vasavi-shakti": {
    lore: "인드라가 카르나의 갑옷과 귀걸이를 받고 준 창. 단 한 번만 쓸 수 있어 전투마다 한 번만 휘두릅니다. (마하바라타)",
    look: "한 번만 던질 수 있는 신의 창",
    sources: ["https://ko.wikipedia.org/wiki/바사비_샤크티"],
  },
  vajra: {
    lore: "트바슈트리가 인드라를 위해 만든 벼락. 인드라는 이것으로 물을 가둔 뱀 브리트라를 쳤습니다. (리그베다)",
    look: "양 끝이 갈라진 금빛 벼락",
    sources: ["https://ko.wikipedia.org/wiki/바즈라"],
  },
  brahmastra: {
    lore: "브라흐마가 만든 천상의 무기. 「라마야나」에서 라마가 라바나를 쓰러뜨릴 때 썼습니다.",
    look: "불덩이와 굉음을 일으키는 화살",
    sources: ["https://ko.wikipedia.org/wiki/브라흐마스트라"],
  },
  "gae-dearg": {
    lore: "디어무드의 붉은 창. 그 창에 입은 상처는 낫지 않는다고 전합니다. 무기의 능력은 후대의 다시 쓴 이야기에 기대는 부분이 있습니다.",
    look: "붉은 자루의 마창",
    sources: ["https://ko.wikipedia.org/wiki/디어르머드_우어_디브너"],
  },
  fragarach: {
    lore: "'대답하는 자'라는 뜻의 검. 목에 대면 거짓을 말할 수 없고 어떤 갑옷도 꿰뚫었다는 능력은 중세 원전보다 후대에 전하는 이야기입니다.",
    look: "바람을 부르는 바다 신의 검",
    sources: ["https://ko.wikipedia.org/wiki/프라가라흐"],
  },
  caladbolg: {
    lore: "휘두르면 무지개 같은 호를 그렸다는 퍼거스의 검. 「쿨리의 소 습격」에서 언덕 셋의 꼭대기를 베어 냈습니다.",
    look: "무지개처럼 휘는 양날 검",
    sources: ["https://ko.wikipedia.org/wiki/칼라드볼그"],
  },
  "arash-arrow": {
    lore: "국경을 정하려고 아라시가 온 힘을 다해 쏜 화살. 화살은 해 질 녘까지 날아갔고 아라시는 숨을 거두었기에 전투마다 한 번만 쏩니다.",
    look: "목숨을 담은 단 한 발의 화살",
    sources: ["https://ko.wikipedia.org/wiki/아라쉬_(페르시아_신화)"],
  },
  harpe: {
    lore: "헤르메스가 페르세우스에게 빌려준 낫 모양의 칼. 이것으로 메두사의 목을 베었습니다.",
    look: "갈고리처럼 휜 낫칼",
    sources: ["https://en.wikipedia.org/wiki/Harpe"],
  },
  "ruyi-jingu-bang": {
    lore: "동해 용궁의 바다를 다지던 쇠기둥. 손오공이 뜻대로 늘였다 줄였다 하며 귀에 넣어 다녔습니다. (서유기)",
    look: "양 끝에 금테를 두른 쇠막대",
    sources: ["https://ko.wikipedia.org/wiki/여의봉"],
  },
  "qiankun-quan": {
    lore: "나타가 몸에 두른 금 고리. 동해 용궁의 야차를 이것으로 쓰러뜨렸습니다. (봉신연의)",
    look: "던지면 돌아오는 금 고리",
    sources: ["https://en.wikipedia.org/wiki/Nezha"],
  },
  "yi-bow": {
    lore: "하늘에 뜬 열 개의 해 가운데 아홉을 쏘아 떨어뜨린 활.",
    look: "해를 떨어뜨린 붉은 활",
    sources: ["https://ko.wikipedia.org/wiki/후예"],
  },
  "achilles-shield": {
    lore: "테티스의 부탁으로 헤파이스토스가 만든 방패. 땅과 하늘과 바다, 두 도시, 밭과 포도밭이 동심원으로 새겨져 있습니다. (일리아스 18권)",
    look: "세상을 새긴 둥근 방패",
    sources: ["https://en.wikipedia.org/wiki/Shield_of_Achilles"],
  },
  tarnkappe: {
    lore: "「니벨룽겐의 노래」에서 지크프리트가 난쟁이 알베리히에게서 빼앗은 모습을 감추는 망토.",
    look: "입으면 보이지 않게 되는 망토",
    sources: ["https://en.wikipedia.org/wiki/Tarnhelm"],
  },
  megingjord: {
    lore: "차면 토르의 힘이 두 배가 된다는 힘의 허리띠. (신 에다)",
    look: "힘이 두 배가 되는 허리띠",
    sources: ["https://ko.wikipedia.org/wiki/메깅요르드"],
  },
  "kinto-un": {
    lore: "한 번에 십만 팔천 리를 난다는 손오공의 구름. (서유기)",
    look: "한 번에 십만 팔천 리를 나는 구름",
    sources: ["https://ko.wikipedia.org/wiki/손오공"],
  },
  manpasikjeok: {
    lore: "불면 적병이 물러가고 병이 낫고 파도가 잔잔해졌다는 신라의 피리. 문무왕과 김유신이 내린 대나무로 만들었다고 「삼국유사」가 전합니다.",
    look: "대나무로 만든 피리",
    sources: ["https://ko.wikipedia.org/wiki/만파식적"],
  },
  "magic-lamp": {
    lore: "문지르면 정령이 나와 소원을 들어준다는 알라딘의 램프.",
    look: "문지르면 정령이 나오는 낡은 램프",
    sources: ["https://ko.wikipedia.org/wiki/알라딘"],
  },
};
