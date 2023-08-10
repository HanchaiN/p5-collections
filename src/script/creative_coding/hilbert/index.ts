import { cubehelix2rgb, rgb2srgb } from "@/script/utils/color";
import { getMousePos } from "@/script/utils/dom";
import { lerp } from "@/script/utils/math";
import GPU from "gpu.js";
import { xy2d } from "./hilbert";

export default function execute() {
  let gpu: GPU.GPU;
  let main_kernel: GPU.IKernelRunShortcut;
  let audioContext: AudioContext, gainNode: GainNode, oscl: OscillatorNode;

  interface IConstants extends GPU.IConstantsThis {
    h: number;
    l: number;
  }

  function main(this: GPU.IKernelFunctionThis<IConstants>, n: number) {
    const d = xy2d(n, this.thread.x, this.thread.y);
    const v = (1.0 * d) / Math.pow(n, 2);
    const c = rgb2srgb(
      cubehelix2rgb([
        v,
        this.constants.h as number,
        this.constants.l as number,
      ]),
    );
    this.color(c[0], c[1], c[2], 1);
  }

  return {
    start: (canvas: HTMLCanvasElement) => {
      const n = Math.pow(
        2,
        Math.ceil(Math.log2(Math.max(canvas.width, canvas.height))),
      );
      gpu = new GPU.GPU({ canvas });
      main_kernel = gpu
        .createKernel(main)
        .addFunction(xy2d, {
          argumentTypes: ["Integer", "Integer", "Integer"],
          returnType: "Integer",
        })
        .setArgumentTypes({
          n: "Integer",
        })
        .setConstants<IConstants>({
          h: 1.5,
          l:
            Number.parseInt(
              getComputedStyle(document.body).getPropertyValue("--tone-base"),
            ) / 100,
        })
        .setConstantTypes({
          h: "Float",
          l: "Float",
        })
        .setOutput([n, n])
        .setGraphical(true);
      cubehelix2rgb.add(main_kernel);
      rgb2srgb.add(main_kernel);
      main_kernel(n);
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
          const v = xy2d(n, x, canvas.height - y) / (n * n);
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
      main_kernel?.destroy();
      gpu?.destroy();
    },
  };
}
