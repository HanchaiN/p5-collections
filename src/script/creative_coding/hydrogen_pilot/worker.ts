import {
  TComplex,
  TVector,
  Vector,
  arctan2,
  complex_absSq,
  constrainMap,
} from "@/script/utils/math";
import * as d3 from "d3-color";
import { HigherOrderState } from "../dynamical_system/dynamic";
import {
  psi_getvel,
  psi_orbital_superposition,
  psi_orbital_superposition_der,
  psi_orbital_superposition_sample,
} from "../hydrogen_cloud/psi";

let superposition: { c: TComplex; n: number; l: number; m: number }[] = [];
let states: HigherOrderState[] = [];
let pretime: number,
  time_scale = 1;

function getColor(pos: Vector, t: number) {
  const val = psi_orbital_superposition(superposition, pos.val, t);
  const prob = 1000 * complex_absSq(val);
  const phase = arctan2(val[1], val[0]);
  const brightness = Math.pow(prob / (prob + 1), 0.01);
  const saturation_b = Math.pow(prob / (prob + 1), 0.05);
  const lightness = brightness * (1 - saturation_b / 2);
  const saturation_l =
    lightness === 0 || lightness === 1
      ? 0
      : (brightness - lightness) / Math.min(lightness, 1 - lightness);
  return d3
    .cubehelix(
      constrainMap(phase, -Math.PI, +Math.PI, 0, 360),
      constrainMap(saturation_l, 0, 1, 0, 1),
      constrainMap(lightness, 0, 1, 0, 1),
    )
    .formatHex();
}

export type MessageRequest = {
  superposition?: { c: TComplex; n: number; l: number; m: number }[];
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
    superposition = data.superposition;
  }
  if (data.addStates)
    states.push(
      ...psi_orbital_superposition_sample(superposition, data.addStates).map(
        (pos: TVector) => new HigherOrderState(new Vector(...pos)),
      ),
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
          (t: number, [pos]: Vector[]) => {
            return new Vector(
              ...psi_getvel(
                psi_orbital_superposition(superposition, pos.val, t),
                psi_orbital_superposition_der(superposition, pos.val, t),
              ),
            );
          },
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
