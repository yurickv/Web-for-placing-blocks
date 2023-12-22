import data from "./block.json" assert { type: "json" };
import { efficientBlockPlacement } from "./placing-block.js";
export let container = {
  width: 500,
  height: 500,
};
const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;
container.width = width - 40;
container.height = height - 180;

let result = efficientBlockPlacement(data, container);
console.log(result);

//______________________________________
const listBoxEl = document.querySelector(".container");

listBoxEl.style.width = `${container.width}px`;
listBoxEl.style.height = `${container.height}px`;
const boxCreateEl = createBoxWithBoxes();

function createBoxWithBoxes() {
  return result.blockCoordinates
    .map(({ width, height, top, bottom, right, left, initialOrder, color }) => {
      return `<div class="box" style="width:${width}px; height: ${height}px; border: 1px black solid;
      top: ${top}px; bottom: ${bottom}px; right: ${right}px; left:${left}px; background-color:${color}"><p>${initialOrder}</p> </div>`;
    })
    .join("");
}

listBoxEl.insertAdjacentHTML("beforeend", boxCreateEl);

const fullnessRate = document.querySelector(".fullness");
fullnessRate.textContent = `fulness ${Math.floor(result.fullness * 100)}%`;

//___________________________________
