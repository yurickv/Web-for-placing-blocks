export function findingCavitys(containerSize, blockCoordinates) {
  //   Пошук порожнин
  const cavities = [];
  const visited = new Array(containerSize.width)
    .fill(false)
    .map(() => new Array(containerSize.height).fill(false));

  for (let x = 0; x < containerSize.width; x++) {
    for (let y = 0; y < containerSize.height; y++) {
      if (!visited[x][y] && !isCovered(x, y, blockCoordinates)) {
        const cavity = findCavity(x, y, visited, blockCoordinates);
        if (cavity) {
          cavities.push(cavity);
        }
      }
    }
  }
  let totalCavityArea = 0;

  for (const cavity of cavities) {
    const cavityArea =
      (cavity.right - cavity.left) * (cavity.bottom - cavity.top);
    totalCavityArea += cavityArea;
  }

  function isCovered(x, y, blockCoordinates) {
    return blockCoordinates.some(
      (coord) =>
        x >= coord.left && x < coord.right && y >= coord.top && y < coord.bottom
    );
  }

  function findCavity(x, y, visited, blockCoordinates) {
    const queue = [[x, y]];
    visited[x][y] = true;
    let left = x,
      right = x,
      top = y,
      bottom = y;

    while (queue.length > 0) {
      const [cx, cy] = queue.shift();

      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          if (dx !== 0 || dy !== 0) {
            const nx = cx + dx;
            const ny = cy + dy;

            if (
              nx >= 0 &&
              nx < visited.length &&
              ny >= 0 &&
              ny < visited[0].length &&
              !visited[nx][ny] &&
              !isCovered(nx, ny, blockCoordinates)
            ) {
              queue.push([nx, ny]);
              visited[nx][ny] = true;
              left = Math.min(left, nx);
              right = Math.max(right, nx);
              top = Math.min(top, ny);
              bottom = Math.max(bottom, ny);
            }
          }
        }
      }
    }

    // Перевірка чи порожнина повністю оточена блоками
    if (
      left > 0 &&
      right < visited.length - 1 &&
      top > 0 &&
      bottom < visited[0].length - 1
    ) {
      const surroundedByBlocks = [
        [left - 1, top - 1],
        [left - 1, bottom + 1],
        [right + 1, top - 1],
        [right + 1, bottom + 1],
      ].every(([cx, cy]) => isCovered(cx, cy, blockCoordinates));

      if (surroundedByBlocks) {
        return { left, right, top, bottom };
      }
    }

    return null;
  }
  return totalCavityArea;
}
