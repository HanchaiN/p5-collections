import { getColor } from "../utils/dom.js";
import { BoidSystem, lim } from "./boid.js";
export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /**@type {BoidSystem} */
    let system = null;
    const background = getColor('--color-surface-container-3', "#000");
    const time_scale = 1;
    let isActive = false;
    let pretime = 0;

    function setup() {
        if (!canvas) return;
        ctx.lineWidth = 0;
        ctx.fillStyle = background.formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        background.opacity = .375;
        system.wall.right = canvas.width;
        system.wall.bottom = canvas.height;
    }

    function draw(time) {
        if (!isActive) return;
        if (pretime) {
            const deltaTime = (time - pretime) * time_scale;
            system.update(Math.min(deltaTime, 500), 1);
            // const subdivide = Math.ceil(deltaTime / 500);
            // system.update(deltaTime, subdivide);
        }
        pretime = time;
        ctx.lineWidth = 0;
        ctx.fillStyle = background.formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        system.data().forEach(({ c, p }) => {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.arc(p.x, p.y, lim.size, 0, 2 * Math.PI);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    
    return {
        start: (node = document.querySelector("article>canvas.sketch")) => {
            canvas = node;
            ctx = canvas.getContext("2d", { alpha: false });
            system = new BoidSystem(canvas.width, canvas.height, 250);
            setup();
            isActive = true;
            requestAnimationFrame(draw);
        },
        stop: () => {
            isActive = false;
            canvas?.remove();
            system = ctx = canvas = null;
        },
    };
}
