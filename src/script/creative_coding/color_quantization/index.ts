import { dither } from "@/script/creative_coding/dithering/pipeline";
import { getColor } from "@/script/utils/dom";
import { getPalette } from "./pipeline";

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

  function redraw(img: HTMLImageElement) {
    if (!isActive) return;
    const offscreen = new OffscreenCanvas(50, 50);
    const offscreenCtx = offscreen.getContext("2d", {
      alpha: false,
      desynchronized: true,
    })!;
    offscreenCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height);
    const palette = getPalette(
      offscreenCtx.getImageData(0, 0, offscreen.width, offscreen.height),
    );
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    dither(imageData, palette);
    console.log(palette);
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
