// ===== 사건 기록 팝업 (공통 컴포넌트) =====
// 사건마다 팝업을 따로 만들지 않고, 사건 데이터(events-data.js, comments-data.js)를 받아서 그린다.
// 구성: 제목 / 날짜 / 설명 / 사진·영상 / 멤버별 스케이트보드 / 소감 / 출처 / 닫기
//
// 영상은 썸네일만 보여주고, 클릭하면 그 자리에서 재생한다.
// 영상을 재생하는 동안 Music.setVideoPlaying(true)로 배경음악을 멈추게 한다.

const Popup = (() => {
  let hooks = { onOpen: function () {}, onClose: function () {} };
  let els = null;
  let current = null;      // 지금 열려 있는 사건
  let mediaIndex = 0;
  let videoActive = false; // 영상이 재생 중인지
  let opened = false;

  function byId(id) { return document.getElementById(id); }

  function clear(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function init(h) {
    hooks = Object.assign(hooks, h || {});
    els = {
      root: byId("popup"),
      title: byId("popup-title"),
      date: byId("popup-date"),
      isNew: byId("popup-new"),
      desc: byId("popup-desc"),
      media: byId("popup-media"),
      mediaView: byId("media-view"),
      mediaPrev: byId("media-prev"),
      mediaNext: byId("media-next"),
      mediaCount: byId("media-count"),
      boards: byId("popup-boards"),
      boardsList: byId("boards-list"),
      comment: byId("popup-comment"),
      commentHead: byId("comment-head"),
      commentMeta: byId("comment-meta"),
      commentBody: byId("comment-body"),
      source: byId("popup-source"),
      close: byId("popup-close")
    };

    els.close.addEventListener("click", close);
    els.root.addEventListener("click", function (e) { if (e.target === els.root) close(); });
    els.mediaPrev.addEventListener("click", function () { moveMedia(-1); });
    els.mediaNext.addEventListener("click", function () { moveMedia(1); });
  }

  function isOpen() { return opened; }

  // ---------- 열기 / 닫기 ----------
  function open(eventId) {
    const ev = EVENT_BY_ID[eventId];
    if (!ev || opened) return;
    current = ev;
    mediaIndex = 0;

    // 도감에 수집 (처음이면 안내 문구 표시)
    const firstTime = Collection.collect(ev.id);

    els.title.textContent = ev.title;
    els.date.textContent = (ev.date || "") + (ev.dateNote ? "  (" + ev.dateNote + ")" : "");
    els.date.hidden = !els.date.textContent;
    els.isNew.hidden = !firstTime;

    els.desc.textContent = ev.description || "";
    els.desc.hidden = !ev.description;

    els.source.textContent = ev.source ? "출처: " + ev.source : "";
    els.source.hidden = !ev.source;

    renderMedia();
    renderBoards();
    els.comment.hidden = true;

    els.root.hidden = false;
    els.root.scrollTop = 0;
    opened = true;
    hooks.onOpen();
  }

  function close() {
    if (!opened) return;
    stopVideo();
    els.root.hidden = true;
    opened = false;
    current = null;
    hooks.onClose();
  }

  // ---------- 사진 / 영상 ----------
  function renderMedia() {
    stopVideo();
    const list = current.media || [];
    els.media.hidden = list.length === 0;
    if (list.length === 0) return;

    const item = list[mediaIndex];
    clear(els.mediaView);

    if (item.type === "video") {
      els.mediaView.appendChild(buildVideoThumb(item));
    } else {
      els.mediaView.appendChild(buildImage(item));
    }
    if (item.label) els.mediaView.appendChild(make("div", "media-label", item.label));

    // 여러 개일 때만 넘기기 버튼 표시
    const multi = list.length > 1;
    els.mediaPrev.hidden = !multi;
    els.mediaNext.hidden = !multi;
    els.mediaCount.hidden = !multi;
    els.mediaCount.textContent = (mediaIndex + 1) + " / " + list.length;
  }

  function moveMedia(step) {
    const n = (current.media || []).length;
    if (n < 2) return;
    mediaIndex = (mediaIndex + step + n) % n;
    renderMedia();
  }

  function buildImage(item) {
    const frame = make("div", "media-frame");
    const img = new Image();
    img.alt = item.label || current.title;
    img.src = item.src;
    img.onerror = function () {
      frame.classList.add("media-missing");
      frame.textContent = "이미지를 불러올 수 없어요";
    };
    frame.appendChild(img);
    return frame;
  }

  function buildVideoThumb(item) {
    const btn = make("button", "media-frame video-thumb");
    btn.type = "button";
    btn.setAttribute("aria-label", "영상 재생");

    const img = new Image();
    img.alt = item.label || current.title;
    img.src = "https://img.youtube.com/vi/" + item.youtubeId + "/hqdefault.jpg";
    img.onerror = function () {
      // 썸네일을 불러오지 못해도 재생 버튼은 그대로 쓸 수 있다
      if (img.parentNode) img.parentNode.removeChild(img);
      btn.classList.add("no-thumb");
    };
    btn.appendChild(img);
    btn.appendChild(make("span", "play-icon", "▶"));
    btn.addEventListener("click", function () { startVideo(item, btn); });
    return btn;
  }

  function startVideo(item, thumb) {
    const frame = make("div", "media-frame video-playing");
    const iframe = document.createElement("iframe");
    iframe.src = "https://www.youtube.com/embed/" + item.youtubeId + "?autoplay=1&rel=0&playsinline=1";
    iframe.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; fullscreen");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("title", item.label || current.title);
    frame.appendChild(iframe);

    thumb.parentNode.replaceChild(frame, thumb);
    videoActive = true;
    Music.setVideoPlaying(true);   // 배경음악 멈춤
  }

  function stopVideo() {
    if (els && els.mediaView) clear(els.mediaView);   // iframe을 없애 재생을 멈춘다
    if (videoActive) {
      videoActive = false;
      Music.setVideoPlaying(false);   // 배경음악 다시 재생
    }
  }

  // ---------- 멤버별 스케이트보드와 소감 ----------
  function memberInfo(name) {
    for (let i = 0; i < MEMBERS.length; i++) {
      if (MEMBERS[i].id === name) return MEMBERS[i];
    }
    return { id: name, color: "#999999", skateboardImage: null };
  }

  function renderBoards() {
    clear(els.boardsList);
    const comments = current.comments || [];
    els.boards.hidden = comments.length === 0;   // 소감이 없으면 영역 전체 숨김
    if (comments.length === 0) return;

    comments.forEach(function (cm) {
      const info = memberInfo(cm.member);
      const btn = make("button", "member-board");
      btn.type = "button";
      btn.dataset.member = cm.member;
      if (Collection.isRead(current.id, cm.member)) btn.classList.add("read");

      // 스케이트보드: 이미지가 있으면 이미지, 없으면 색 블록
      const art = make("span", "board-art");
      const deck = make("span", "board-deck");
      deck.style.background = info.color;
      art.appendChild(deck);
      art.appendChild(make("span", "board-wheel w1"));
      art.appendChild(make("span", "board-wheel w2"));
      if (info.skateboardImage) {
        const img = new Image();
        img.alt = "";
        img.onload = function () { art.classList.add("has-image"); };
        img.onerror = function () { if (img.parentNode) img.parentNode.removeChild(img); };
        img.src = info.skateboardImage;
        art.appendChild(img);
      }
      btn.appendChild(art);
      btn.appendChild(make("span", "board-name", cm.member));

      btn.addEventListener("click", function () { showComment(cm, btn); });
      els.boardsList.appendChild(btn);
    });
  }

  function showComment(cm, btn) {
    const all = els.boardsList.querySelectorAll(".member-board");
    for (let i = 0; i < all.length; i++) all[i].classList.remove("selected");
    btn.classList.add("selected");

    els.commentHead.textContent = cm.member + (cm.title ? "  ·  " + cm.title : "");
    const meta = [];
    if (cm.date) meta.push(cm.date);
    if (cm.source) meta.push("출처: " + cm.source);
    els.commentMeta.textContent = meta.join("  ·  ");
    els.commentMeta.hidden = meta.length === 0;
    els.commentBody.textContent = cm.content;
    els.comment.hidden = false;

    Collection.markRead(current.id, cm.member);   // 소감 열람은 사건 수집과 별도 기록
    btn.classList.add("read");
  }

  return { init, open, close, isOpen };
})();
