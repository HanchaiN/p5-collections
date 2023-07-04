import "p5";
import { getColor, getParentSize } from "../utils/dom.js";
import { Complex } from "../utils/math.js";
import { Draggable } from "./draggable.js";
import { Gyrovector } from "./gyrovector.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;

    const sketch = (p) => {
        let r, Ox, Oy;
        const A = new Draggable(10);
        const B = new Draggable(10);

        Gyrovector.p = p;
        Draggable.p = p;

        function setOffset() {
            Ox = p.width / 2;
            Oy = p.height / 2;
            r = Math.min(Ox, Oy);
            A.setOffset(Ox, Oy, r);
            B.setOffset(Ox, Oy, r);
        }
        function canvasposition(x, y) {
            return [x * r + Ox, -y * r + Oy];
        }
        function calculateposition(x, y) {
            return [(x - Ox) / r, (-y + Oy) / r];
        }
        function parentResized() {
            const { width, height } = getParentSize(parent, canvas);
            p.resizeCanvas(width, height);
            setOffset();
        }
        p.setup = function () {
            const { width, height } = getParentSize(parent, canvas);
            p.createCanvas(width, height);
            setOffset();
            A.setPosition(...canvasposition(0, 0.975));
            B.setPosition(...canvasposition(0.1, -0.99));
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
        };
        p.draw = function () {
            p.clear();
            p.strokeWeight(1);
            p.stroke(getColor('--color-outline').formatHex8());
            p.fill(getColor('--color-surface-container-3').formatHex8());
            p.circle(Ox, Oy, 2 * r);
            p.strokeWeight(5);
            p.stroke(getColor('--color-outline').formatHex8());
            p.point(Ox, Oy);

            A.over();
            A.update();
            B.over();
            B.update();
            operate();
            A.show();
            B.show();
        };

        function operate() {
            p.push();
            const a = new Gyrovector(Complex.fromCartesian(...calculateposition(A.x, A.y)));
            const b = new Gyrovector(Complex.fromCartesian(...calculateposition(B.x, B.y)));
            p.strokeWeight(2.5);
            p.stroke(getColor('--color-on-surface').formatHex8());
            p.line(Ox, Oy, A.x, A.y);
            p.stroke(getColor('--color-on-surface-var').formatHex8());
            p.line(Ox, Oy, B.x, B.y);
            {
                // Draw line with point and vector
                p.strokeWeight(3.75);
                p.stroke(getColor('--color-tertiary-container').formatHex8());
                p.noFill();
                const l = Gyrovector.geodesic(a, a.add(b));
                switch (l[0]) {
                    case "circle":
                        p.circle(...canvasposition(l[1], l[2]), 2 * r * l[3]);
                        break;
                }
            }
            {
                // Add vectors
                let s = a.add(b);
                s = canvasposition(s.z.re, s.z.im);
                p.strokeWeight(7.5);
                p.stroke(getColor('--color-tertiary').formatHex8());
                p.point(s[0], s[1]);
            }
            {
                p.strokeWeight(3.75);
                p.stroke(getColor('--color-secondary').formatHex8());
                p.noFill();
                const l = Gyrovector.geodesic(a, b);
                switch (l[0]) {
                    case "circle":
                        p.circle(...canvasposition(l[1], l[2]), 2 * r * l[3]);
                        break;
                }
            }
            p.pop();
        }

        p.mousePressed = function () {
            A.pressed();
            B.pressed();
        };
        p.mouseReleased = function () {
            A.released();
            B.released();
        };
    };

    let instance;
    return {
        start: (node = document.querySelector("main.sketch")) => {
            parent = node;
            instance = new p5(sketch, node);
            canvas ??= instance.canvas;
        },
        stop: () => {
            instance?.remove();
            canvas?.remove();
            resizeObserver?.disconnect();
            parent = canvas = instance = resizeObserver = null;
        },
    };
}
