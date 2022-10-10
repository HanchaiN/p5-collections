const source = 1 / 2;
const n = 1000;
const weight = [1, 1];
const w = 2;
const h = 0.9;
const a = [0.49, 0.51];
const lambda = 2;
let frame;
let maxA = 0;
let stabled = false;
let sink = 0;
let preLayers;
let freeMemory;
function setup() {
    createCanvas(400, 400);
    frame = [
        createGraphics(width, ((1 - h) / 2) * height),
        createGraphics(width, ((1 - h) / 2) * height),
        createGraphics(width, h * height),
        createGraphics(width, (1 - h) * height),
    ];
    colorMode(HSB);
    angleMode(RADIANS);
    frame[2].background(0);
    frame[2].strokeWeight(1);
    frame[2].stroke(255);
    preLayers = preLayer(source, 0, a[0], a[1], 0, h, n, weight.length - 1);
    // noLoop();
}
function runLayer(ix, iy, sn, sx, sy, n) {
    let phases = new Array(n).fill(null);
    frame[2].line(0 * width, sy * height, lerp(sn, sx, 1 / (n + 1)) * width - w, sy * height);
    phases = phases.map((_, ind) => {
        let i = ind + 1;
        let phase = 0;
        let inp = createVector(ix * width, iy * height);
        let fnc = createVector((i / (n + 1)) * width, sy * height);
        phase += inp.dist(fnc);
        line(inp.x, inp.y, fnc.x, fnc.y);
        if (i < n + 1) {
            frame[2].line(
                lerp(sn, sx, i / (n + 1)) * width + w,
                sy * height,
                lerp(sn, sx, (i + 1) / (n + 1)) * width - w,
                sy * height
            );
        }
        return phase;
    });
    frame[2].line(lerp(sn, sx, n / (n + 1)) * width + w, sy * height, 1 * width, sy * height);
    return phases;
}
function preLayer(ix, iy, xn, xx, yn, yx, n, m) {
    let phases;
    if (m == 1) {
        let sy = lerp(yn, yx, 1 / (m + 1));
        phases = new Array(n).fill(null).map((_, ind) => {
            frame[2].line(
                0 * width,
                sy * height,
                lerp(xn, xx, 1 / (n + 1)) * width - w,
                sy * height
            );
            for (let i = 1; i < n; i += 1) {
                frame[2].line(
                    lerp(xn, xx, i / (n + 1)) * width + w,
                    sy * height,
                    lerp(xn, xx, (i + 1) / (n + 1)) * width - w,
                    sy * height
                );
            }
            frame[2].line(
                lerp(xn, xx, n / (n + 1)) * width + w,
                sy * height,
                1 * width,
                sy * height
            );
            return [0, [ind]];
        });
        return phases;
    }
    phases = runLayer(ix, iy, xn, xx, lerp(yn, yx, 1 / (m + 1)), n).map((phase, ind_) =>
        preLayer(
            lerp(xn, xx, (ind_ + 1) / (n + 1)), lerp(yn, yx, 1 / (m + 1)),
            xn, xx,
            lerp(yn, yx, 1 / (m + 1)), yx,
            n, m - 1,
        ).map((elem) => [weight[weight.length - m] * phase + elem[0], [ind_].concat(elem[1])])
    );
    return phases.flat(1);
}
function calcSlits(preLayers, ix, iy, ox, oy, xn, xx, yn, yx, n, m) {
    let inp = createVector(ix * width, iy * height);
    let opt = createVector(ox * width, oy * height);
    return preLayers.map((elem) => {
        let fni = createVector(
            lerp(xn, xx, (elem[1][0] + 1) / (n + 1)) * width,
            lerp(yn, yx, 1 / (m + 1)) * height
        );
        let fno = createVector(
            lerp(xn, xx, (elem[1][m - 1] + 1) / (n + 1)) * width,
            lerp(yn, yx, m / (m + 1)) * height
        );
        let phase = elem[0];
        phase += weight[0] * inp.dist(fni);
        phase += weight[m] * fno.dist(opt);
        phase *= TWO_PI / lambda;
        phase = p5.Vector.fromAngle(phase).heading();
        stroke(degrees(phase > 0 ? phase : phase + TWO_PI), 100, 100, 0.25);
        line(inp.x, inp.y, fni.x, fni.y);
        elem[1].slice().forEach((_, ind) => {
            line(
                lerp(xn, xx, (elem[1][ind] + 1) / (n + 1)) * width,
                lerp(yn, yx, (ind + 1) / (m + 1)) * height,
                lerp(xn, xx, (elem[1][ind + 1] + 1) / (n + 1)) * width,
                lerp(yn, yx, (ind + 2) / (m + 1)) * height
            );
        });
        line(fno.x, fno.y, opt.x, opt.y);
        return phase;
    });
}

function draw() {
    image(frame[2], 0, 0);
    image(frame[0], 0, ((h + 1) / 2) * height);
    image(frame[1], 0, h * height);
    image(frame[3], 0, h * height);
    // let sink = 1/3;
    stroke(255);
    strokeWeight(10);
    point(source * width, 0);
    strokeWeight(1);
    stroke(255);
    let res = calcSlits(preLayers, source, 0, sink, h, a[0], a[1], 0, h, n, weight.length - 1).reduce(
        (acc, elem) => p5.Vector.add(acc, p5.Vector.fromAngle(elem)),
        createVector(0, 0)
    );
    let phase, Amp;
    phase = res.heading();
    phase = phase > 0 ? phase : phase + TWO_PI;
    Amp = res.magSq();
    if (!stabled) maxA = max(maxA, Amp);
    Amp = Amp / maxA;
    strokeWeight(10);
    stroke(degrees(phase), 100, 100, 100 * Amp);
    point(sink * width, h * height);
    frame[0].colorMode(HSB);
    frame[0].stroke(degrees(phase), 75, 100 * Amp);
    frame[1].stroke(255 * Amp);
    frame[0].line(sink * width, 0, sink * width, ((1 - h) / 2) * height);
    frame[1].line(sink * width, 0, sink * width, ((1 - h) / 2) * height);
    if (stabled) {
        frame[3].strokeWeight(2);
        frame[3].stroke(255, 0, 0);
        frame[3].point(sink * width, map(Amp, 0, 1, frame[3].height, 0));
    }
    sink += 1 / (width * 2);
    if (sink > 1) {
        sink = 0;
        stabled = !stabled;
    }
    freeMemory = res;
}