// ===== 착장(아바타) 데이터 =====
// 한 세트의 착장을 입은 아바타 = 착장 1개. 멤버를 고르면 그 멤버의 착장만 선택 화면에 나열된다.
//
// 착장 항목 필드
//   id      : 저장용 고유 id (영문/숫자, 바꾸면 이전에 저장된 선택이 풀린다)
//   member  : 멤버 이름 (MEMBERS의 id와 같아야 함)
//   name    : 선택 화면에 보일 착장 이름
//   preview : 선택 화면에 보일 이미지 경로 (없으면 idle, 그것도 없으면 임시 도형)
//   idle    : 게임 속 대기 이미지 (투명 PNG)
//   walk    : 게임 속 걷기 이미지 배열 (프레임 순서대로). 비어 있으면 idle을 그대로 사용
//   width / height : 게임 속 크기 (생략하면 assets.js의 AVATAR 기본값)
//   color / pants / accent : 임시 도형일 때의 상의 / 하의 / 머리 색 (이미지를 넣으면 쓰이지 않음)
//
// 실제 착장 이미지를 추가하는 방법: 아래 "실제 착장" 칸에 addOutfit(...)을 한 줄씩 추가한다.
// 멤버마다 착장이 7개 정도이고 착장 이름은 멤버마다 다르다. (예: "응그래 착장", "처음 불러보는 노래 착장")
// 실제 착장을 추가한 만큼 임시 착장이 남지 않게 하려면 PLACEHOLDER_OUTFITS_PER_MEMBER를 0으로 바꾼다.

const OUTFITS = [];

function addOutfit(member, id, name, extra) {
  let color = "#999999";
  for (let i = 0; i < MEMBERS.length; i++) {
    if (MEMBERS[i].id === member) color = MEMBERS[i].color;
  }
  OUTFITS.push(Object.assign({
    id: id,
    member: member,
    name: name,
    color: color,
    pants: "#3b3b4f",
    accent: "#2b2b2b",
    preview: null,
    idle: null,
    walk: []
  }, extra || {}));
}

// ----- 실제 착장 (이미지가 준비되면 여기에 추가) -----
// 예)
// addOutfit("계훈", "kyehoon-casual", "캐주얼", {
//   preview: "assets/characters/kyehoon/casual_preview.png",
//   idle: "assets/characters/kyehoon/casual_idle.png",
//   walk: ["assets/characters/kyehoon/casual_walk1.png", "assets/characters/kyehoon/casual_walk2.png"],
//   width: 60, height: 110
// });

// ----- 임시 착장 (단색 사람 모양, 기능 확인용) -----
const PLACEHOLDER_OUTFITS_PER_MEMBER = 7;
const PLACEHOLDER_STYLES = [
  { pants: "#3b3b4f", accent: "#2b2b2b" },
  { pants: "#8a6a49", accent: "#c9a050" },
  { pants: "#2f5d8a", accent: "#7a4a2a" },
  { pants: "#555555", accent: "#e8e8e8" },
  { pants: "#2f6b45", accent: "#d9435c" },
  { pants: "#6b3a5a", accent: "#4a7fb0" },
  { pants: "#a83a3a", accent: "#8a8a8a" }
];
const MEMBER_KEYS = {
  "계훈": "kyehoon", "아마루": "amaru", "주왕": "juwang", "동화": "donghwa",
  "민제": "minje", "케이주": "kyeju", "동현": "donghyeon"
};

MEMBERS.forEach(function (m) {
  for (let i = 0; i < PLACEHOLDER_OUTFITS_PER_MEMBER; i++) {
    const style = PLACEHOLDER_STYLES[i % PLACEHOLDER_STYLES.length];
    addOutfit(m.id, (MEMBER_KEYS[m.id] || m.id) + "-temp" + (i + 1), "착장 " + (i + 1), {
      pants: style.pants,
      accent: style.accent
    });
  }
});
