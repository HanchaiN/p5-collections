import { getColor, onImageChange } from "@/script/utils/dom";
import { flavors } from "@catppuccin/palette";
import * as color from "@thi.ng/color";
import { dither } from "./pipeline";

export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  const getBackground = () => getColor("--md-sys-color-surface", "#000");
  let isActive = false;
  const palette = [
    getColor("--cpt-rosewater", flavors["mocha"].colors.rosewater.hex),
    getColor("--cpt-flamingo", flavors["mocha"].colors.flamingo.hex),
    getColor("--cpt-pink", flavors["mocha"].colors.pink.hex),
    getColor("--cpt-mauve", flavors["mocha"].colors.mauve.hex),
    getColor("--cpt-red", flavors["mocha"].colors.red.hex),
    getColor("--cpt-maroon", flavors["mocha"].colors.maroon.hex),
    getColor("--cpt-peach", flavors["mocha"].colors.peach.hex),
    getColor("--cpt-yellow", flavors["mocha"].colors.yellow.hex),
    getColor("--cpt-green", flavors["mocha"].colors.green.hex),
    getColor("--cpt-teal", flavors["mocha"].colors.teal.hex),
    getColor("--cpt-sky", flavors["mocha"].colors.sky.hex),
    getColor("--cpt-sapphire", flavors["mocha"].colors.sapphire.hex),
    getColor("--cpt-blue", flavors["mocha"].colors.blue.hex),
    getColor("--cpt-lavender", flavors["mocha"].colors.lavender.hex),
    getColor("--cpt-text", flavors["mocha"].colors.text.hex),
    getColor("--cpt-base", flavors["mocha"].colors.base.hex),
    getColor("--cpt-crust", flavors["mocha"].colors.crust.hex),
    getColor("--cpt-mantle", flavors["mocha"].colors.mantle.hex),
  ].map((v) => {
    return color.srgb(color.css(v)).xyz;
  });

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function redraw(img: HTMLImageElement) {
    if (!isActive) return;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    dither(imageData, palette);
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
