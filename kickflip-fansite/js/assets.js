// ===== 에셋 관리 =====
// 이미지 경로는 이 파일과 데이터 파일(maps.js, objects.js)에서만 관리한다.
// 경로가 null이거나 파일이 없으면 임시 도형으로 대체 표시되므로, 이미지 없이도 사이트가 정상 작동한다.

const CONFIG = {
  debug: true,          // true면 화면에 개발용 맵 선택 메뉴가 보인다. 배포 전에 false로 바꾼다.
  logicalWidth: 960,    // 논리 해상도 (16:9)
  logicalHeight: 540
};

// 멤버 정보 (임시 스케이트보드 색상, 나중에 skateboardImage 경로에 실제 이미지를 넣으면 교체됨)
const MEMBERS = [
  { id: "계훈",   color: "#ff1493", skateboardImage: null },
  { id: "아마루", color: "#9b7ede", skateboardImage: null }, // 아마루 색상은 아직 미지정 -> 임시 보라
  { id: "주왕",   color: "#ff8c1a", skateboardImage: null },
  { id: "동화",   color: "#2fb344", skateboardImage: null },
  { id: "민제",   color: "#5bc0eb", skateboardImage: null },
  { id: "케이주", color: "#ffb6d5", skateboardImage: null },
  { id: "동현",   color: "#1e4fd8", skateboardImage: null }
];

// 플레이어 아바타 설정 (현재는 단색 사람 모양)
// 나중에 이미지 경로를 넣으면 교체된다. walk는 프레임 배열.
const AVATAR = {
  color: "#e8604c",
  width: 28,
  height: 52,
  idle: null,          // 예: "assets/characters/player_idle.png"
  walk: []             // 예: ["assets/characters/walk1.png", ...]
};

const Assets = (() => {
  const cache = {};

  // 이미지를 불러온다. 아직 로딩 중이거나 실패하면 null을 반환 -> 호출한 쪽이 임시 도형을 그린다.
  function get(path) {
    if (!path) return null;
    let entry = cache[path];
    if (!entry) {
      entry = cache[path] = { img: new Image(), ok: false };
      entry.img.onload = () => { entry.ok = true; };
      entry.img.onerror = () => { entry.ok = false; };
      entry.img.src = path;
    }
    return entry.ok ? entry.img : null;
  }

  // 원본 비율을 유지하면서 박스 안에 맞춰 그린다 (늘이거나 찌그러뜨리지 않음)
  function drawFit(ctx, img, x, y, w, h) {
    const scale = Math.min(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh), dw, dh);
  }

  return { get, drawFit };
})();
