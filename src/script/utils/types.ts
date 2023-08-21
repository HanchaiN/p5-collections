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

export interface IKernelFunctionThis<ConstantsT = Record<string, never>> {
  output: {
    x: number;
    y: number;
    z: number;
  };
  thread: {
    x: number;
    y: number;
    z: number;
  };
  constants: ConstantsT;
  color(r: number): void;
  color(r: number, a: number): void;
  color(r: number, g: number, b: number, a: number): void;
}

export interface IRenderFunctionThis<ConstantsT = Record<string, never>> {
  output: {
    x: number;
    y: number;
    z: number;
  };
  constants: ConstantsT;
  color(x: number, y: number, r: number): void;
  color(x: number, y: number, r: number, a: number): void;
  color(x: number, y: number, r: number, g: number, b: number, a: number): void;
}
