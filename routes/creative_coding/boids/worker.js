import { BoidSystem } from "./boid.js";

let system;
let width, height, count;
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
        count = e.data.count;
    if (e.data.width || e.data.height || e.data.count)
        if (width && height && count)
            if (!system || count != system.boids.length)
                system = new BoidSystem(width, height, count);
    if (e.data.time && pretime) {
        const deltaTime = (e.data.time - pretime) * time_scale;
        const subdivide = Math.ceil(deltaTime / 500)
        system.update(deltaTime, subdivide);
    }
    if (e.data.time_scale) time_scale = e.data.time_scale;
    if (e.data.time) pretime = e.data.time;
    if (system) response.boid = system.data();
    this.postMessage(response);
});