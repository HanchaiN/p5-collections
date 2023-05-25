import { Vector } from "../utils/math.js";
import { State } from "./dynamic.js";

let states = [];
let pretime, time_scale = 1;
let param = {
    rho: 28,
    sigma: 10,
    beta: 8 / 3,
};
function f(time, state) {
    return new Vector(
        param.sigma * (state[0].y - state[0].x),
        state[0].x * (param.rho - (state[0].z)) - state[0].y,
        state[0].x * state[0].y - param.beta * (state[0].z),
    );
}

self.addEventListener("message", function (e) {
    const response = {};
    if (e.data.states)
        states = e.data.states.map(({ state, color }) => ({
            state: new State(...state.map(_ => new Vector(..._))),
            color
        }));
    if (e.data.param) param = { ...param, ...e.data.param };
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