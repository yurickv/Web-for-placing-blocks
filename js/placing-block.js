function efficientBlockPlacement(blockParams, containerSize) {
  // Сортуємо блоки за зменшенням максимального розміру (ширина або висота)
  const blockCoordinates = [];
  const colorMap = {};
  for (const block of blockParams) {
    block.initialOrder = blockParams.indexOf(block) + 1;
  }

  blockParams.sort(
    (a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height)
  );

  let remainingSpace = containerSize.width * containerSize.height;
  let fullness = 0;

  for (const block of blockParams) {
    let bestFit = null;

    // Перевіряємо можливості розміщення блока та його повертання
    for (let rotate = 0; rotate < 2; rotate++) {
      const [width, height] = rotate
        ? [block.height, block.width]
        : [block.width, block.height];

      for (let x = 0; x <= containerSize.width - width; x++) {
        for (let y = 0; y <= containerSize.height - height; y++) {
          // Перевірка чи блок не перекривається з іншими блоками
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

    // Якщо знайдено місце для блока, додаємо його координати та зменшуємо залишений простір
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
        width: block.width,
        height: block.height,
        color: color,
      });
      remainingSpace -= bestFit.area;
    }
  }

  // Розрахунок коефіцієнта корисного використання простору
  fullness = 1 - remainingSpace / (containerSize.width * containerSize.height);

  return { fullness, blockCoordinates };
}
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

let result = efficientBlockPlacement(blocks, container);
console.log(result);

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
