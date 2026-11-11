// ===== 오브제 배치 데이터 =====
// 위치와 크기를 확인하기 위한 임시 형태다. 실제 이미지가 생기면 image 경로만 채우면 된다.
//
// 필드 설명
//   type   : "event"(클릭하면 사건 기록 열림) / "deco"(배경 장식, 클릭 불가) / "board"(앨범 맵으로 이동)
//   x      : 오브제 왼쪽 끝의 월드 좌표
//   elev   : 땅에서 위로 띄운 높이 (벽에 걸린 물건 등)
//   w, h   : 크기
//   image  : 이미지 경로 (null이면 색 블록 + 이름표)
//   anim   : 움직이는 오브제의 동작 이름 (10단계에서 interactions.js로 구현, 지금은 표시만)
//   pending: true면 자료가 아직 없어 위치만 잡아 둔 칸

function ev(id, eventId, label, x, w, h, elev, color, anim) {
  return { id: id, type: "event", eventId: eventId, label: label, x: x, w: w, h: h,
           elev: elev || 0, color: color || "#e8604c", image: null, anim: anim || null };
}
function deco(id, label, x, w, h, elev, color, extra) {
  return Object.assign({ id: id, type: "deco", label: label, x: x, w: w, h: h,
           elev: elev || 0, color: color || "#b8a98a", image: null }, extra || {});
}
function board(id, target, label, x) {
  return { id: id, type: "board", target: target, label: label, x: x, w: 96, h: 26,
           elev: 0, image: null };
}

