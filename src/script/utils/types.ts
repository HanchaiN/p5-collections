import type GPU from "gpu.js";
import type p5 from "p5";
export interface GPUKernel {
  addFunction<ArgTypes extends GPU.ThreadKernelVariable[]>(
    flag: GPU.GPUFunction<ArgTypes>,
    settings?: IFunctionSettings,
  ): this;
}
export interface IFunctionSettings {
  argumentTypes?: GPU.IGPUArgumentTypes | GPU.GPUVariableType[];
  returnType?: GPU.GPUVariableType;
}
export interface p5Extension extends p5 {
  canvas: HTMLCanvasElement;
}
