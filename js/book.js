// ===== 도감 화면 =====
// 전체 사건 목록과 수집 여부를 보여준다. 수집하지 않은 사건은 제목을 "???"로 가린다.
// 수집 기록 자체는 collection.js가 localStorage에 저장한다.

const Book = (() => {
  let els = null;
  let hooks = { onOpen: function () {}, onClose: function () {}, canOpen: function () { return true; } };
  let opened = false;

  function byId(id) { return document.getElementById(id); }
  function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }
  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function init(h) {
    hooks = Object.assign(hooks, h || {});
    els = {
      button: byId("btn-book"),
      root: byId("book"),
      progress: byId("book-progress"),
      list: byId("book-list"),
      close: byId("book-close"),
      reset: byId("book-reset")
    };

    els.button.addEventListener("click", function () { if (hooks.canOpen()) open(); });
    els.close.addEventListener("click", close);
    els.root.addEventListener("click", function (e) { if (e.target === els.root) close(); });

    // 개발용 초기화 버튼은 CONFIG.debug가 true일 때만 보인다
    els.reset.hidden = !CONFIG.debug;
    els.reset.addEventListener("click", function () {
      if (window.confirm("도감 수집 기록과 소감 열람 기록을 모두 지울까요?")) Collection.reset();
    });

    // 수집 상태가 바뀌면 열려 있는 도감도 갱신
    Collection.onChange(function () { if (opened) render(); });
    updateButton();
    Collection.onChange(updateButton);
  }

  function updateButton() {
    els.button.textContent = "도감 " + Collection.collectedCount() + "/" + Collection.totalCount();
  }

  function isOpen() { return opened; }

  function open() {
    if (opened) return;
    render();
    els.root.hidden = false;
    opened = true;
    hooks.onOpen();
  }

  function close() {
    if (!opened) return;
    els.root.hidden = true;
    opened = false;
    hooks.onClose();
  }

  function render() {
    els.progress.textContent = "수집 " + Collection.collectedCount() + " / " + Collection.totalCount();
    clear(els.list);

    ALBUM_ORDER.forEach(function (albumId) {
      const events = EVENTS.filter(function (e) {
        return MAPS[e.mapId] && MAPS[e.mapId].album === albumId;
      });
      if (events.length === 0) return;

      const done = events.filter(function (e) { return Collection.isCollected(e.id); }).length;
      const group = make("section", "book-group");
      group.appendChild(make("h3", "book-group-title", ALBUM_NAMES[albumId] + "  (" + done + "/" + events.length + ")"));

      const ul = make("ul", "book-items");
      events.forEach(function (e) {
        const got = Collection.isCollected(e.id);
        const li = make("li", "book-item " + (got ? "got" : "locked"));
        li.appendChild(make("span", "book-mark", got ? "✓" : "?"));
        li.appendChild(make("span", "book-title", got ? e.title : "???"));
        if (got && e.date) li.appendChild(make("span", "book-date", e.date));
        if (got && e.comments.length > 0) {
          li.appendChild(make("span", "book-read", "소감 " + Collection.readCount(e.id) + "/" + e.comments.length));
        }
        ul.appendChild(li);
      });
      group.appendChild(ul);
      els.list.appendChild(group);
    });
  }

  return { init, open, close, isOpen };
})();
