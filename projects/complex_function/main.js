import "p5";
import { getParentSize, Complex, map, d3 } from "../utils/index.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;

    const sketch = (p) => {
        const rescale = (z) => Complex.mult(z, 2);
        const f = (z) => Complex.div(
            Complex.mult(
                Complex.add(Complex.mult(z, z), Complex.fromCartesian(-1, 0)),
                Complex.add(z, Complex.fromCartesian(-2, 1)).pow(2),
            ),
            Complex.add(z.pow(2), Complex.fromCartesian(2, 2)),
        );
        const func = (z) => f(rescale(z));

        function plot(func) {
            p.push();
            p.colorMode(p.HSB, 360, 100, 100, 255);
            p.loadPixels();
            let d = p.pixelDensity();
            for (let i = 0; i <= p.width * d; i += 1) {
                for (let j = 0; j <= p.height * d; j += 1) {
                    const z = func(Complex.fromCartesian(
                        map(i, 0, p.width * d, -1, +1),
                        map(j, 0, p.height * d, +1, -1)
                    ));
                    const hue = map(z.theta, -Math.PI, +Math.PI, 0, 360);
                    const lum = map(Math.sqrt(Math.exp(-Math.sqrt(
                        [Math.log(z.r)].reduce(
                            (acc, curr) => acc * Math.pow(curr - Math.floor(curr), 2),
                            1
                        )
                    ))), 0, 1, .5, 1);
                    const sat = Math.sqrt(1 - Math.exp(-Math.sqrt(
                        [z.theta * 6 / Math.PI].reduce(
                            (acc, curr) => acc * (1 - Math.pow(map(curr - Math.floor(curr), 0, 1, -1, 1), 2)),
                            1
                        )
                    )));
                    const color = d3.hcl(hue, sat * 75, lum * 75);
                    const c = p.color(color.hex());
                    const ind = (j * p.width * d + i) * 4;
                    p.pixels[ind + 0] = p.red(c);
                    p.pixels[ind + 1] = p.green(c);
                    p.pixels[ind + 2] = p.blue(c);
                    p.pixels[ind + 3] = p.alpha(c);
                }
            }
            p.updatePixels();
            p.pop();
        }

        p.setup = function () {
            p.createCanvas(500, 500);
            p.noLoop();
        }

        p.draw = function () {
            p.background(220);
            plot(func);
        }
    }

    let instance;
    return {
        start: (node) => {
            parent = node;
            instance = new p5(sketch, node);
            canvas = instance.canvas;
        },
        stop: () => {
            instance?.remove();
            canvas?.remove();
            resizeObserver?.disconnect();
            parent = canvas = instance = resizeObserver = null;
        },
    };
}
