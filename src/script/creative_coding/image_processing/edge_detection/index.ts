import { getColor, onImageChange } from "@/script/utils/dom";
import { map } from "@/script/utils/math";
import * as color from "@thi.ng/color";
import { getEdgeMask } from "./pipeline";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const getBackground = () => getColor("--md-sys-color-surface", "#000");
  let isActive = false;

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawEdge(
    imageData: ImageData,
    dxIndex: number = 0,
    dyIndex: number = 1,
    magIndex: number = 2,
    maskIndex: number = 3,
  ) {
    const foreground = color.srgb(getColor("--md-sys-color-outline", "#FFF"));
    for (let y = 0; y < imageData.height; y++) {
      for (let x = 0; x < imageData.width; x++) {
        const index = (y * imageData.width + x) * 4;
        const dx = 2 * (imageData.data[index + dxIndex] - 128);
        const dy = 2 * (imageData.data[index + dyIndex] - 128);
        const mag = imageData.data[index + magIndex];
        const mask = imageData.data[index + maskIndex];
        const dir = map(Math.atan2(dy, dx), -Math.PI, +Math.PI, 0, 1);
        if (mask === 255) {
          imageData.data[index] = foreground.r * 255;
          imageData.data[index + 1] = foreground.g * 255;
          imageData.data[index + 2] = foreground.b * 255;
        } else {
          const [r, g, b] = color.srgb(color.oklch([mag / 255, 0.25, dir]));
          imageData.data[index] = 255 * r;
          imageData.data[index + 1] = 255 * g;
          imageData.data[index + 2] = 255 * b;
        }
        imageData.data[index + 3] = 255;
      }
    }
  }

  function redraw(img: HTMLImageElement) {
    if (!isActive) return;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    getEdgeMask(imageData);
    drawEdge(imageData);
    ctx.putImageData(imageData, 0, 0);
  }

  return {
    start: (sketch: HTMLCanvasElement, config: HTMLFormElement) => {
      canvas = sketch;
      ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
      onImageChange(config.querySelector<HTMLInputElement>("#image")!, redraw);
      setup();
      isActive = true;
    },
    stop: () => {
      isActive = false;
    },
  };
}
