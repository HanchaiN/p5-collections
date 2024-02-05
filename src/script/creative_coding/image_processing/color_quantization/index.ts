import { applyDithering } from "@/script/creative_coding/image_processing/dithering/pipeline";
import { getColor, onImageChange } from "@/script/utils/dom";
import * as color from "@thi.ng/color";
import { getPalette_Generator } from "./pipeline";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const getBackground = () => getColor("--md-sys-color-surface", "#000");
  let isActive = false;
  let palette_generator: Generator<
    [color.Oklab[], number],
    never,
    number | void
  > | null = null;
  let image: HTMLImageElement;
  let form: HTMLFormElement;
  let n_colors: number;

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function onClick() {
    if (!isActive || !image || !palette_generator) return;
    const [palette, score] = palette_generator.next(n_colors).value;
    form.querySelector<HTMLInputElement>("#palette-count")!.value =
      palette.length.toString();
    form.querySelector<HTMLInputElement>("#palette-score")!.value =
      score.toString();
    console.log(
      palette.map((c) => color.css(color.srgb(c))),
      score,
    );
    requestAnimationFrame(() => {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyDithering(
        imageData,
        palette.map((c) => color.srgb(c).xyz),
      );
      ctx.putImageData(imageData, 0, 0);
      n_colors = palette.length * 2;
      if (n_colors > 256) n_colors = 2;
    });
  }

  function redraw(img: HTMLImageElement) {
    if (!isActive) return;
    image = img;
    requestAnimationFrame(() => {
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    });
    const offscreen = new OffscreenCanvas(100, 100);
    const offscreenCtx = offscreen.getContext("2d", { alpha: false })!;
    offscreenCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    palette_generator = getPalette_Generator(
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
