import { getColor } from "@/script/utils/dom";
import {
  filterConnectivity,
  gaussianBlur,
  getGradient,
  getLuminance,
  getMaximumMask,
  getOutlierMask,
  visualizeGradient,
} from "./pipeline";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const background = () => getColor("--md-sys-color-surface", "#000");
  let isActive = false;

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = background().formatHex8();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function redraw(img: HTMLImageElement) {
    if (!isActive) return;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    getLuminance(imageData);
    gaussianBlur(imageData, 3);
    getGradient(imageData);
    {
      const mask = new Array<boolean>(imageData.width * imageData.height).fill(
        true,
      );
      // Double thresholding
      getOutlierMask(imageData, 2, 3).forEach((v, i) => (mask[i] &&= v));
      // Non-maximum suppression
      getMaximumMask(imageData, mask, 0, 1, 2);
      // Connectivity
      for (let _ = 0; _ < 20; _++) {
        const changed =
          filterConnectivity(imageData, mask, 1, 0, 6) ||
          filterConnectivity(imageData, mask, 2, 1);
        if (!changed) break;
      }
      // Double thresholding
      getOutlierMask(imageData, 2, 1.5).forEach((v, i) => (mask[i] &&= v));
      for (let y = 0; y < imageData.height; y++) {
        for (let x = 0; x < imageData.width; x++) {
          const index = (y * imageData.width + x) * 4;
          imageData.data[index + 3] = mask[y * imageData.width + x] ? 255 : 0;
        }
      }
    }
    visualizeGradient(imageData);
    ctx.putImageData(imageData, 0, 0);
  }

  return {
    start: (sketch: HTMLCanvasElement, config: HTMLFormElement) => {
      canvas = sketch;
      ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
      config
        .querySelector<HTMLInputElement>("#image")!
        .addEventListener("change", function () {
          const img = new Image();
          img.addEventListener("load", function onImageLoad() {
            this.removeEventListener("load", onImageLoad);
            redraw(img);
          });
          img.src = URL.createObjectURL(this.files![0]);
        });
      setup();
      isActive = true;
    },
    stop: () => {
      isActive = false;
    },
  };
}
