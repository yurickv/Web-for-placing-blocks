import { getRandomHexColor } from "./paint-block.js";
import { findingCavitys } from "./finding-cavity.js";
const message = document.querySelector(".message");

export function efficientBlockPlacement(blockParams, containerSize) {
  const blockCoordinates = [];
  const colorMap = {};
  const containerAspectRatio = containerSize.width / containerSize.height;
  blockParams.forEach((block, index) => {
    block.initialOrder = index;
    block.square = block.width * block.height;
  });

  blockParams.sort((a, b) => {
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    const aspectRatioA = a.width / a.height;
    const aspectRatioB = b.width / b.height;

    return (
      areaB - areaA ||
      Math.abs(aspectRatioB - containerAspectRatio) -
        Math.abs(aspectRatioA - containerAspectRatio)
    );
  });

  let remainingSpace = containerSize.width * containerSize.height;
  let fullness = 0;
  let totalBlockSquare = 0;
  let allBlocksFit = true;
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
    if (!bestFit) {
      allBlocksFit = false;
      break;
    }
  }
  //   Пошук порожнин
  const totalCavityArea = findingCavitys(containerSize, blockCoordinates);

  console.log("Загальна площа блоків:", totalBlockSquare);
  console.log("Загальна площа порожнин:", totalCavityArea);
  allBlocksFit
    ? (message.textContent = "Всі блоки поміщаються в контейнер")
    : (message.textContent = "Не всі блоки поміщаються в контейнер");
  fullness = 1 - totalCavityArea / (totalCavityArea + totalBlockSquare);

  return { fullness, blockCoordinates };
}
