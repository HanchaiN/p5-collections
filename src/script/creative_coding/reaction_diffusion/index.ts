import { constrain } from "@/script/utils/math";
import GPU from "gpu.js";

export default function execute() {
  let gpu: GPU.GPU;
  let init_kernel: GPU.IKernelRunShortcut;
  let update_kernel: GPU.IKernelRunShortcut;
  let draw_kernel: GPU.IKernelRunShortcut;
  let isActive = false;
  const DIFFUSION_RATE = [1, 0.5];
  const ADDER = 0.0545;
  const REMOVER = 0.062;
  let grid: GPU.Texture;

  interface IUpdateConstants extends GPU.IConstantsThis {
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
    grid: [number, number][][],
    dt: number,
  ) {
    const v = grid[this.thread.y][this.thread.x];
    const rxn = v[0] * v[1] * v[1];
    const reaction = [
      -rxn + this.constants.ADDER * (1.0 - v[0]),
      +rxn - (this.constants.ADDER + this.constants.REMOVER) * v[1],
    ];
    const div_grad = [0, 0];
    if (
      this.thread.x != 0 &&
      this.thread.y != 0 &&
      this.thread.x + 1 != this.output.x &&
      this.thread.y + 1 != this.output.y
    ) {
      constrain(0, 0, dt); //TODO
      const cl = grid[this.thread.y][this.thread.x - 1];
      const cr = grid[this.thread.y][this.thread.x + 1];
      const uc = grid[this.thread.y - 1][this.thread.x];
      const dc = grid[this.thread.y + 1][this.thread.x];
      const ul = grid[this.thread.y - 1][this.thread.x - 1];
      const ur = grid[this.thread.y - 1][this.thread.x + 1];
      const dl = grid[this.thread.y + 1][this.thread.x - 1];
      const dr = grid[this.thread.y + 1][this.thread.x + 1];
      div_grad[0] +=
        v[0] * -1.0 +
        cl[0] * 0.2 +
        cr[0] * 0.2 +
        uc[0] * 0.2 +
        dc[0] * 0.2 +
        ul[0] * 0.05 +
        dl[0] * 0.05 +
        ur[0] * 0.05 +
        dr[0] * 0.05;
      div_grad[1] +=
        v[1] * -1.0 +
        cl[1] * 0.2 +
        cr[1] * 0.2 +
        uc[1] * 0.2 +
        dc[1] * 0.2 +
        ul[1] * 0.05 +
        dl[1] * 0.05 +
        ur[1] * 0.05 +
        dr[1] * 0.05;
    }
    const delta = [
      this.constants.DIFFUSION_RATE[0] * div_grad[0] + reaction[0],
      this.constants.DIFFUSION_RATE[1] * div_grad[1] + reaction[1],
    ];
    return [
      constrain(v[0] + dt * delta[0], 0, 1),
      constrain(v[1] + dt * delta[1], 0, 1),
    ];
  }
  function draw(this: GPU.IKernelFunctionThis, grid: [number, number][][]) {
    const v = grid[this.thread.y][this.thread.x];
    const c = constrain(v[0] - v[1], 0, 1);
    this.color(c, c, c, 1);
  }

  return {
    start: (canvas: HTMLCanvasElement) => {
      isActive = true;
      gpu = new GPU.GPU({});
      init_kernel = gpu
        .createKernel(init)
        .setPipeline(true)
        .setOutput([canvas.width, canvas.height, 2]);
      update_kernel = gpu
        .createKernel(update)
        // .setArgumentTypes({
        //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //   // @ts-ignore
        //   grid: "ArrayTexture(2)",
        //   dt: "Float",
        // })
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
        .setPipeline(true)
        .setImmutable(true)
        .setOutput([canvas.width, canvas.height, 2]);
      constrain.add(update_kernel);
      draw_kernel = gpu
        .createKernel(draw)
        // .setArgumentTypes({
        //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //   // @ts-ignore
        //   grid: "ArrayTexture(2)",
        // })
        .setGraphical(true)
        .setOutput([canvas.width, canvas.height]);
      constrain.add(draw_kernel);
      grid = init_kernel() as GPU.Texture;
      requestAnimationFrame(function callback() {
        if (!isActive) return;
        draw_kernel(grid);
        const _grid = grid;
        grid = update_kernel(_grid, 1) as GPU.Texture;
        _grid.delete();
        canvas
          .getContext("2d")
          ?.drawImage(
            draw_kernel.canvas,
            0,
            canvas.height - draw_kernel.canvas.height,
          );
        requestAnimationFrame(callback);
      });
    },
    stop: () => {
      isActive = false;
      init_kernel?.destroy();
      update_kernel?.destroy();
      draw_kernel?.destroy();
      gpu?.destroy();
    },
  };
}
