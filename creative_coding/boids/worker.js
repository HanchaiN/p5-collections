import { BoidSystem } from "./boid.js";

let system;
let width, height;
let pretime, time_scale = 1;

self.addEventListener("message", function (e) {
    const response = {};
    if (e.data.width) {
        width = e.data.width;
        if (system) system.wall.right = width;
    }
    if (e.data.height) {
        height = e.data.height;
        if (system) system.wall.bottom = height;
    }
    if (e.data.count)
        if (width && height)
            system = new BoidSystem(width, height, e.data.count);
    if (e.data.time && pretime) {
        const deltaTime = e.data.time * time_scale - pretime;
        system.update(deltaTime);
    }
    if (e.data.time_scale) time_scale = e.data.time_scale;
    if (e.data.time) pretime = e.data.time * time_scale;
    if (system) response.boid = system.data();
    this.postMessage(response);
});