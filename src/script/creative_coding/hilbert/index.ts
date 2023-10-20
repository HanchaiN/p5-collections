import { cubehelix2rgb, rgb2srgb } from "@/script/utils/color";
import { getColor, getMousePos, kernelGenerator } from "@/script/utils/dom";
import { lerp } from "@/script/utils/math";
import type { IKernelFunctionThis } from "@/script/utils/types";
import { rot_hilbert as rot, xy2d } from "./hilbert";

export default function execute() {
  let audioContext: AudioContext, gainNode: GainNode, oscl: OscillatorNode;
  let isActive: boolean = false;
  const iter = 512;

  interface IConstants {
    s: number;
    l: number;
  }

  function main(this: IKernelFunctionThis<IConstants>, n: number) {
    const d = xy2d(n, this.thread.x, this.thread.y, rot);
    const v = (1.0 * d) / (n * n);
    const c = rgb2srgb(
      cubehelix2rgb([
        v,
        this.constants.s as number,
        this.constants.l as number,
      ]),
    );
    this.color(c[0], c[1], c[2], 1);
  }

  return {
    start: (canvas: HTMLCanvasElement) => {
      isActive = true;
      const n = Math.pow(
        2,
        Math.ceil(Math.log2(Math.max(canvas.width, canvas.height))),
      );
      const ctx = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      })!;
      canvas.width = n;
      canvas.height = n;
      ctx.fillStyle = getColor("--md-sys-color-surface", "#000").formatHex8();
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const buffer = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const renderer = kernelGenerator(
        main,
        {
          s:
            (2 *
              Number.parseInt(
                getComputedStyle(document.body).getPropertyValue(
                  "--chroma-neutral",
                ),
              )) /
            100,
          l:
            Number.parseInt(
              getComputedStyle(document.body).getPropertyValue(
                "--tone-outline",
              ),
            ) / 100,
        },
        buffer,
      );
      const step = renderer(n);
      requestAnimationFrame(function draw() {
        if (!isActive) return;
        let done = false;
        for (let _ = 0; _ < iter; _++) {
          const res = step.next();
          if (res.done) {
            done = true;
            break;
          }
        }
        createImageBitmap(buffer).then((bmp) =>
          ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height),
        );
        if (!done) requestAnimationFrame(draw);
      });
      canvas.addEventListener("mousedown", (e) => {
        if (typeof audioContext === "undefined") {
          audioContext = new AudioContext();
          gainNode = new GainNode(audioContext);
          oscl = new OscillatorNode(audioContext, {
            type: "sine",
          });
          gainNode.gain.value = 0;
          gainNode.connect(audioContext.destination);
          oscl.connect(gainNode);
          oscl.start();
        }
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        function onMouseMove(e: MouseEvent) {
          const { x, y } = getMousePos(canvas, e);
          const v = xy2d(n, x, canvas.height - y, rot) / (n * n);
          oscl.frequency.value = Math.exp(lerp(v, Math.log(85), Math.log(255)));
        }
        function onMouseLeave() {
          canvas.removeEventListener("mousemove", onMouseMove);
          canvas.removeEventListener("mouseup", onMouseLeave);
          canvas.removeEventListener("mouseleave", onMouseLeave);
          gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.1);
        }
        onMouseMove(e);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseup", onMouseLeave);
        canvas.addEventListener("mouseleave", onMouseLeave);
      });
    },
    stop: () => {
      isActive = false;
    },
  };
}
