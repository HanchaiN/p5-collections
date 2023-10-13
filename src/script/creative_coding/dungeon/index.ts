import { getColor } from "@/script/utils/dom";
import { drawDungeon, generateDungeon } from "./generator";
export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let gen: ReturnType<typeof generateDungeon>;
  const palette = [
    getColor("--md-sys-color-surface-container", "#1C0B40").formatHex8(),
    getColor("--md-sys-color-surface", "#142273").formatHex8(),
    getColor("--md-sys-color-outline", "#0F71F2").formatHex8(),
    getColor("--md-sys-color-on-surface", "#0F9BF2").formatHex8(),
    getColor("--md-sys-color-primary", "#F222A9").formatHex8(),
  ];
  const unit = { x: 5, y: 5 };
  let size = { x: 0, y: 0 };

  function generate_and_draw(grid_size: { x: number; y: number }) {
    gen?.return();
    gen = generateDungeon(grid_size);
  }

  function drawStep() {
    if (!canvas) return;
    const { value, done } = gen.next();
    if (done) return;
    setTimeout(() => requestAnimationFrame(drawStep), 0);
    drawDungeon(value, ctx, unit, palette);
  }
  function redraw() {
    generate_and_draw(size);
    requestAnimationFrame(drawStep);
  }
  function setup() {
    if (!canvas) return;
    size = {
      x: Math.ceil(canvas.width / unit.x),
      y: Math.ceil(canvas.height / unit.y),
    };
    redraw();
  }

  return {
    start: (sketch: HTMLCanvasElement) => {
      canvas = sketch;
      ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
      canvas.addEventListener("click", redraw);
      setup();
    },
    stop: () => {
      canvas?.remove();
      // canvas = ctx = null;
    },
  };
}
