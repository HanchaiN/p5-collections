import { Vector, constrainMap } from "../utils/math.js";
import * as d3 from "../utils/color.js";
import { State } from "./dynamic.js";

let states = [];
let pretime, time_scale = 1;
const f = (time, state) => {
    const rho = 28;
    const sigma = 10;
    const beta = 8 / 3;
    return new Vector(
        sigma * (state[0].y - state[0].x),
        state[0].x * (rho - state[0].z) - state[0].y,
        state[0].x * state[0].y - beta * state[0].z,
    );
}
const err = 1e-5;

self.addEventListener("message", function (e) {
    const response = {};
    if (e.data.count)
        states = new Array(e.data.count).fill(0).map((_, i) => ({
            state: new State(new Vector(0, 2, 20).add(
                new Vector(constrainMap(i, 0, e.data.count, -err, +err), 0, 0)
            )),
            color: d3.hcl(constrainMap(i, 0, e.data.count, 0, 360), 75, 75).formatHex8()
        }));
    if (e.data.time && pretime) {
        const deltaTime = (e.data.time - pretime) * time_scale;
        const subdivide = Math.ceil(deltaTime / (time_scale * 10)); // 60 fps
        const stepTime = deltaTime / subdivide;
        states.forEach(({ state }) => {
            for (let i = 0; i < subdivide; i++) {
                const time = pretime * time_scale + (i + 0.5) * stepTime;
                state.update(f, time, stepTime);
            }
        });
        response.subdivide = subdivide;
    }
    if (e.data.time_scale) time_scale = e.data.time_scale;
    if (e.data.time) pretime = e.data.time;
    response.states = states.map(({ state, color }) => ({
        state: state.state[0].val,
        color,
    }))
    this.postMessage(response);
});