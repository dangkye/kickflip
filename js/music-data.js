// ===== 음악 데이터 =====
// 유튜브 영상 ID와 곡 정보를 여기서 관리한다. (재생 기능은 이후 단계에서 music.js로 구현)
// youtubeId가 빈 문자열("")이면 아직 미설정 상태이며, 임의의 ID를 넣지 않는다.
// 곡을 바꾸거나 추가하려면 이 파일만 수정하면 된다.

const MUSIC = {
  // 메인 골목: 아래 순서대로 재생하고 마지막 곡 뒤에는 첫 곡으로 돌아간다.
  // 음원 전용 유튜브 링크의 ID를 직접 채워 넣을 것 (자료에 있던 링크는 영상 링크라 쓰지 않음)
  mainPlaylist: [
    { title: "내일에서 만나",            youtubeId: "" },
    { title: "how we kickflip",          youtubeId: "" },
    { title: "악몽을 꿨던 건 비밀이지만", youtubeId: "" },
    { title: "my direction",             youtubeId: "" },
    { title: "우리 같이 청춘을 낭비해",   youtubeId: "" }
  ],

  // 앨범 맵: 맵 진입 시 재생할 곡. 타이틀곡 링크는 사용자가 준 자료의 영상 링크 ID (음원 링크로 바꿔도 됨)
  // 팬콘은 곡을 정하지 않았으므로 비워 둔다.
  mapTracks: {
    album1: [{ title: "마마새드", youtubeId: "JY0UTOgh8M8" }],
    album2: [{ title: "프리즈",   youtubeId: "Z6fpV6V9y80" }],
    album3: [{ title: "처불노",   youtubeId: "eebhl4lGv_Y" }],
    fancon: [],
    album4: [{ title: "눈거싶",   youtubeId: "i5S7DBQnqP0" }],
    // 미니 5집은 구간별로 전환: 미완성 -> 킥옾더월 (maps.js의 팔레트 전환 시점과 연결)
    album5: [{ title: "미완성",   youtubeId: "3bLurEgiD0c", palette: "incomplete" },
             { title: "킥옾더월", youtubeId: "0aITySxhz9g", palette: "kickoff" }]
  }
};
