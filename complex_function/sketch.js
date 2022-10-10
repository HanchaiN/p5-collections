function setup() {
    createCanvas(400, 400);
    noLoop();
}

function field(f) {
    push();
    colorMode(HSB, 360, 100, 100, 255);
    angleMode(RADIANS);
    loadPixels();
    let d = pixelDensity();
    for (let i = 0; i <= width * d; i += 1) {
        for (let j = 0; j <= height * d; j += 1) {
            let xy = createVector(
                map(i, 0, width * d, -1, +1),
                map(j, 0, height * d, +1, -1)
            );
            xy = f(xy);
            let hue = degrees(xy.heading());
            hue = hue >= 0 ? hue : hue + 360;
            let lum = 0.75 + 0.25 * sqrt(1 - exp(-sqrt(
                [log(xy.mag())].reduce(
                    (acc, curr) => acc * sq(fract(curr)),
                    1
                )
            )));
            let sat = sqrt(1 - exp(-sqrt(
                [xy.heading() * 12 / TWO_PI].reduce(
                    (acc, curr) => acc * (1 - sq(2 * (fract(curr) - 0.5))),
                    1
                )
            )));
            lum *= 100;
            sat *= 100;
            let ind = (j * width * d + i) * 4;
            let c = color(hue, sat, lum);
            pixels[ind + 0] = red(c);
            pixels[ind + 1] = green(c);
            pixels[ind + 2] = blue(c);
            pixels[ind + 3] = alpha(c);
        }
    }
    updatePixels();
    pop();
}

function draw() {
    background(220);
    let dm = (v) => v.mult(5);
    let multC = (v, q) => createVector(v.x * q.x - v.y * q.y, v.x * q.y + v.y * q.x);
    let conjC = (v) => createVector(v.x, -v.y);
    let sqC = (v) => multC(v, v);
    let sinh = (b) => (exp(b) - exp(-b)) / 2;
    let cosh = (b) => (exp(b) + exp(-b)) / 2;
    let sinC = (v) => createVector(sin(v.x) * cosh(v.y), cos(v.x) * sinh(v.y));
    let cosC = (v) => createVector(cos(v.x) * cosh(v.y), -sin(v.x) * sinh(v.y));
    let powC = (b, v) => p5.Vector.fromAngle(v.y * log(b), pow(b, v.x));
    let invC = (v) => v.mag() > 0 ? p5.Vector.mult(conjC(v), 1 / v.magSq()) : createVector(1, 0);
    let gamC = (v) => new Array(20).fill(null).reduce((acc, _, ind) => multC(acc, multC(powC(1 + 1 / (ind + 1), v), invC(createVector(1, 0).add(v.mult(1 / (ind + 1)))))), invC(v));
    // let g = (v) => multC(multC(p5.Vector.add(sqC(v), createVector(-1, 0)),sqC(p5.Vector.add(v,createVector(-2,-1)))),invC(p5.Vector.add(sqC(v), createVector(2, 2))));
    let g = (v) =>
        v.x >= 1 ?
            new Array(20).fill(null).reduce((acc, _, ind) => p5.Vector.add(acc, powC(1 / (ind + 1), v)), createVector(0, 0))
            : v.x > 0 ?
                multC(invC(p5.Vector.sub(createVector(1, 0), powC(2, p5.Vector.sub(createVector(1, 0), v)))), new Array(100).fill(null).reduce((acc, _, ind) => acc.add(invC(powC((ind + 1), v)).mult(pow(-1, ind))), createVector(0, 0)))
                : multC(g(p5.Vector.sub(createVector(1, 0), v)), invC(
                    multC(multC(
                        powC(2, p5.Vector.sub(createVector(1, 0), v)),
                        powC(PI, p5.Vector.sub(createVector(0, 0), v))
                    ), multC(
                        sinC(p5.Vector.mult(p5.Vector.sub(createVector(1, 0), v), HALF_PI)),
                        gamC(v)
                    ))
                ));
    let f = (v) => g(dm(v));
    field(f);
}
