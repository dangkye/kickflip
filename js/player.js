// ===== 플레이어 =====
// 좌우 이동, 바라보는 방향, 걷기 애니메이션, 맵 경계 제한을 담당한다.
// 모양은 선택한 착장(avatars-data.js의 OUTFITS 항목)에서 온다.
//   착장 필드: color(상의) / pants(하의) / accent(머리) / idle / walk[] / width / height
// 이미지가 없으면 단색 사람 모양으로 그린다.

const Player = (() => {
  const SPEED = 230;      // 초당 이동 픽셀
  const EDGE_MARGIN = 24; // 맵 가장자리 여유

  function create(x, outfit) {
    return { x: x, dir: 1, moving: false, walkTime: 0, outfit: outfit || null };
  }

  // input: { left: bool, right: bool }
  function update(player, input, dt, mapWidth) {
    let move = 0;
    if (input.left) move -= 1;
    if (input.right) move += 1;

    player.moving = move !== 0;
    if (player.moving) {
      player.dir = move;                       // 이동 방향에 따라 바라보는 방향이 바뀐다
      player.x += move * SPEED * dt;
      player.walkTime += dt;
    } else {
      player.walkTime = 0;
    }
    // 맵 경계를 벗어나지 않게 제한
    player.x = Math.max(EDGE_MARGIN, Math.min(mapWidth - EDGE_MARGIN, player.x));
  }

  // 발 위치를 (0,0)으로 해서 사람을 그린다.
  // 이미지가 있으면 이미지(걷기 프레임이 없으면 idle 그대로), 없으면 단색 사람 모양.
  // pose = { moving, walkTime }
  function drawFigure(ctx, outfit, pose) {
    const o = outfit || {};
    const moving = !!(pose && pose.moving);
    const walkTime = (pose && pose.walkTime) || 0;
    const w = o.width || AVATAR.width;
    const h = o.height || AVATAR.height;

    let img = null;
    if (moving && o.walk && o.walk.length > 0) {
      img = Assets.get(o.walk[Math.floor(walkTime * 8) % o.walk.length]);
    }
    if (!img && o.idle) img = Assets.get(o.idle);
    if (!img && !o.idle && !(o.walk && o.walk.length)) img = Assets.get(AVATAR.idle);
    if (img) {
      Assets.drawFit(ctx, img, -w / 2, -h, w, h);   // 원본 비율 유지, 발 기준 정렬
      return;
    }

    // ---- 임시 도형 아바타 ----
    const shirt = o.color || AVATAR.color;
    const pants = o.pants || "#3b3b4f";
    const hair = o.accent || "#2b2b2b";
    const bw = AVATAR.width, bh = AVATAR.height;
    const swing = moving ? Math.sin(walkTime * 14) : 0;
    const bob = moving ? Math.abs(Math.sin(walkTime * 14)) * 2 : 0;

    // 다리 (걸을 때 번갈아 움직임)
    ctx.fillStyle = pants;
    ctx.fillRect(-8 + swing * 5, -16, 7, 16);
    ctx.fillRect(1 - swing * 5, -16, 7, 16);
    // 몸통
    ctx.fillStyle = shirt;
    ctx.fillRect(-bw / 2, -bh + 18 - bob, bw, 24);
    // 팔 (몸통보다 조금 어둡게)
    ctx.fillRect(-bw / 2 - 4, -bh + 20 - bob + swing * 2, 5, 18);
    ctx.fillRect(bw / 2 - 1, -bh + 20 - bob - swing * 2, 5, 18);
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.fillRect(-bw / 2 - 4, -bh + 20 - bob + swing * 2, 5, 18);
    ctx.fillRect(bw / 2 - 1, -bh + 20 - bob - swing * 2, 5, 18);
    // 머리
    ctx.fillStyle = "#f2c9a0";
    ctx.fillRect(-9, -bh - bob, 18, 18);
    // 머리카락
    ctx.fillStyle = hair;
    ctx.fillRect(-9, -bh - bob, 18, 6);
    // 눈 (바라보는 방향 표시)
    ctx.fillStyle = "#222";
    ctx.fillRect(2, -bh + 8 - bob, 3, 3);
  }

  // 화면에 그리기. screenX는 카메라를 반영한 화면 좌표, groundY는 바닥선 높이
  function draw(ctx, player, screenX, groundY) {
    ctx.save();
    ctx.translate(Math.round(screenX), groundY);
    ctx.scale(player.dir, 1);   // 왼쪽을 볼 때는 좌우 반전
    drawFigure(ctx, player.outfit, { moving: player.moving, walkTime: player.walkTime });
    ctx.restore();
  }

  return { create, update, draw, drawFigure };
})();
