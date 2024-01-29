import { getColor } from "@/script/utils/dom";
import { IPalette, drawDungeon, generateDungeon } from "./generator";
export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let gen: ReturnType<typeof generateDungeon>;
  const getPalette: () => IPalette = () => ({
    background: getColor("--md-sys-color-surface-container", "#1C0B40"),
    border: getColor("--md-sys-color-outline", "#0F71F2"),
    room: getColor("--md-sys-color-primary-container", "#142273"),
    path: getColor("--md-sys-color-on-primary-container", "#0F9BF2"),
    door: getColor("--md-sys-color-primary", "#F222A9"),
    search_path: getColor("--md-sys-color-secondary", "#F222A9"),
    search_curr: getColor("--md-sys-color-on-secondary", "#F222A9"),
    invalid: getColor("--md-sys-color-on-error", "#F222A9"),
    node: getColor("--md-sys-color-on-tertiary", "#F222A9"),
    edge: getColor("--md-sys-color-on-tertiary", "#F222A9"),
  });
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
    drawDungeon(value, ctx, unit, getPalette());
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
