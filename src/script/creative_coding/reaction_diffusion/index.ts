import { constrain } from "@/script/utils/math";
import GPU from "gpu.js";

export default function execute() {
  let gpu: GPU.GPU;
  let init_kernel: GPU.IKernelRunShortcut;
  let update_kernel: GPU.IKernelRunShortcut;
  let gpu_: GPU.GPU;
  let draw_kernel: GPU.IKernelRunShortcut;
  let isActive = false;
  const DIFFUSION_RATE = [1, 0.5];
  const ADDER = 0.0545;
  const REMOVER = 0.062;
  let grid: number[][][];

  interface IUpdateConstants {
    ADDER: number;
    REMOVER: number;
    DIFFUSION_RATE: number[];
  }

  function init(this: GPU.IKernelFunctionThis) {
    if (
      Math.pow(Math.abs(this.thread.x - this.output.x / 2), 2) +
        Math.pow(Math.abs(this.thread.y - this.output.y / 2), 2) <
      Math.pow(10, 2)
    )
      return [1, 1];
    return [1, 0];
  }
  function update(
    this: GPU.IKernelFunctionThis<IUpdateConstants>,
    grid: number[][][],
    dt: number,
  ) {
    const rxn =
      grid[this.thread.x][this.thread.y][0] *
      grid[this.thread.x][this.thread.y][1] *
      grid[this.thread.x][this.thread.y][1];
    const reaction = [
      -rxn +
        this.constants.ADDER * (1.0 - grid[this.thread.x][this.thread.y][0]),
      +rxn -
        (this.constants.ADDER + this.constants.REMOVER) *
          grid[this.thread.x][this.thread.y][1],
    ];
    const div_grad = [0, 0];
    if (
      this.thread.x != 0 &&
      this.thread.y != 0 &&
      this.thread.x + 1 != this.output.x &&
      this.thread.y + 1 != this.output.y
    ) {
      div_grad[0] +=
        grid[this.thread.x][this.thread.y][0] * -1.0 +
        grid[this.thread.x - 1][this.thread.y][0] * 0.2 +
        grid[this.thread.x + 1][this.thread.y][0] * 0.2 +
        grid[this.thread.x][this.thread.y - 1][0] * 0.2 +
        grid[this.thread.x][this.thread.y + 1][0] * 0.2 +
        grid[this.thread.x - 1][this.thread.y - 1][0] * 0.05 +
        grid[this.thread.x - 1][this.thread.y + 1][0] * 0.05 +
        grid[this.thread.x + 1][this.thread.y - 1][0] * 0.05 +
        grid[this.thread.x + 1][this.thread.y + 1][0] * 0.05;
      div_grad[1] +=
        grid[this.thread.x][this.thread.y][1] * -1.0 +
        grid[this.thread.x - 1][this.thread.y][1] * 0.2 +
        grid[this.thread.x + 1][this.thread.y][1] * 0.2 +
        grid[this.thread.x][this.thread.y - 1][1] * 0.2 +
        grid[this.thread.x][this.thread.y + 1][1] * 0.2 +
        grid[this.thread.x - 1][this.thread.y - 1][1] * 0.05 +
        grid[this.thread.x - 1][this.thread.y + 1][1] * 0.05 +
        grid[this.thread.x + 1][this.thread.y - 1][1] * 0.05 +
        grid[this.thread.x + 1][this.thread.y + 1][1] * 0.05;
    }
    const delta = [
      this.constants.DIFFUSION_RATE[0] * div_grad[0] + reaction[0],
      this.constants.DIFFUSION_RATE[1] * div_grad[1] + reaction[1],
    ];
    return [
      constrain(grid[this.thread.x][this.thread.y][0] + dt * delta[0], 0, 1),
      constrain(grid[this.thread.x][this.thread.y][1] + dt * delta[1], 0, 1),
    ];
  }
  function draw(this: GPU.IKernelFunctionThis, grid: number[][][]) {
    const v = constrain(
      grid[this.thread.x][this.thread.y][0] -
        grid[this.thread.x][this.thread.y][1],
      0,
      1,
    );
    this.color(v, v, v, 1);
  }

  return {
    start: (canvas: HTMLCanvasElement) => {
      isActive = true;
      gpu = new GPU.GPU({});
      gpu_ = new GPU.GPU({ canvas });
      init_kernel = gpu
        .createKernel(init as GPU.KernelFunction)
        .setOutput([canvas.width, canvas.height, 2]);
      update_kernel = gpu
        .createKernel(update as GPU.KernelFunction)
        .setArgumentTypes({
          grid: "Array",
          dt: "Float",
        })
        .setConstants<IUpdateConstants>({
          ADDER,
          REMOVER,
          DIFFUSION_RATE,
        })
        .setConstantTypes({
          ADDER: "Float",
          REMOVER: "Float",
          DIFFUSION_RATE: "Array(2)",
        })
        .setOutput([canvas.width, canvas.height, 2]);
      constrain.add(update_kernel);
      draw_kernel = gpu_
        .createKernel(draw)
        .setArgumentTypes({
          grid: "Array",
        })
        .setGraphical(true)
        .setOutput([canvas.width, canvas.height]);
      constrain.add(draw_kernel);
      grid = (init_kernel() as number[][][][])[0];
      requestAnimationFrame(function callback() {
        if (!isActive) return;
        grid = (update_kernel(grid, 1) as number[][][][])[0];
        draw_kernel(grid);
        requestAnimationFrame(callback);
      });
    },
    stop: () => {
      isActive = false;
      init_kernel?.destroy();
      update_kernel?.destroy();
      draw_kernel?.destroy();
      gpu?.destroy();
      gpu_?.destroy();
    },
  };
}
