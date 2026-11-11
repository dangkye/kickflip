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