const OBJECTS_BY_MAP = {

  // ----- 메인 골목: 자료에 적힌 시간순으로 일정 간격 배치 -----
  main: [
    // 1. 택배상자 안 일기장 (데뷔 전 어두운 구간)
    deco("box-1", "택배상자", 480, 90, 64, 0, "#a9825a"),
    ev("obj-diary", "diary", "일기장", 505, 40, 30, 64, "#5b4636"),
    // 2. 택배상자 위 카세트테이프
    deco("box-2", "택배상자", 820, 90, 64, 0, "#a9825a"),
    ev("obj-team-name", "team-name-first", "카세트", 845, 44, 26, 64, "#555555"),
    // 3. 벽의 킥플립 로고
    ev("obj-logo", "logo-reveal", "킥플립 로고", 1120, 120, 54, 130, "#222222"),
    // 4. READY TO KICKFLIP 포스터 (빨간 압정)
    ev("obj-debut-confirmed", "debut-confirmed", "READY TO KICKFLIP", 1470, 74, 104, 110, "#f3efe6"),
    // 5. 낮은 담장 위 하트 우편함
    deco("low-wall", "낮은 담장", 1780, 150, 44, 0, "#cdb98f"),
    ev("obj-first-fanz", "first-fanz", "하트 우편함", 1830, 46, 52, 44, "#d9435c"),
    // 6. 열린 창문 (햇빛이 들어오기 시작하는 지점)
    ev("obj-first-insta", "first-insta", "열린 창문", 2170, 86, 86, 130, "#ffe9a8"),
    // 7. 캐리어와 방송용 카메라
    ev("obj-first-content", "first-content", "캐리어·카메라", 2510, 96, 62, 0, "#3d6f9a"),
    // 8. 벽의 위플립 로고
    ev("obj-fandom", "fandom-name", "위플립 로고", 2850, 120, 54, 130, "#e8604c"),
    // 9. 야구 글러브와 공
    ev("obj-first-pitch", "first-pitch", "글러브·공", 3200, 58, 36, 0, "#8a5a2b"),
    // 10. 거대한 페스티벌 깃발
    ev("obj-lollapalooza", "lollapalooza", "페스티벌 깃발", 3530, 110, 130, 150, "#d94f8c"),
    // 11. 굿즈 가게 쇼윈도의 응원봉
    deco("goods-shop", "굿즈 가게", 3820, 330, 200, 0, "#d9c39a"),
    ev("obj-lightstick", "lightstick", "응원봉 쇼윈도", 3870, 110, 90, 40, "#7ec3ee"),
    // 13. 같은 쇼윈도의 OST CD 케이스 (자료의 시간순 번호는 13번)
    ev("obj-first-ost", "first-ost", "OST CD", 4030, 90, 70, 40, "#c9a9e0"),
    // 12. 졸업모와 꽃다발, 현수막 (자료에 적힌 번호 순서를 따라 배치)
    ev("obj-graduation", "donghyeon-graduation", "졸업모·꽃다발·현수막", 4320, 130, 80, 0, "#2c2c54"),
    // 14. KEEP GOING 깃발
    ev("obj-anniversary", "debut-anniversary", "KEEP GOING 깃발", 4660, 100, 120, 150, "#f4b400"),
    // 15. 벤치의 곰인형과 편지
    deco("bench", "벤치", 4980, 150, 34, 0, "#8b6b45"),
    ev("obj-amaru-letter", "amaru-letter", "곰인형·편지", 5020, 62, 56, 34, "#c98f6b"),
    // 16. 마이크, 큐카드, 엠카 로고 포스터
    ev("obj-kyehoon-mc", "kyehoon-mc", "마이크·큐카드·엠카 포스터", 5340, 120, 96, 0, "#5a3d8a"),
    // 17. 유리 정원과 어쿠스틱 기타
    ev("obj-breathe", "donghyeon-breathe", "유리 정원·기타", 5680, 140, 110, 0, "#8fd19e"),
    // 18. 공식 캐릭터 공개 포스터
    ev("obj-kikdungsseu", "kikdungsseu", "킥둥쓰 포스터", 6020, 84, 112, 110, "#f6c85f"),

    // 앨범 맵으로 이동하는 스케이트보드 (모든 보드는 같은 형태, 색만 다름)
    board("board-album1", "album1", "미니 1집", 2370),
    board("board-album2", "album2", "미니 2집", 3050),
    board("board-album3", "album3", "미니 3집", 3730),
    board("board-fancon", "fancon", "팬콘", 4800),
    board("board-album4", "album4", "미니 4집", 5800),
    board("board-album5", "album5", "미니 5집", 6620)
  ],

  // ----- 미니 1집 -----
  album1: [
    ev("obj-umm-great", "umm-great-release", "응그래 낙서", 420, 150, 80, 150, "#f2f2f2"),
    ev("obj-showcase", "debut-showcase", "쇼케이스 입간판·티켓", 880, 70, 100, 0, "#d9435c"),
    deco("construction", "공사 구역", 1260, 440, 22, 0, "#e0a030"),
    ev("obj-mama-said", "mama-said-release", "라바콘", 1420, 38, 62, 0, "#f06a1a"),
    deco("house", "집", 2000, 360, 230, 0, "#d8c7a2"),
    ev("obj-radio", "first-broadcast-1", "라디오", 1860, 56, 40, 0, "#444444"),
    ev("obj-cake", "debut-lecture", "케이크", 2460, 60, 56, 36, "#f4c2d0"),
    deco("garden-table", "정원 테이블", 2430, 120, 36, 0, "#9a7a52"),
    deco("skate-park", "스케이트보드 파크", 2860, 700, 26, 0, "#9aa3a8"),
    ev("obj-practice-bag", "see-you-tomorrow", "연습실 가방·운동화·공책", 3060, 100, 70, 0, "#4a4a4a"),
    deco("skateboard-fun", "스케이트보드", 3300, 90, 22, 0, "#111111", { anim: "roll" })
  ],

  // ----- 미니 2집 (교실 -> 체육관) -----
  album2: [
    deco("tv-ceiling", "TV (왼쪽 천장)", 140, 110, 70, 330, "#2f2f2f"),
    ev("obj-trailer", "trailer-2", "게시판 찌라시", 430, 130, 100, 150, "#e9d9a6"),
    deco("punish-kyehoon", "계훈 (벌)", 640, 36, 70, 0, "#ff1493"),
    deco("punish-donghwa", "동화 (벌)", 700, 36, 70, 0, "#2fb344"),
    ev("obj-freeze", "freeze-release", "교탁·CD 플레이어", 1050, 120, 90, 0, "#8a6a49"),
    ev("obj-first-broadcast-2", "first-broadcast-2", "요요", 1420, 34, 90, 130, "#ff5e5e", "yoyo"),
    deco("front-door", "앞문", 1800, 90, 170, 0, "#6b4a2e"),
    ev("obj-complicated", "complicated", "전설의 악기들", 2350, 160, 100, 0, "#d4a017")
  ],

  // ----- 미니 3집 (양호실 -> 계단 -> 야외) -----
  album3: [
    deco("infirmary-people", "민제·케이주 연출", 380, 120, 80, 0, "#5bc0eb"),
    ev("obj-band-aid", "band-aid-release", "벽장·구급상자", 860, 90, 110, 70, "#e8e8e8"),
    ev("obj-simulation", "simulation-promo", "시뮬레이션 포스터", 1450, 80, 110, 130, "#f2a65a"),
    ev("obj-cheobulno", "cheobulno-release", "A4 용지", 1760, 70, 96, 130, "#ffffff"),
    ev("obj-first-broadcast-3", "first-broadcast-3", "종이비행기", 2400, 70, 36, 60, "#f2f2f2", "flyAcross"),
    ev("obj-first-win-3", "first-win-3", "트로피", 3050, 64, 90, 0, "#f4c542")
  ],

  // ----- 팬콘 (킥플립 집 / 우체국 / 위플립 집) -----
  fancon: [
    deco("house-kickflip", "킥플립 집", 380, 420, 250, 0, "#cfe6f5"),
    deco("post-office", "우체국", 1350, 480, 250, 0, "#e9d9a6"),
    // 우표 5개: 전국 5개 지역 공연 기록과 연결될 자리 (지역 자료 전달 전까지는 위치만)
    deco("stamp-1", "우표 1", 1420, 50, 60, 100, "#e8604c", { pending: true }),
    deco("stamp-2", "우표 2", 1500, 50, 60, 100, "#e8604c", { pending: true }),
    deco("stamp-3", "우표 3", 1580, 50, 60, 100, "#e8604c", { pending: true }),
    deco("stamp-4", "우표 4", 1660, 50, 60, 100, "#e8604c", { pending: true }),
    deco("stamp-5", "우표 5", 1740, 50, 60, 100, "#e8604c", { pending: true }),
    // 위플립 집은 외관만 (진입 불가)
    deco("house-weflip", "위플립 집 (외관)", 2500, 420, 250, 0, "#f6f1e4"),
    deco("bouquet", "꽃다발", 2440, 50, 56, 0, "#ff8fb1"),
    ev("obj-weflip-mailbox", "fancon-end", "우편함 (종료 소감)", 2380, 44, 56, 30, "#d9435c")
  ],

  // ----- 미니 4집 (숲 -> 캠핑장 -> LA 거리) -----
  album4: [
    deco("van", "밴", 380, 190, 100, 0, "#e9e2cf"),
    deco("tent", "텐트", 1350, 160, 100, 0, "#c47a3a"),
    deco("sleeping-bag", "침낭", 1560, 110, 30, 0, "#3b6ea8"),
    ev("obj-twenty-release", "twenty-release", "편지지", 1850, 60, 70, 0, "#fff6d6"),
    ev("obj-twenty-broadcast", "twenty-broadcast", "캠프파이어", 2300, 80, 70, 0, "#f06a1a", "campfire"),
    deco("sea-view", "바다 전망", 2600, 360, 120, 90, "#7ec3ee"),
    deco("whale", "고래", 2780, 120, 56, 90, "#4a7fb0", { anim: "whale" }),
    deco("fireworks", "불꽃놀이", 3100, 160, 160, 200, "#f6c85f"),
    ev("obj-eyepoppin-release", "eyepoppin-release", "쇼윈도 TV", 3560, 120, 90, 60, "#2f2f2f"),
    ev("obj-eyepoppin-broadcast", "eyepoppin-broadcast", "횡단보도", 4100, 200, 14, 0, "#f2f2f2"),
    deco("basketball-court", "농구코트", 4500, 240, 24, 0, "#d9833f"),
    deco("fast-food", "패스트푸드점", 4900, 300, 200, 0, "#e8604c")
  ],

  // ----- 미니 5집 (미완성 0~2400 / 킥옾더월 2400~4800) -----
  album5: [
    // 미완성 구간
    // 퍼즐판에 미완성 공개를 연결한 것은 임시 가정이다. 자료에 지정된 오브제가 없어 확인 필요.
    ev("obj-incomplete-release", "incomplete-release", "한 조각이 빈 퍼즐판", 380, 200, 150, 60, "#7a86b8"),
    ev("obj-incomplete-broadcast", "incomplete-broadcast", "버스 ('This is us, this is me 완성')", 900, 300, 120, 0, "#3a3f58"),
    deco("glass-wall", "유리벽 (옆면)", 1450, 24, 150, 0, "#9fd3e8"),
    deco("rooftop-hockey", "옥상 간판", 1750, 140, 60, 280, "#cfd8dc"),
    deco("sky-puzzle", "하늘 퍼즐 (다가가면 전환)", 2160, 150, 120, 200, "#aab6e8"),
    // 킥옾더월 구간
    deco("ferris-wheel", "대관람차", 3250, 400, 400, 0, "#39ff14", { anim: "ferris" }),
    ev("obj-kickoff-release", "kickoff-release", "탑승 칸 (가장 아래)", 3400, 60, 50, 0, "#ffffff"),
    ev("obj-kickoff-broadcast", "kickoff-broadcast", "네온 전광판", 2750, 160, 90, 120, "#39ff14", "neonBlink"),
    ev("obj-hate-blueberry", "hate-blueberry", "캠코더", 3900, 60, 44, 0, "#555555"),
    ev("obj-mcountdown-win", "mcountdown-first-win", "트로피·리본", 4350, 70, 90, 0, "#f4c542")
  ]
};
