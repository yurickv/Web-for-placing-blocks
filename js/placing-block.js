function efficientBlockPlacement(blockParams, containerSize) {
  const blockCoordinates = [];
  const colorMap = {};

  blockParams.forEach((block, index) => {
    block.initialOrder = index + 1;
    block.square = block.width * block.height;
  });

  // Sort blocks based on a combination of factors for better fitting
  blockParams.sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const aspectRatioA = a.width / a.height;
    const aspectRatioB = b.width / b.height;

    // Prioritize blocks with larger area and closer aspect ratio to container
    return (
      areaB - areaA ||
      Math.abs(aspectRatioB - containerAspectRatio) -
        Math.abs(aspectRatioA - containerAspectRatio)
    );
  });

  let remainingSpace = containerSize.width * containerSize.height;
  let fullness = 0;
  let totalBlockSquare = 0;
  for (const block of blockParams) {
    let bestFit = null;
    totalBlockSquare += block.square;
    for (let rotate = 0; rotate < 2; rotate++) {
      const [width, height] = rotate
        ? [block.height, block.width]
        : [block.width, block.height];

      for (let x = 0; x <= containerSize.width - width; x++) {
        for (let y = 0; y <= containerSize.height - height; y++) {
          const overlapping = blockCoordinates.some(
            (coord) =>
              !(
                x + width <= coord.left ||
                x >= coord.right ||
                y + height <= coord.top ||
                y >= coord.bottom
              )
          );

          if (!overlapping) {
            const area = width * height;

            // Break early if an optimal fit cannot be found
            if (!bestFit || area > bestFit.area) {
              bestFit = { x, y, width, height, area, rotate };
            }
          }
        }
      }
    }

    if (bestFit) {
      const matchingColor = colorMap[`${block.width}-${block.height}`];
      const color = matchingColor || getRandomHexColor();

      if (!matchingColor) {
        colorMap[`${block.width}-${block.height}`] = color;
      }

      blockCoordinates.push({
        top: bestFit.y,
        left: bestFit.x,
        right: bestFit.x + bestFit.width,
        bottom: bestFit.y + bestFit.height,
        initialOrder: block.initialOrder,
        width: bestFit.width,
        height: bestFit.height,
        color: color,
      });

      remainingSpace -= bestFit.area;
    }
  }

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

    // Check if the cavity is fully surrounded by blocks
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

    return null; // Cavity is not fully surrounded by blocks
  }

  console.log(totalBlockSquare);
  console.log(totalCavityArea);

  fullness = 1 - totalCavityArea / (totalCavityArea + totalBlockSquare);

  return { fullness, blockCoordinates };
}

//_______________________________________________________________
function getRandomHexColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, 0)}`;
}

let blocks = [
  { width: 150, height: 90 },
  { width: 60, height: 145 },
  { width: 140, height: 135 },
  { width: 250, height: 30 },
  { width: 100, height: 100 },
  { width: 60, height: 145 },
];

let container = {
  width: 0,
  height: 300,
};
const width = document.documentElement.clientWidth;
container.width = width - 40;
const containerAspectRatio = container.width / container.height;

let result = efficientBlockPlacement(blocks, container);
console.log(result);

//___________________________________
const listImgEl = document.querySelector(".container");

listImgEl.style.width = `${container.width}px`;
listImgEl.style.height = `${container.height}px`;
const imgCreateEl = createBoxWithBoxes();

function createBoxWithBoxes() {
  return result.blockCoordinates
    .map(({ width, height, top, bottom, right, left, initialOrder, color }) => {
      return `<div class="box" style="width:${width}px; height: ${height}px; border: 1px black solid; 
      top: ${top}px; bottom: ${bottom}px; right: ${right}px; left:${left}px; background-color:${color}"><p>${initialOrder}</p> </div>`;
    })
    .join("");
}

listImgEl.insertAdjacentHTML("beforeend", imgCreateEl);
