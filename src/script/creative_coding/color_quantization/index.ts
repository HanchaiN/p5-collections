import { dither } from "@/script/creative_coding/dithering/pipeline";
import { getColor, onImageChange } from "@/script/utils/dom";
import { getPalette } from "./pipeline";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const getBackground = () => getColor("--md-sys-color-surface", "#000");
  let isActive = false;
  let palette_id = -1;
  let palette: {
    n: number;
    score: number;
    centroids: [number, number, number][];
  }[] = [];
  let image: HTMLImageElement;
  let form: HTMLFormElement;

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function onClick() {
    if (!isActive) return;
    if (!image) return;
    palette_id = (palette_id + 1) % palette.length;
    form.querySelector<HTMLInputElement>("#palette-count")!.value =
      palette[palette_id].n.toString();
    form.querySelector<HTMLInputElement>("#palette-score")!.value =
      palette[palette_id].score.toString();
    requestAnimationFrame(() => {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      dither(imageData, palette[palette_id].centroids);
      ctx.putImageData(imageData, 0, 0);
    });
  }

  function redraw(img: HTMLImageElement) {
    if (!isActive) return;
    image = img;
    palette_id = -1;
    requestAnimationFrame(() => {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });
    const offscreen = new OffscreenCanvas(100, 100);
    const offscreenCtx = offscreen.getContext("2d", { alpha: false })!;
    offscreenCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    palette = getPalette(
      offscreenCtx.getImageData(0, 0, offscreen.width, offscreen.height),
      true,
    );
    canvas.dispatchEvent(new Event("click"));
  }

  return {
    start: (sketch: HTMLCanvasElement, config: HTMLFormElement) => {
      canvas = sketch;
      form = config;
      ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: true,
      })!;
      onImageChange(form.querySelector<HTMLInputElement>("#image")!, redraw);
      setup();
      canvas.addEventListener("click", onClick);
      isActive = true;
    },
    stop: () => {
      isActive = false;
    },
  };
}
