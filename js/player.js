// ===== 플레이어 =====
// 좌우 이동, 바라보는 방향, 걷기 애니메이션, 맵 경계 제한을 담당한다.
// 현재는 단색 사람 모양이며, AVATAR(assets.js)에 이미지 경로를 넣으면 이미지로 교체된다.

const Player = (() => {
  const SPEED = 230;      // 초당 이동 픽셀
  const EDGE_MARGIN = 24; // 맵 가장자리 여유

  function create(x) {
    return { x: x, dir: 1, moving: false, walkTime: 0 };
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

  // 화면에 그리기. screenX는 카메라를 반영한 화면 좌표, groundY는 바닥선 높이
  function draw(ctx, player, screenX, groundY) {
    const w = AVATAR.width;
    const h = AVATAR.height;

    ctx.save();
    ctx.translate(Math.round(screenX), groundY);
    ctx.scale(player.dir, 1);   // 왼쪽을 볼 때는 좌우 반전

    // 이미지가 있으면 이미지로 그린다 (대기 / 걷기 프레임)
    let img = null;
    if (player.moving && AVATAR.walk.length > 0) {
      const frame = Math.floor(player.walkTime * 8) % AVATAR.walk.length;
      img = Assets.get(AVATAR.walk[frame]);
    } else if (AVATAR.idle) {
      img = Assets.get(AVATAR.idle);
    }
    if (img) {
      Assets.drawFit(ctx, img, -w / 2, -h, w, h);
      ctx.restore();
      return;
    }

    // ---- 임시 도형 아바타 ----
    const swing = player.moving ? Math.sin(player.walkTime * 14) : 0;
    const bob = player.moving ? Math.abs(Math.sin(player.walkTime * 14)) * 2 : 0;

    // 다리 (걸을 때 번갈아 움직임)
    ctx.fillStyle = "#3b3b4f";
    ctx.fillRect(-8 + swing * 5, -16 + 0, 7, 16);
    ctx.fillRect(1 - swing * 5, -16 + 0, 7, 16);
    // 몸통
    ctx.fillStyle = AVATAR.color;
    ctx.fillRect(-w / 2, -h + 18 - bob, w, 24);
    // 팔
    ctx.fillStyle = "#c9483a";
    ctx.fillRect(-w / 2 - 4, -h + 20 - bob + swing * 2, 5, 18);
    ctx.fillRect(w / 2 - 1, -h + 20 - bob - swing * 2, 5, 18);
    // 머리
    ctx.fillStyle = "#f2c9a0";
    ctx.fillRect(-9, -h - bob, 18, 18);
    // 눈 (바라보는 방향 표시)
    ctx.fillStyle = "#222";
    ctx.fillRect(2, -h + 6 - bob, 3, 3);

    ctx.restore();
  }

  return { create, update, draw };
})();
