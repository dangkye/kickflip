// ===== 맵 데이터 =====
// 각 맵은 가로로 긴 월드 좌표를 가진다. (논리 화면 960x540)
// image 경로가 null이면 임시 도형으로 그려진다. 실제 이미지가 생기면 경로만 넣으면 된다.
//
// palettes: 맵 색상 모음. defaultPalette가 처음 적용되고, triggers로 바뀔 수 있다.
// lighting: 메인 골목처럼 위치에 따라 밝기가 변하는 맵용 (x 지점과 어두운 정도 v: 0=밝음, 1=매우 어두움)
// layers: 뒤/중간/앞 배경 층. speed가 작을수록 천천히 움직여 입체감을 준다.
//
// 장면 분리: 2집(교실, 체육관)과 3집(양호실, 계단, 야외)은 장면마다 별도의 맵이다.
// 장면 안에 있는 문(objects.js의 type: "door")을 클릭하면 로딩 화면을 거쳐 다음 장면으로 이동한다.
// 같은 앨범의 장면들은 album 값이 같고, 앨범의 마지막 장면(finalScene)의 끝에 닿으면
// "메인 골목으로 돌아갈까요?" 팝업이 열린다.

function makeLayers() {
  return [
    { id: "far", speed: 0.3, image: null },
    { id: "mid", speed: 0.6, image: null }
  ];
}

// 팔레트가 하나뿐인 맵을 간단히 만드는 도우미
function makeMap(id, name, width, pal) {
  return {
    id: id,
    name: name,
    width: width,
    groundY: 440,
    spawnX: 140,
    defaultPalette: "base",
    palettes: { base: pal },
    layers: makeLayers()
  };
}

const PAL_ALBUM1 = { sky: "#d9dfe3", far: "#aab4ba", mid: "#8b9399", ground: "#c9c9c9", line: "#a8a8a8", dark: 0 };
const PAL_ALBUM2 = { sky: "#c4f0e5", far: "#8fd6c6", mid: "#5bbcb0", ground: "#d8c9a6", line: "#bfae88", dark: 0 };
const PAL_ALBUM3 = { sky: "#f7f0e1", far: "#eadcc6", mid: "#e8a08f", ground: "#e2d3b5", line: "#cbb994", dark: 0 };
const PAL_FANCON = { sky: "#bfe3fa", far: "#e8f3fb", mid: "#8cc9ee", ground: "#e6dcc3", line: "#cfc3a3", dark: 0 };
const PAL_ALBUM4 = { sky: "#cfe3d4", far: "#a3c4ab", mid: "#8a6a49", ground: "#bfae88", line: "#a4936d", dark: 0 };

const MAPS = {
  main: {
    id: "main",
    name: "메인 골목",
    width: 7000,
    groundY: 440,
    spawnX: 140,
    defaultPalette: "base",
    palettes: {
      base: { sky: "#9ad4ee", far: "#b9d6e0", mid: "#e6d3b0", ground: "#d9c7a1", line: "#c4af85", dark: 0 }
    },
    // 데뷔 전 일기 구간은 어둡고, 첫 인스타그램 지점부터 밝아진다.
    lighting: [
      { x: 0, v: 0.55 }, { x: 1900, v: 0.55 }, { x: 2300, v: 0 }, { x: 7000, v: 0 }
    ],
    layers: makeLayers()
  },

  album1:  makeMap("album1",  "미니 1집  Flip it, Kick it!", 3600, PAL_ALBUM1),

  // 미니 2집: 교실 -> (문) -> 체육관
  album2:  makeMap("album2",  "미니 2집  교실",   2200, PAL_ALBUM2),
  album2b: makeMap("album2b", "미니 2집  체육관", 1800, PAL_ALBUM2),

  // 미니 3집: 양호실 -> (문) -> 계단 -> (문) -> 야외
  album3:  makeMap("album3",  "미니 3집  양호실", 2000, PAL_ALBUM3),
  album3b: makeMap("album3b", "미니 3집  계단",   2200, PAL_ALBUM3),
  album3c: makeMap("album3c", "미니 3집  야외",   2200, PAL_ALBUM3),

  fancon:  makeMap("fancon",  "팬콘  From KickFlip, To WeFlip", 3600, PAL_FANCON),
  album4:  makeMap("album4",  "미니 4집  My First Kick", 5400, PAL_ALBUM4),

  // 미니 5집: 큰 두 구간 (미완성 -> 킥옾더월). 구간 경계의 하늘 퍼즐에 다가가면 팔레트가 전환된다.
  album5: {
    id: "album5",
    name: "미니 5집  KICK OFF THE WALL Pt.1",
    width: 4800,
    groundY: 440,
    spawnX: 140,
    defaultPalette: "incomplete",
    palettes: {
      incomplete: { sky: "#1c2442", far: "#2c3659", mid: "#3d4a74", ground: "#1e2339", line: "#2d3453", dark: 0.15 },
      kickoff:    { sky: "#0e1a12", far: "#1e3d24", mid: "#1f7a2c", ground: "#0c2b13", line: "#39ff14", dark: 0 }
    },
    sections: [
      { from: 0,    to: 2400, name: "미완성" },
      { from: 2400, to: 4800, name: "킥옾더월" }
    ],
    // 플레이어가 x 지점을 지나면 팔레트를 바꾼다 (맵 안에서 한 번만 실행되고 새로 입장하면 초기화)
    triggers: [
      { id: "to-kickoff", x: 2300, setPalette: "kickoff" }
    ],
    layers: makeLayers()
  }
};

// 맵 순서 (개발용 선택 메뉴와 추후 도감 정렬에 사용)
const MAP_ORDER = ["main", "album1", "album2", "album2b", "album3", "album3b", "album3c", "fancon", "album4", "album5"];

// 어느 앨범에 속한 맵인지 (메인 골목의 스케이트보드, 음악, 돌아가기 위치를 찾는 데 사용)
// 메인 골목 보드의 목적지는 각 앨범의 첫 장면이고, 첫 장면의 id가 곧 앨범 id다.
const ALBUM_OF_MAP = {
  main: "main",
  album1: "album1",
  album2: "album2", album2b: "album2",
  album3: "album3", album3b: "album3", album3c: "album3",
  fancon: "fancon",
  album4: "album4",
  album5: "album5"
};

// 다음 장면이 있는 맵 (문으로 이어짐). 여기에 없는 앨범 맵이 그 앨범의 마지막 장면이다.
const NEXT_SCENE = { album2: "album2b", album3: "album3b", album3b: "album3c" };

MAP_ORDER.forEach(function (id) {
  MAPS[id].album = ALBUM_OF_MAP[id];
  // 마지막 장면의 끝에 닿으면 "메인으로 돌아가기" 팝업이 열린다
  MAPS[id].finalScene = (id !== "main") && !NEXT_SCENE[id];
});

// 메인 골목의 앨범 스케이트보드 색상 (자료의 색상 기준)
const ALBUM_BOARD_COLORS = {
  album1: ["#111111", "#ffffff"],
  album2: ["#7fe3c9", "#12908f"],
  album3: ["#f4ecd6", "#e0452b"],
  fancon: ["#6ec1ee", "#ffffff"],
  album4: ["#a9c9b0", "#6b4a2e"],
  album5: ["#0f5a2a", "#39ff14"]
};
