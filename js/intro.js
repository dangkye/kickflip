// ===== 시작 화면: 타이틀 -> 멤버 선택 -> 착장 선택 =====
// 1) 타이틀 화면에서 "시작하기"
// 2) 멤버 7명 중 한 명을 고른다
// 3) 고른 멤버의 착장만 나열되고, 하나를 골라 "이 착장으로 시작"
// 선택 결과는 저장하지 않는다. 새로 접속하거나 새로고침하면 항상 타이틀 화면부터 다시 시작한다.
// 게임을 시작한 뒤에는 아바타를 바꿀 수 없다.
// 착장 목록은 avatars-data.js, 화면 이미지는 assets.js의 UI_IMAGES / MEMBERS.portrait에서 관리한다.

const Intro = (() => {
  let hooks = { onStart: function () {} };
  let els = null;
  let selectedMember = null;
  let selectedOutfit = null;

  function byId(id) { return document.getElementById(id); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  // ---------- 착장 목록 ----------
  function outfitsOf(member) {
    return OUTFITS.filter(function (o) { return o.member === member; });
  }

  // ---------- 미리보기 그리기 ----------
  // 임시 도형을 먼저 그리고, 이미지 경로가 있으면 불러온 뒤 이미지로 바꿔 그린다.
  function drawPreview(canvas, outfit, imagePath) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.imageSmoothingEnabled = false;

    function figure() {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h - 6);
      ctx.scale(2.2, 2.2);
      // 미리보기는 이미지 대신 도형을 그리도록 이미지 경로를 뺀 복사본을 쓴다
      Player.drawFigure(ctx, Object.assign({}, outfit, { idle: null, walk: [] }), { moving: false, walkTime: 0 });
      ctx.restore();
    }
    figure();

    const src = imagePath || outfit.preview || outfit.idle;
    if (src) {
      const img = new Image();
      img.onload = function () {
        ctx.clearRect(0, 0, w, h);
        Assets.drawFit(ctx, img, 4, 4, w - 8, h - 8);
      };
      img.src = src;   // 불러오지 못하면 임시 도형이 그대로 남는다
    }
  }

  function newPreviewCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 90;
    canvas.height = 126;
    return canvas;
  }

  // ---------- 화면 전환 ----------
  function show(screenId) {
    ["screen-title", "screen-member", "screen-outfit"].forEach(function (id) {
      byId(id).hidden = (id !== screenId);
    });
  }

  function showMemberScreen() {
    clear(els.memberGrid);
    MEMBERS.forEach(function (m) {
      const list = outfitsOf(m.id);
      const card = make("button", "member-card");
      card.type = "button";
      card.dataset.member = m.id;
      card.style.borderBottomColor = m.color;

      const canvas = newPreviewCanvas();
      if (list.length > 0) drawPreview(canvas, list[0], m.portrait);
      card.appendChild(canvas);
      card.appendChild(make("span", "card-name", m.id));

      if (list.length === 0) {
        card.disabled = true;
        card.appendChild(make("span", "card-note", "준비 중"));
      } else {
        card.addEventListener("click", function () { showOutfitScreen(m.id); });
      }
      els.memberGrid.appendChild(card);
    });
    show("screen-member");
  }

  function showOutfitScreen(memberId) {
    selectedMember = memberId;
    selectedOutfit = null;
    els.outfitGo.disabled = true;
    els.outfitHeading.textContent = memberId + " 착장 선택";

    clear(els.outfitGrid);
    outfitsOf(memberId).forEach(function (o) {
      const card = make("button", "outfit-card");
      card.type = "button";
      card.dataset.outfit = o.id;

      const canvas = newPreviewCanvas();
      drawPreview(canvas, o);
      card.appendChild(canvas);
      card.appendChild(make("span", "card-name", o.name));
      card.addEventListener("click", function () { chooseOutfit(o, card); });
      els.outfitGrid.appendChild(card);

    });
    show("screen-outfit");
  }

  function chooseOutfit(outfit, card) {
    const all = els.outfitGrid.querySelectorAll(".outfit-card");
    for (let i = 0; i < all.length; i++) all[i].classList.remove("selected");
    card.classList.add("selected");
    selectedOutfit = outfit;
    els.outfitGo.disabled = false;
  }

  function startGame() {
    if (!selectedOutfit) return;
    els.root.hidden = true;
    hooks.onStart(selectedOutfit);
  }

  // ---------- 초기화 ----------
  function init(h) {
    hooks = Object.assign(hooks, h || {});
    els = {
      root: byId("intro"),
      start: byId("btn-start"),
      memberGrid: byId("member-grid"),
      memberBack: byId("member-back"),
      outfitHeading: byId("outfit-heading"),
      outfitGrid: byId("outfit-grid"),
      outfitBack: byId("outfit-back"),
      outfitGo: byId("outfit-go")
    };

    // 타이틀 배경 이미지가 있으면 적용 (불러오지 못하면 단색 배경 유지)
    if (UI_IMAGES.title) {
      const img = new Image();
      img.onload = function () { els.root.style.backgroundImage = "url(" + UI_IMAGES.title + ")"; };
      img.src = UI_IMAGES.title;
    }

    els.start.addEventListener("click", showMemberScreen);
    els.memberBack.addEventListener("click", function () { show("screen-title"); });
    els.outfitBack.addEventListener("click", showMemberScreen);
    els.outfitGo.addEventListener("click", startGame);

    els.root.hidden = false;
    show("screen-title");
  }

  // 개발용: 시작 화면을 건너뛴다 (CONFIG.skipIntro)
  function skip() { els.root.hidden = true; }

  return { init, skip };
})();
