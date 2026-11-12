// ===== 사건 데이터 =====
// 사건 제목/날짜/출처/미디어/멤버별 소감은 모두 여기서 관리한다.
// 날짜와 제목은 제공된 자료 그대로 사용하며 임의로 수정하지 않는다.
// comments(멤버별 소감 원문)는 8단계에서 실제 자료를 그대로 입력한다. 지금은 비워 둔다.
//
// comments 항목 형태:
//   { member: "계훈", title: "글 제목", date: "2024.07.11", content: "원문", source: "공식 블로그" }
// 멤버별 스케이트보드는 comments에 등록된 멤버만 자동 생성된다.

const EVENTS = [];

function addEvent(id, mapId, title, date, source, extra) {
  EVENTS.push(Object.assign({
    id: id,
    mapId: mapId,
    title: title,
    date: date,       // 자료에 날짜가 없으면 빈 문자열
    source: source,   // 팝업에 "출처: ..." 텍스트로만 표시 (없으면 빈 문자열)
    description: "",  // 관련 설명 (추후 입력)
    media: [],        // 사진/영상 자료 (추후 입력)
    comments: []      // 멤버별 소감 (8단계에서 입력)
  }, extra || {}));
}

// ----- 메인 골목 (자료에 적힌 순서와 날짜 그대로) -----
addEvent("diary", "main", "데뷔 전 멤버들의 일기", "", "킥플립 공식 홈페이지");
addEvent("team-name-first", "main", "팀명 첫 언급", "2024.11.22", "2024 MAMA JYP VCR");
addEvent("logo-reveal", "main", "첫 팀명 공개", "", "공식 유튜브");
addEvent("debut-confirmed", "main", "데뷔일 확정", "2024.07.11~12", "공식 블로그");
addEvent("first-fanz", "main", "첫 팬즈", "2025.01.06", "");
addEvent("first-insta", "main", "첫 인스타그램", "2025.01.06", "");
addEvent("first-content", "main", "첫 자체 콘텐츠", "2025.03.21", "");
addEvent("fandom-name", "main", "팬덤명 공개", "2025.05.26", "");
addEvent("first-pitch", "main", "첫 시구", "2025.07.18", "");
addEvent("lollapalooza", "main", "롤라팔루자", "2025.08.02", "");
addEvent("lightstick", "main", "응원봉 공개", "2025.12.11", "");
addEvent("donghyeon-graduation", "main", "동현 졸업식", "2026.01.08", "", { dateNote: "관련 영상 2026.02.16" });
addEvent("first-ost", "main", "첫 OST", "2026.01.11", "");
addEvent("debut-anniversary", "main", "데뷔 1주년", "2026.01.20", "");
addEvent("amaru-letter", "main", "아마루 편지", "2026.03.02", "");
addEvent("kyehoon-mc", "main", "계훈 첫 엠카운트다운 MC", "2026.03.12", "");
addEvent("donghyeon-breathe", "main", "동현 BREATHE 발매", "2026.08.14", "");
addEvent("kikdungsseu", "main", "킥둥쓰", "2026.09.14", "");

// ----- 미니 1집 Flip it, Kick it! -----
addEvent("umm-great-release", "album1", "응그래 공개", "2025.01.06", "");
addEvent("debut-showcase", "album1", "데뷔 쇼케이스", "2025.01.20", "공식 유튜브, 킥플립 공식 트위터");
addEvent("mama-said-release", "album1", "마마새드 공개", "2025.01.20", "");
addEvent("first-broadcast-1", "album1", "첫 음악방송", "2025.01.23", "엠카운트다운 공식 유튜브");
addEvent("see-you-tomorrow", "album1", "내일에서 만나 영상", "", "");
addEvent("debut-lecture", "album1", "JYP 데뷔특강", "", "공식 유튜브");

// ----- 미니 2집 Kick Out, Flip Now! -----
addEvent("trailer-2", "album2", "미니 2집 뮤직비디오 티저", "2025.05.02", "공식 유튜브");
addEvent("freeze-release", "album2", "프리즈 공개", "2025.05.26", "");
addEvent("complicated", "album2b", "컴플리케이티드 영상", "", "");
addEvent("first-broadcast-2", "album2", "2집 첫 음악방송", "2025.05.29", "공식 인스타, 공식 유튜브");

// ----- 미니 3집 My First Flip -----
addEvent("band-aid-release", "album3", "반창고 공개", "2025.09.02", "");
addEvent("simulation-promo", "album3b", "시뮬레이션 프로모션", "", "");
addEvent("cheobulno-release", "album3b", "처불노 공개", "2025.09.22", "");
addEvent("first-broadcast-3", "album3c", "첫 음악방송", "2025.09.26", "");
addEvent("first-win-3", "album3c", "쇼챔피언 첫 1위", "2025.10.01", "공식 인스타, 쇼챔피언 앵콜 무대 유튜브");

// ----- 팬콘 From KickFlip, To WeFlip -----
addEvent("fancon-end", "fancon", "팬콘서트 종료 소감", "2026.02.28", "");

