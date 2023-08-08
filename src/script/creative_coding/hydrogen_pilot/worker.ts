import { Complex, Vector, constrainMap } from "@/script/utils/math";
import * as d3 from "d3-color";
import { HigherOrderState } from "../dynamical_system/dynamic";
import { WaveFunction } from "./psi";

let psi: WaveFunction;
let states: HigherOrderState[] = [];
let pretime: number,
  time_scale = 1;

function getColor(pos: Vector, t: number) {
  const p = psi.psi(pos, t);
  const prob = 1000 * p.absSq();
  const phase = p.theta;
  const brightness = Math.pow(prob / (prob + 1), 0.1);
  return d3
    .hcl(
      constrainMap(phase, -Math.PI, +Math.PI, 0, 360),
      constrainMap(brightness, 0, 1, 0, 100),
      constrainMap(brightness, 0, 1, 0, 100),
    )
    .formatHex();
}

export type MessageRequest = {
  superposition?: {
    coeff: {
      re: number;
      im: number;
    };
    quantum_number: {
      n: number;
      l: number;
      m: number;
    };
  }[];
  addStates?: number;
  resetState?: boolean;
  time?: number;
  time_scale?: number;
};
export type MessageResponse = {
  states?: { x: number; y: number; z: number; c: string }[];
};

export function main(data: MessageRequest) {
  const response: MessageResponse = {};
  if (data.superposition) {
    psi = WaveFunction.superposition(
      data.superposition.map(
        ({ coeff: { re, im }, quantum_number: { n, l, m } }) => {
          return {
            coeff: Complex.fromCartesian(re ?? 0, im ?? 0),
            psi: WaveFunction.fromOrbital(n, l, m),
          };
        },
      ),
    );
  }
  if (data.addStates)
    states.push(
      ...psi
        .sample(data.addStates)
        .map((pos: Vector) => new HigherOrderState(pos)),
    );
  if (data.resetState) states = [];
  if (data.time && pretime) {
    const deltaTime = (data.time - pretime) * time_scale;
    const subdivide = Math.ceil(deltaTime / (time_scale * 10)); // 60 fps
    const stepTime = deltaTime / subdivide;
    for (let i = 0; i < subdivide; i++) {
      const time = pretime * time_scale + (i + 0.5) * stepTime;
      states.forEach((state) => {
        state.update(
          (t: number, [pos]: Vector[]) => psi.getVel(pos, t),
          time,
          stepTime,
        );
      });
    }
  }
  if (data.time_scale) time_scale = data.time_scale;
  if (data.time) pretime = data.time;
  if (states)
    response.states = states.map((state) => ({
      x: state.state[0].x,
      y: state.state[0].y,
      z: state.state[0].z,
      c: getColor(state.state[0], pretime * time_scale),
    }));
  return response;
}
self?.addEventListener("message", ({ data }: MessageEvent<MessageRequest>) =>
  self.postMessage(main(data)),
);
