// ===== 음악 연결 훅 (실제 배경음악 재생은 음악 단계에서 이 파일에 이어서 구현) =====
// 지금은 "영상 재생 중이면 배경음악을 멈춘다"는 약속(인터페이스)만 만들어 둔다.
//  - 사건 팝업에서 영상을 재생하면 Music.setVideoPlaying(true)
//  - 영상을 멈추거나 팝업을 닫으면 Music.setVideoPlaying(false)
// 음악 단계에서는 onVideoStateChange로 구독해서 true면 BGM을 일시정지하고,
// false면 다시 재생하도록 연결하면 된다.

const Music = (() => {
  let videoPlaying = false;
  const listeners = [];

  function setVideoPlaying(on) {
    on = !!on;
    if (on === videoPlaying) return;
    videoPlaying = on;
    listeners.forEach(function (f) {
      try { f(on); } catch (e) { console.error(e); }
    });
  }

  function isVideoPlaying() { return videoPlaying; }
  function onVideoStateChange(fn) { listeners.push(fn); }

  return { setVideoPlaying, isVideoPlaying, onVideoStateChange };
})();
