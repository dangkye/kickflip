// ===== 도감 저장소 (localStorage) =====
// 저장 키는 목적별로 분리한다.
//   kf_collected      : 수집한 사건 { 사건id: 수집한 시각 }
//   kf_read_comments  : 열람한 소감 { "사건id|멤버": true }
// 사건 수집과 소감 열람은 서로 별개의 기록이다.
// localStorage가 막힌 환경(시크릿 모드 등)에서는 메모리에만 저장하고 게임은 계속 동작한다.

const Collection = (() => {
  const KEY_COLLECTED = "kf_collected";
  const KEY_READ = "kf_read_comments";

  function load(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return {};
      const value = JSON.parse(raw);
      return (value && typeof value === "object" && !Array.isArray(value)) ? value : {};
    } catch (e) {
      return {};
    }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 불가 환경은 무시 */ }
  }

  let collected = load(KEY_COLLECTED);
  let read = load(KEY_READ);
  const listeners = [];

  function notify() {
    listeners.forEach(function (f) {
      try { f(); } catch (e) { console.error(e); }
    });
  }

  function isCollected(eventId) { return !!collected[eventId]; }

  // 처음 수집하면 true, 이미 수집했으면 false
  function collect(eventId) {
    if (collected[eventId]) return false;
    collected[eventId] = Date.now();
    save(KEY_COLLECTED, collected);
    notify();
    return true;
  }

  function readKey(eventId, member) { return eventId + "|" + member; }
  function isRead(eventId, member) { return !!read[readKey(eventId, member)]; }

  function markRead(eventId, member) {
    const key = readKey(eventId, member);
    if (read[key]) return;
    read[key] = true;
    save(KEY_READ, read);
    notify();
  }

  // 한 사건에서 열람한 소감 수
  function readCount(eventId) {
    const ev = EVENT_BY_ID[eventId];
    if (!ev) return 0;
    return ev.comments.filter(function (cm) { return isRead(eventId, cm.member); }).length;
  }

  function totalCount() { return EVENTS.length; }
  function collectedCount() { return EVENTS.filter(function (e) { return isCollected(e.id); }).length; }

  // 앨범(장면이 여러 개인 앨범 포함)에서 아직 수집하지 않은 사건 수
  function remainingInAlbum(albumId) {
    return EVENTS.filter(function (e) {
      const map = MAPS[e.mapId];
      return map && map.album === albumId && !isCollected(e.id);
    }).length;
  }

  function onChange(fn) { listeners.push(fn); }

  // 개발용: 수집 기록 초기화
  function reset() {
    collected = {};
    read = {};
    save(KEY_COLLECTED, collected);
    save(KEY_READ, read);
    notify();
  }

  return { isCollected, collect, isRead, markRead, readCount, totalCount, collectedCount,
           remainingInAlbum, onChange, reset };
})();
