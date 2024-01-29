import { getColor } from "@/script/utils/dom";
import * as color from "@thi.ng/color";
import { BoidSystem, SETTING } from "./boid";
export default function execute() {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let system: BoidSystem;
  const getBackground = () => getColor("--md-sys-color-surface", "#000");
  const getForeground = () => {
    const c = color.srgb(getColor("--md-sys-color-on-surface-variant", "#FFF"));
    c.alpha =
      Number.parseInt(
        getComputedStyle(document.body).getPropertyValue(
          "--state-opacity-hover",
        ),
      ) / 100;
    return color.css(c);
  };
  const getLightness = () => 0.75;
  const saturation = 0.125;
  const time_scale = 1;
  let isActive = false;
  let pretime = 0;
  const scale = 0.5;

  function setup() {
    if (!canvas) return;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    system.wall.right = canvas.width / scale;
    system.wall.bottom = canvas.height / scale;
  }

  function draw(time: number) {
    if (!isActive) return;
    if (pretime) {
      const deltaTime = (time - pretime) * time_scale;
      system.update(Math.min(deltaTime, 500), 1);
      // const subdivide = Math.ceil(deltaTime / 500);
      // system.update(deltaTime, subdivide);
    }
    pretime = time;
    ctx.lineWidth = 0;
    ctx.fillStyle = getBackground();
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    system.data().forEach(({ p, d }) => {
      ctx.fillStyle = getForeground();
      ctx.beginPath();
      ctx.arc(
        p.x * scale,
        p.y * scale,
        (SETTING.separationRange * scale) / 2,
        0,
        2 * Math.PI,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(p.x * scale, p.y * scale);
      ctx.arc(
        p.x * scale,
        p.y * scale,
        (SETTING.visualRange * scale) / 2,
        Math.atan2(d.y, d.x) - SETTING.visualAngle / 2,
        Math.atan2(d.y, d.x) + SETTING.visualAngle / 2,
      );
      ctx.lineTo(p.x * scale, p.y * scale);
      ctx.fill();
    });
    system.data().forEach(({ c, p }) => {
      ctx.fillStyle = color.css(
        color.oklch([getLightness(), saturation, c / 360]),
      );
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, 3, 0, 2 * Math.PI);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  return {
    start: (sketch: HTMLCanvasElement) => {
      canvas = sketch;
      ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
      system = new BoidSystem(canvas.width / scale, canvas.height / scale, 256);
      setup();
      isActive = true;
      requestAnimationFrame(draw);
    },
    stop: () => {
      isActive = false;
      // system = ctx = canvas = null;
    },
  };
}