// ----- 미니 4집 My First Kick -----
addEvent("twenty-release", "album4", "트웬티 공개", "2026.03.09", "");
addEvent("twenty-broadcast", "album4", "트웬티 첫 음악방송", "2026.03.12", "");
addEvent("eyepoppin-release", "album4", "눈거싶 공개", "2026.04.06", "");
addEvent("eyepoppin-broadcast", "album4", "눈거싶 첫 음악방송", "2026.04.09", "");

// ----- 미니 5집 KICK OFF THE WALL Pt.1 -----
addEvent("incomplete-release", "album5", "미완성 공개", "2026.09.28", "");
addEvent("kickoff-release", "album5", "킥옾더월 공개", "2026.10.06", "");
addEvent("incomplete-broadcast", "album5", "미완성 음악방송", "2026.10.08", "");
addEvent("kickoff-broadcast", "album5", "킥옾더월 음악방송", "2026.10.08", "");
addEvent("hate-blueberry", "album5", "헤이트 블루베리 영상", "", "");
addEvent("mcountdown-first-win", "album5", "엠카운트다운 첫 1위", "2026.10.15", "");

const EVENT_BY_ID = {};
EVENTS.forEach(function (e) { EVENT_BY_ID[e.id] = e; });

// ===== 사건별 영상 (썸네일로 표시되고, 클릭하면 팝업 안에서 재생) =====
// 제공받은 자료의 유튜브 링크에서 영상 ID만 옮겼다. (링크의 youtu.be/ 뒤 11글자)
// 영상 링크를 바꾸거나 추가하려면 아래 목록의 ID만 고치면 된다.
// 사진은 { type: "image", src: "assets/media/파일이름.png", label: "설명" } 형태로 같은 media 배열에 넣는다.
// (자료에 링크가 없던 사건은 비워 두었다: 첫 팀명 공개, 2집 티저, 시뮬레이션 프로모션 등)

function addVideos(eventId, list) {
  const ev = EVENT_BY_ID[eventId];
  if (!ev) { console.error("영상을 연결할 사건이 없음:", eventId); return; }
  list.forEach(function (v) {
    ev.media.push({ type: "video", youtubeId: v.id, label: v.label || "" });
  });
}

addVideos("umm-great-release", [{ id: "L__ITOj-g8E" }]);
addVideos("mama-said-release", [{ id: "JY0UTOgh8M8" }]);
addVideos("first-broadcast-1", [{ id: "b7P60UZQNtM", label: "응그래 무대" }, { id: "zePswrUiTPQ", label: "마마새드 무대" }]);
addVideos("see-you-tomorrow", [{ id: "A1xGW7TNr3k" }]);
addVideos("debut-lecture", [{ id: "ZOmmALFXXv8" }]);
addVideos("first-content", [{ id: "rNJnV1xbQfo" }]);
addVideos("freeze-release", [{ id: "Z6fpV6V9y80" }]);
addVideos("complicated", [{ id: "Z3RkxXwZjdg" }]);
addVideos("first-broadcast-2", [{ id: "IswxCvxL8vE" }]);
addVideos("first-pitch", [{ id: "HBUYyaUlB6I" }]);
addVideos("lollapalooza", [{ id: "1SwE1veFLCQ" }]);
addVideos("band-aid-release", [{ id: "6KksgSzEZvQ" }]);
addVideos("cheobulno-release", [{ id: "eebhl4lGv_Y" }]);
addVideos("first-broadcast-3", [{ id: "QnC5-YjjsbA" }]);
addVideos("first-win-3", [{ id: "e7SrYHBt6jY" }]);
addVideos("donghyeon-graduation", [{ id: "oPV9jwXq_tU" }]);
addVideos("first-ost", [{ id: "KA0IZaoR8EA" }]);
addVideos("debut-anniversary", [{ id: "FJItpgIZEL4" }]);
addVideos("kyehoon-mc", [{ id: "tLlfw5Da9L0" }]);
addVideos("twenty-release", [{ id: "Gt0wRAFpwvg" }]);
addVideos("twenty-broadcast", [{ id: "FlVFTDFY3rk" }]);
addVideos("eyepoppin-release", [{ id: "i5S7DBQnqP0" }]);
addVideos("eyepoppin-broadcast", [{ id: "uUzq2hlSwaA" }]);
addVideos("donghyeon-breathe", [{ id: "AIR_6Wz9lIA" }]);
addVideos("incomplete-release", [{ id: "3bLurEgiD0c" }]);
addVideos("kickoff-release", [{ id: "0aITySxhz9g" }]);
addVideos("incomplete-broadcast", [{ id: "GFUtARl3VEw" }]);
addVideos("kickoff-broadcast", [{ id: "uE3Xj8ykDFE" }]);
addVideos("hate-blueberry", [{ id: "OFFhkIUf6gc" }]);
addVideos("mcountdown-first-win", [{ id: "WwhwGADJtmk" }]);
