import * as d3 from "../utils/color.js";
import { d2xy, xy2d } from "./calc.js";
const xy_map = new Map(), d_map = new Map(), buffer_map = new Map();
let xy = false, d = false, buffer = false;
function generateXY(order) {
    if (xy_map.has(order)) return xy_map.get(order);
    const resolution = Math.pow(2, order);
    let map = new Array(resolution).fill(0).map(_ => new Array(resolution).fill(0));
    if (d_map.has(order)) {
        d_map.get(order).forEach(([x, y], d) => map[x][y] = d);
    } else {
        map = map.map((_, x) => _.map((_, y) => xy2d(resolution, x, y)));
    }
    xy_map.set(order, map);
    return map;
}
function generateD(order) {
    if (d_map.has(order)) return d_map.get(order);
    const resolution = Math.pow(2, order);
    const map = new Array(resolution * resolution).fill(0).map((_, d) => d2xy(resolution, d));
    d_map.set(order, map);
    return map;
}
function generateBuffer(order) {
    if (buffer_map.has(order)) return buffer_map.get(order);
    const resolution = Math.pow(2, order);
    const length = resolution * resolution;
    const buffer = new Uint8ClampedArray(resolution * resolution * 4).fill(255);
    generateXY(order).forEach((_, x) => _.forEach((d, y) => {
        const color = d3.hcl(d / length * 360, 100, 100).rgb();
        buffer[y * (resolution * 4) + x * 4 + 0] = color.r;
        buffer[y * (resolution * 4) + x * 4 + 1] = color.g;
        buffer[y * (resolution * 4) + x * 4 + 2] = color.b;
    }));
    buffer_map.set(order, buffer);
    return buffer;
}
self.addEventListener("message", function (e) {
    const maxOrder = e.data.maxOrder;
    if (maxOrder) {
        d = e.data.d;
        xy = e.data.xy;
        buffer = e.data.buffer;
        for (let order = 0; order <= maxOrder; order++) {
            if (d)
                generateD(order)
            if (xy)
                generateXY(order)
            if (buffer)
                generateBuffer(order)
        }
        return;
    }
    const resolution = Math.pow(2, e.data.order ?? 0);
    const order = Math.round(Math.log2(resolution));
    const length = resolution * resolution;
    const response = { resolution, order, length, id: e.data.id };
    if (e.data.d) response.d = generateD(order);
    if (e.data.xy) response.xy = generateXY(order);
    if (e.data.buffer) response.buffer = generateBuffer(order);
    this.postMessage(response);
});