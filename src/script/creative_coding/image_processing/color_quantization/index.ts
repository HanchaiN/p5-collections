import { applyDithering } from "@/script/creative_coding/image_processing/dithering/pipeline";
import { getColor, onImageChange } from "@/script/utils/dom";
import { sample, softargmax } from "@/script/utils/math";
import * as color from "@thi.ng/color";
import { getSilhouetteScore } from "./kmeans";
import { getPalette, applyQuantization } from "./pipeline";
import { potrace, init } from "esm-potrace-wasm";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let svgCanvas: SVGSVGElement;
  const getBackground = () => getColor("--md-sys-color-surface", "#000");
  let isInitialized = false;
  let isActive = false;
  let isAuto = 0;
  let image: HTMLImageElement;
  let form: HTMLFormElement;
  let cache: { [n: number]: color.XYZD65[] } = {};
  let n_colors: number = 0;
  const max_iter = 1000;
  let scale = 1;

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    init().then(() => {
      isInitialized = true;
    });
  }

  function onClick() {
    if (!isActive || !image) return;
    scale = parseInt(
      form.querySelector<HTMLInputElement>("#sample-scale")!.value,
    );
    n_colors = parseInt(
      form.querySelector<HTMLInputElement>("#palette-count")!.value,
    );
    if (n_colors <= 0) {
      n_colors = 0;
      redraw();
      return;
    }
    const closestKey = Object.keys(cache)
      .map((n) => parseInt(n.toString()))
      .reduce(
        (a, b) => (Math.abs(b - n_colors) < Math.abs(a - n_colors) ? b : a),
        0,
      );
    const closestPalette = cache[closestKey] ?? [];

    const offscreen = new OffscreenCanvas(
      canvas.width / scale,
      canvas.height / scale,
    );
    const offscreenCtx = offscreen.getContext("2d", { alpha: false })!;
    offscreenCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    const buffer = offscreenCtx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height,
    );

    cache[n_colors] = getPalette(
      buffer,
      n_colors,
      false,
      max_iter,
      Infinity,
      closestPalette,
    );
    redraw();
  }

  function clear(img: HTMLImageElement) {
    if (!isActive) return;
    image = img;
    cache = {};
    redraw(true);
  }

  function redraw(raw = false) {
    if (!isActive || !image) return;
    scale = parseInt(
      form.querySelector<HTMLInputElement>("#sample-scale")!.value,
    );
    const offscreen = new OffscreenCanvas(
      canvas.width / scale,
      canvas.height / scale,
    );
    const offscreenCtx = offscreen.getContext("2d", { alpha: false })!;
    offscreenCtx.drawImage(image, 0, 0, offscreen.width, offscreen.height);
    const buffer = offscreenCtx.getImageData(
      0,
      0,
      offscreen.width,
      offscreen.height,
    );
    if (n_colors <= 0 || raw) {
      requestAnimationFrame(() => {
        offscreen.convertToBlob().then((blob) => {
          svgCanvas.innerHTML = `<image href="${URL.createObjectURL(blob)}" width=${svgCanvas.getAttribute("width")} height=${svgCanvas.getAttribute("height")}></image>`;
        });
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      });
      return;
    }
    if (!cache[n_colors]) {
      onClick();
      return;
    }
    const samples = new Array(buffer.width * buffer.height)
      .fill(0)
      .map((_, i) => {
        return color.xyzD65(
          color.srgb(
            buffer.data[i * 4 + 0] / 255,
            buffer.data[i * 4 + 1] / 255,
            buffer.data[i * 4 + 2] / 255,
          ),
        );
      });
    const dist = (a: color.XYZD65, b: color.XYZD65) => {
      return color.distEucledian3(a, b);
    };
    const palette = form.querySelector<HTMLInputElement>("#snap")!.checked
      ? cache[n_colors].map((c) =>
          sample(
            samples,
            softargmax(
              samples.map((sample) => -dist(c, sample)),
              1 / 100000,
            ),
          ),
        )
      : cache[n_colors];
    const score = getSilhouetteScore(samples, palette, dist);
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
      const isDithering =
        form.querySelector<HTMLInputElement>("#dither")!.checked;
      (isDithering ? applyDithering : applyQuantization)(
        imageData,
        palette.map((c) => color.srgb(c).xyz),
        isDithering ? 1 / 1000 : 0,
      );
      ctx.putImageData(imageData, 0, 0);
      (async function trace() {
        if (!isInitialized) return;
        const result = await potrace(imageData, {
          turdsize: 2, // suppress speckles
          turnpolicy: 4,
          alphamax: 1, // corner threshold
          opticurve: 1, // optimize curves
          opttolerance: 1, // optimization tolerance
          pathonly: false,
          extractcolors: true,
          posterizelevel: 128, // [1, 255]
          posterizationalgorithm: 0, // 0: simple, 1: interpolation
        });
        const svg_ = new DOMParser().parseFromString(result, "image/svg+xml")
          .documentElement as unknown as SVGSVGElement;
        svgCanvas.parentNode!.replaceChild(svg_, svgCanvas);
        svg_.setAttribute(
          "width",
          svgCanvas.getAttribute("width") ?? canvas.width.toString(),
        );
        svg_.setAttribute(
          "height",
          svgCanvas.getAttribute("height") ?? canvas.height.toString(),
        );
        svg_.setAttribute(
          "class",
          svgCanvas.getAttribute("class") ?? canvas.className,
        );
        svgCanvas = svg_;
      })();
    });
  }

  return {
    start: (
      sketch: HTMLCanvasElement,
      svg: SVGSVGElement,
      config: HTMLFormElement,
    ) => {
      canvas = sketch;
      svgCanvas = svg;
      form = config;
      ctx = canvas.getContext("2d", {
        alpha: false,
        willReadFrequently: true,
      })!;
      setup();
      onImageChange(form.querySelector<HTMLInputElement>("#image")!, clear);
      form
        .querySelector<HTMLButtonElement>("#apply")!
        .addEventListener("click", () => onClick());
      form
        .querySelector<HTMLButtonElement>("#redraw")!
        .addEventListener("click", () => redraw());
      form
        .querySelector<HTMLButtonElement>("#autorun")!
        .addEventListener("click", async () => {
          if (isAuto !== 0) {
            isAuto = 0;
            return;
          }
          isAuto++;
          n_colors = 0;
          form.querySelector<HTMLInputElement>("#palette-count")!.disabled =
            true;
          clear(image);
          while (isAuto === 1) {
            console.log(n_colors);
            form.querySelector<HTMLInputElement>("#palette-count")!.value =
              n_colors.toString();
            onClick();
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await new Promise((resolve) => requestAnimationFrame(resolve));
            n_colors++;
          }
          form.querySelector<HTMLInputElement>("#palette-count")!.disabled =
            false;
          isAuto--;
        });
      isActive = true;
    },
    stop: () => {
      isActive = false;
    },
  };
}
