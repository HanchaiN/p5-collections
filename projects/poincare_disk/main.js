import "p5";
import { Draggable } from "./draggable.js";
import { Gyrovector } from "./gyrovector.js";
import { getParentSize, Vector } from "../utils/index.js";
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
            p.background(0);
            p.noStroke();
            p.fill(255);
            p.circle(Ox, Oy, 2 * r);
            p.strokeWeight(5);
            p.stroke(0);
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
            let a = calculateposition(A.x, A.y);
            a = new Gyrovector(new Vector(a[0], a[1]));
            let b = calculateposition(B.x, B.y);
            b = new Gyrovector(new Vector(b[0], b[1]));
            p.strokeWeight(2.5);
            p.stroke(220, 0, 0);
            p.line(Ox, Oy, A.x, A.y);
            p.stroke(0, 0, 220);
            p.line(Ox, Oy, B.x, B.y);
            {
                // Draw line with point and vector
                p.strokeWeight(3.75);
                p.stroke(255, 100, 125);
                p.noFill();
                p.beginShape();
                let t = 0;
                for (let t = -100; t < 100; t += 0.1) {
                    let s = a.add(b.mult(t));
                    s = canvasposition(s.vec.x, s.vec.y);
                    p.curveVertex(s[0], s[1]);
                    p.strokeWeight(5);
                    p.point(s[0], s[1]);
                    p.strokeWeight(3.75);
                }
                p.endShape();
            }
            {
                // Add vectors
                let s = a.add(b);
                s = canvasposition(s.vec.x, s.vec.y);
                p.strokeWeight(7.5);
                p.stroke(0, 155, 130);
                p.point(s[0], s[1]);
            }
            {
                // Draw line connect points
                p.strokeWeight(3.75);
                p.stroke(255, 255, 100);
                p.noFill();
                p.beginShape();
                let t = 0;
                for (let t = -100; t < 100; t += 0.1) {
                    let s = a.add(a.neg().add(b).mult(t));
                    s = canvasposition(s.vec.x, s.vec.y);
                    p.curveVertex(s[0], s[1]);
                    p.strokeWeight(5);
                    p.point(s[0], s[1]);
                    p.strokeWeight(3.75);
                }
                p.endShape();
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
        start: (node) => {
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
