// ===== 메인: 게임 루프, 카메라, 그리기, 입력, 맵 이동 =====
// 1~3단계 범위: 횡스크롤 맵 + 플레이어 이동.
// 확인용으로 앨범 스케이트보드 클릭 이동과 임시 사건 팝업만 간단히 넣어 두었다.
// (정식 팝업은 7단계, 도감/수집 저장은 9단계, 음악은 별도 단계에서 구현)

(function () {
  const W = CONFIG.logicalWidth;
  const H = CONFIG.logicalHeight;

  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const els = {
    mapName: document.getElementById("hud-map-name"),
    toast: document.getElementById("hud-toast"),
    back: document.getElementById("btn-back"),
    devMap: document.getElementById("dev-map"),
    popup: document.getElementById("popup"),
    popupTitle: document.getElementById("popup-title"),
    popupDate: document.getElementById("popup-date"),
    popupSource: document.getElementById("popup-source"),
    popupClose: document.getElementById("popup-close"),
    btnLeft: document.getElementById("btn-left"),
    btnRight: document.getElementById("btn-right"),
    confirm: document.getElementById("confirm"),
    confirmYes: document.getElementById("confirm-yes"),
    confirmNo: document.getElementById("confirm-no")
  };

  // ---------- 게임 상태 ----------
  const state = {
    mapId: null,
    map: null,
    objects: [],
    player: null,
    camX: 0,
    paletteKey: null,
    firedTriggers: {},
    sectionName: null,
    dark: 0,
    hoverObject: null,
    popupOpen: false,
    fade: 0,            // 맵 이동 시 화면 암전 (0~1)
    fadeDir: 0,         // 1: 어두워지는 중, -1: 밝아지는 중
    holdTime: 0,        // 암전 상태로 "로딩 중" 화면을 유지하는 남은 시간(초)
    pendingMap: null,   // 암전이 끝나면 이동할 맵 { id, spawnX }
    endPromptShown: false  // 맵 끝 팝업을 이미 띄웠는지 (끝에서 멀어지면 다시 초기화)
  };

  const LOADING_HOLD = 0.55;   // 로딩 화면이 보이는 시간(초)
  const END_ZONE = 90;         // 맵 끝에서 이 거리 안으로 들어가면 돌아가기 팝업이 열린다
  const END_RESET = 300;       // 끝에서 이 거리 밖으로 벗어나면 다시 팝업이 열릴 수 있다
  const DOOR_REACH = 130;      // 문을 클릭하려면 플레이어가 문에서 이 거리 안에 있어야 한다

  const input = { left: false, right: false };

  // ---------- 맵 불러오기 ----------
  function loadMap(mapId, spawnX) {
    const map = MAPS[mapId];
    if (!map) { console.error("없는 맵:", mapId); return; }

    state.mapId = mapId;
    state.map = map;
    state.objects = OBJECTS_BY_MAP[mapId] || [];
    state.player = Player.create(spawnX != null ? spawnX : map.spawnX);
    state.paletteKey = map.defaultPalette;
    state.firedTriggers = {};
    state.sectionName = null;
    state.hoverObject = null;
    state.endPromptShown = false;
    state.camX = clampCamera(state.player.x - W / 2, map);
    state.dark = targetDarkness();

    els.mapName.textContent = map.name;
    els.back.hidden = (mapId === "main");   // 앨범 맵에서만 "골목으로 돌아가기" 표시
    els.devMap.value = mapId;
    updateSection(true);
  }

  // 암전 효과와 함께 맵 이동
  function travelTo(mapId, spawnX) {
    if (state.pendingMap) return;
    state.pendingMap = { id: mapId, spawnX: spawnX };
    state.fadeDir = 1;
  }

  function clampCamera(x, map) {
    return Math.max(0, Math.min(map.width - W, x));
  }

  function palette() {
    return state.map.palettes[state.paletteKey];
  }

  // 현재 위치에서의 어두운 정도 (메인 골목은 위치에 따라 변하고, 다른 맵은 팔레트 값)
  function targetDarkness() {
    const map = state.map;
    if (map.lighting) {
      const pts = map.lighting;
      const x = state.player.x;
      if (x <= pts[0].x) return pts[0].v;
      for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i].x) {
          const a = pts[i - 1], b = pts[i];
          const t = (x - a.x) / (b.x - a.x);
          return a.v + (b.v - a.v) * t;
        }
      }
      return pts[pts.length - 1].v;
    }
    return palette().dark || 0;
  }

  // ---------- 안내 문구 ----------
  let toastTimer = null;
  function showToast(text) {
    els.toast.textContent = text;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { els.toast.classList.remove("show"); }, 1800);
  }

  // 맵에 구간(sections)이 있으면 구간이 바뀔 때 이름을 보여준다
  function updateSection(silent) {
    const sections = state.map.sections;
    if (!sections) return;
    const x = state.player.x;
    let found = null;
    for (let i = 0; i < sections.length; i++) {
      if (x >= sections[i].from && x < sections[i].to) { found = sections[i].name; break; }
    }
    if (found && found !== state.sectionName) {
      state.sectionName = found;
      if (!silent) showToast(found);
    }
  }

  // 위치 트리거 (예: 미니 5집 하늘 퍼즐에 다가가면 킥옾더월 테마로 전환)
  function checkTriggers() {
    const triggers = state.map.triggers;
    if (!triggers) return;
    for (let i = 0; i < triggers.length; i++) {
      const t = triggers[i];
      if (!state.firedTriggers[t.id] && state.player.x >= t.x) {
        state.firedTriggers[t.id] = true;
        if (t.setPalette) state.paletteKey = t.setPalette;
      }
    }
  }

  // ---------- 업데이트 ----------
  function update(dt) {
    // 맵 이동: 어두워짐 -> (맵 교체 후) 로딩 화면 유지 -> 밝아짐
    if (state.holdTime > 0) {
      state.holdTime -= dt;
      if (state.holdTime <= 0) { state.holdTime = 0; state.fadeDir = -1; }
    } else if (state.fadeDir !== 0) {
      state.fade += state.fadeDir * dt * 4;
      if (state.fadeDir === 1 && state.fade >= 1) {
        state.fade = 1;
        if (state.pendingMap) {
          loadMap(state.pendingMap.id, state.pendingMap.spawnX);
          state.pendingMap = null;
        }
        state.fadeDir = 0;
        state.holdTime = LOADING_HOLD;   // 로딩 화면을 잠깐 보여준 뒤 밝아진다
      } else if (state.fadeDir === -1 && state.fade <= 0) {
        state.fade = 0;
        state.fadeDir = 0;
      }
    }

    const canMove = !state.popupOpen && !state.pendingMap && state.fadeDir === 0 && state.holdTime === 0;
    Player.update(state.player, canMove ? input : { left: false, right: false }, dt, state.map.width);

    checkMapEnd();

    // 카메라: 플레이어를 부드럽게 따라가며 맵 밖은 보이지 않게 제한
    const targetCam = clampCamera(state.player.x - W / 2, state.map);
    state.camX += (targetCam - state.camX) * Math.min(1, dt * 8);

    checkTriggers();
    updateSection(false);

    const darkTarget = targetDarkness();
    state.dark += (darkTarget - state.dark) * Math.min(1, dt * 3);
  }

  // ---------- 그리기 ----------
  function hash(i) {
    const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  }

  function drawLayer(layer, pal) {
    const offset = state.camX * layer.speed;
    const groundY = state.map.groundY;
    const img = Assets.get(layer.image);

    // 이미지가 있으면 가로로 이어 붙인다 (원본 비율 유지)
    if (img) {
      const scale = groundY / img.height;
      const tileW = img.width * scale;
      const startI = Math.floor(offset / tileW);
      for (let i = startI; i * tileW - offset < W; i++) {
        ctx.drawImage(img, Math.round(i * tileW - offset), 0, Math.ceil(tileW), groundY);
      }
      return;
    }

    // 임시 도형: 건물 실루엣
    if (layer.id === "far") {
      const bw = 180;
      for (let i = Math.floor(offset / bw); i * bw - offset < W; i++) {
        const h = 90 + hash(i) * 130;
        ctx.fillStyle = pal.far;
        ctx.fillRect(Math.round(i * bw - offset), groundY - h, bw - 8, h);
      }
    } else {
      const bw = 300;
      for (let i = Math.floor(offset / bw); i * bw - offset < W; i++) {
        const h = 120 + hash(i + 50) * 110;
        const x = Math.round(i * bw - offset);
        ctx.fillStyle = pal.mid;
        ctx.fillRect(x, groundY - h, 260, h);
        // 창문 표시
        ctx.fillStyle = "rgba(255,255,255,0.28)";
        for (let w = 0; w < 3; w++) {
          ctx.fillRect(x + 28 + w * 74, groundY - h + 24, 40, 34);
        }
      }
    }
  }

  function drawObject(obj) {
    const sx = Math.round(obj.x - state.camX);
    if (sx > W + 20 || sx + obj.w < -20) return;   // 화면 밖은 그리지 않음
    const top = state.map.groundY - obj.elev - obj.h;
    const img = Assets.get(obj.image);

    if (obj.type === "board") {
      drawBoard(obj, sx, top);
    } else if (obj.type === "door" && !img) {
      // 임시 문: 문짝과 손잡이
      ctx.fillStyle = obj.color;
      ctx.fillRect(sx, top, obj.w, obj.h);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fillRect(sx + 8, top + 10, obj.w - 16, obj.h - 20);
      ctx.fillStyle = "#e8c35a";
      ctx.fillRect(sx + obj.w - 20, top + obj.h / 2, 7, 7);
    } else if (img) {
      Assets.drawFit(ctx, img, sx, top, obj.w, obj.h);
    } else {
      // 임시 색 블록
      ctx.fillStyle = obj.color;
      ctx.fillRect(sx, top, obj.w, obj.h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = obj.type === "event" ? "#2b2b2b" : "rgba(0,0,0,0.25)";
      if (obj.pending) ctx.setLineDash([4, 3]);
      ctx.strokeRect(sx + 1, top + 1, obj.w - 2, obj.h - 2);
      ctx.setLineDash([]);
    }

    // 이름표 (위치와 크기 확인용)
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.fillStyle = "#fff";
    ctx.strokeText(obj.label, sx + obj.w / 2, top - 5);
    ctx.fillText(obj.label, sx + obj.w / 2, top - 5);

    // 클릭 가능한 오브제는 마우스를 올리면 강조
    if (obj === state.hoverObject) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffe14d";
      ctx.strokeRect(sx - 3, top - 3, obj.w + 6, obj.h + 6);
    }
  }

  // 앨범 이동용 스케이트보드 (모든 보드는 같은 형태, 색만 다름)
  function drawBoard(obj, sx, top) {
    const colors = ALBUM_BOARD_COLORS[obj.target] || ["#888", "#fff"];
    ctx.fillStyle = colors[0];
    ctx.fillRect(sx, top + 6, obj.w, 12);
    ctx.fillStyle = colors[1];
    ctx.fillRect(sx + obj.w / 2 - 14, top + 9, 28, 6);   // 작은 그래픽 자리
    ctx.fillStyle = "#222";
    ctx.fillRect(sx + 12, top + 18, 10, 8);              // 바퀴
    ctx.fillRect(sx + obj.w - 22, top + 18, 10, 8);
  }

  function render() {
    const map = state.map;
    const pal = palette();

    // 하늘
    ctx.fillStyle = pal.sky;
    ctx.fillRect(0, 0, W, H);

    // 뒤쪽, 중간 배경 층
    for (let i = 0; i < map.layers.length; i++) drawLayer(map.layers[i], pal);

    // 바닥과 이동 확인용 눈금
    ctx.fillStyle = pal.ground;
    ctx.fillRect(0, map.groundY, W, H - map.groundY);
    ctx.fillStyle = pal.line;
    ctx.fillRect(0, map.groundY, W, 4);
    for (let x = -(state.camX % 120); x < W; x += 120) {
      ctx.fillRect(Math.round(x), map.groundY + 40, 60, 4);
    }

    // 오브제: 장식 -> 사건/보드 순서로 그려서 핵심 오브제가 위에 보이게
    for (let i = 0; i < state.objects.length; i++) {
      if (state.objects[i].type === "deco") drawObject(state.objects[i]);
    }
    for (let i = 0; i < state.objects.length; i++) {
      if (state.objects[i].type !== "deco") drawObject(state.objects[i]);
    }

    // 플레이어
    Player.draw(ctx, state.player, state.player.x - state.camX, map.groundY + 18);

    // 어두운 분위기 (메인 골목의 데뷔 전 구간, 미니 5집 미완성 구간)
    if (state.dark > 0.01) {
      ctx.fillStyle = "rgba(8, 12, 34, " + state.dark.toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);
    }

    // 맵 이동 암전 + 로딩 문구
    if (state.fade > 0) {
      ctx.fillStyle = "rgba(0, 0, 0, " + Math.min(1, state.fade).toFixed(3) + ")";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255, 255, 255, " + Math.min(1, state.fade).toFixed(3) + ")";
      ctx.font = "20px sans-serif";
      ctx.textAlign = "center";
      const dots = ".".repeat(1 + Math.floor(performance.now() / 300) % 3);
      const nextName = state.pendingMap ? MAPS[state.pendingMap.id].name : state.map.name;
      ctx.fillText(nextName, W / 2, H / 2 - 8);
      ctx.font = "14px sans-serif";
      ctx.fillText("이동 중" + dots, W / 2, H / 2 + 20);
    }
  }

  // ---------- 클릭 처리 ----------
  // 화면(CSS 크기) 좌표를 월드 좌표로 바꾼다
  function pointerToWorld(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (W / rect.width);
    const py = (e.clientY - rect.top) * (H / rect.height);
    return { x: px + state.camX, y: py };
  }

  function findClickable(wx, wy) {
    const pad = 8;   // 터치하기 쉽도록 판정을 조금 넓힘
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const o = state.objects[i];
      if (o.type === "deco") continue;
      const top = state.map.groundY - o.elev - o.h;
      if (wx >= o.x - pad && wx <= o.x + o.w + pad && wy >= top - pad && wy <= top + o.h + pad) return o;
    }
    return null;
  }

  canvas.addEventListener("mousemove", function (e) {
    if (state.popupOpen) return;
    const p = pointerToWorld(e);
    state.hoverObject = findClickable(p.x, p.y);
    canvas.style.cursor = state.hoverObject ? "pointer" : "default";
  });

  canvas.addEventListener("click", function (e) {
    if (state.popupOpen || state.pendingMap) return;
    const p = pointerToWorld(e);
    const obj = findClickable(p.x, p.y);
    if (!obj) return;

    if (obj.type === "board") {
      travelTo(obj.target);                 // 6단계: 앨범 맵으로 이동 (확인용으로 미리 연결)
    } else if (obj.type === "door") {
      // 문은 가까이 다가가야 열린다
      const doorCenter = obj.x + obj.w / 2;
      if (Math.abs(state.player.x - doorCenter) <= DOOR_REACH + obj.w / 2) {
        travelTo(obj.target);               // 로딩 화면을 거쳐 같은 앨범의 다음 장면으로 이동
      } else {
        showToast("문 앞으로 가까이 가 보세요");
      }
    } else if (obj.type === "event") {
      openPopup(obj.eventId);               // 7단계에서 정식 팝업으로 교체
    }
  });

  // ---------- 임시 팝업 ----------
  function openPopup(eventId) {
    const ev = EVENT_BY_ID[eventId];
    if (!ev) return;
    els.popupTitle.textContent = ev.title;
    els.popupDate.textContent = (ev.date || "") + (ev.dateNote ? "  (" + ev.dateNote + ")" : "");
    els.popupSource.textContent = ev.source ? "출처: " + ev.source : "";
    els.popup.hidden = false;
    state.popupOpen = true;
  }

  function closePopup() {
    els.popup.hidden = true;
    state.popupOpen = false;
  }
  els.popupClose.addEventListener("click", closePopup);
  els.popup.addEventListener("click", function (e) { if (e.target === els.popup) closePopup(); });

  // ---------- 메인 골목으로 돌아가기 ----------
  // 돌아가면 해당 앨범 보드 앞에서 시작한다. 2집/3집처럼 장면이 나뉜 앨범도 앨범 id로 보드를 찾는다.
  // (9단계에서 미수집 기록이 있을 때 경고 팝업을 이 부분에 추가한다)
  function backToMain() {
    if (state.mapId === "main") return;
    let spawnX = MAPS.main.spawnX;
    const boards = OBJECTS_BY_MAP.main;
    for (let i = 0; i < boards.length; i++) {
      if (boards[i].type === "board" && boards[i].target === state.map.album) {
        spawnX = boards[i].x + boards[i].w / 2;
      }
    }
    travelTo("main", spawnX);
  }
  els.back.addEventListener("click", backToMain);

  // ---------- 맵 끝 팝업 ----------
  // 앨범의 마지막 장면 끝에 닿으면 "메인 골목으로 돌아갈까요?" 팝업을 띄운다.
  // 한 번 닫으면 끝에서 충분히 멀어질 때까지 다시 뜨지 않는다.
  function checkMapEnd() {
    const map = state.map;
    if (!map.finalScene || state.popupOpen || state.pendingMap || state.fadeDir !== 0 || state.holdTime > 0) return;
    const distToEnd = map.width - state.player.x;
    if (!state.endPromptShown && distToEnd <= END_ZONE) {
      state.endPromptShown = true;
      openConfirm();
    } else if (state.endPromptShown && distToEnd > END_RESET) {
      state.endPromptShown = false;
    }
  }

  function openConfirm() {
    els.confirm.hidden = false;
    state.popupOpen = true;   // 팝업이 열려 있는 동안 이동 정지
  }
  function closeConfirm() {
    els.confirm.hidden = true;
    state.popupOpen = false;
  }
  els.confirmYes.addEventListener("click", function () { closeConfirm(); backToMain(); });
  els.confirmNo.addEventListener("click", closeConfirm);

  // 개발용 맵 선택
  if (CONFIG.debug) {
    els.devMap.hidden = false;
    MAP_ORDER.forEach(function (id) {
      const opt = document.createElement("option");
      opt.value = id;
      opt.textContent = MAPS[id].name;
      els.devMap.appendChild(opt);
    });
    els.devMap.addEventListener("change", function () {
      travelTo(els.devMap.value);
      els.devMap.blur();   // 선택창이 방향키 입력을 가로채지 않도록
    });
  }

  // ---------- 입력 ----------
  window.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") { input.left = true; e.preventDefault(); }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") { input.right = true; e.preventDefault(); }
    if (e.key === "Escape" && state.popupOpen) {
      if (!els.confirm.hidden) closeConfirm(); else closePopup();
    }
  });
  window.addEventListener("keyup", function (e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") input.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") input.right = false;
  });
  window.addEventListener("blur", function () { input.left = false; input.right = false; });

  // 모바일 터치 버튼 (누르고 있는 동안 이동)
  function bindHold(button, key) {
    const on = function (e) { input[key] = true; e.preventDefault(); };
    const off = function () { input[key] = false; };
    button.addEventListener("pointerdown", on);
    button.addEventListener("pointerup", off);
    button.addEventListener("pointercancel", off);
    button.addEventListener("pointerleave", off);
  }
  bindHold(els.btnLeft, "left");
  bindHold(els.btnRight, "right");

  // ---------- 게임 루프 ----------
  let lastTime = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);   // 탭 전환 후 순간이동 방지
    lastTime = now;
    try {
      update(dt);
      render();
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(frame);
  }

  loadMap("main");
  requestAnimationFrame(frame);
})();
