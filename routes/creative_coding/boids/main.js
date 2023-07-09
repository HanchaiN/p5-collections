import * as d3 from "../utils/color.js";
import { getColor } from "../utils/dom.js";
import { BoidSystem, SETTING } from "./boid.js";
export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /**@type {BoidSystem} */
    let system = null;
    const background = () => getColor('--color-surface-container-3', "#000");
    const foreground = () => {
        const c = getColor('--color-on-surface', "#FFF")
        c.opacity = .0075;
        return c;
    };
    const time_scale = 1;
    let isActive = false;
    let pretime = 0;
    const scale = .5;

    function setup() {
        if (!canvas) return;
        ctx.lineWidth = 0;
        ctx.fillStyle = background().formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        system.wall.right = canvas.width / scale;
        system.wall.bottom = canvas.height / scale;
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
        ctx.fillStyle = background().formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        system.data().forEach(({ p, d }) => {
            ctx.fillStyle = foreground().formatHex8();
            ctx.beginPath();
            ctx.arc(p.x * scale, p.y * scale, SETTING.separationRange * scale, 0, 2 * Math.PI);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(p.x * scale, p.y * scale);
            ctx.arc(p.x * scale, p.y * scale, SETTING.visualRange * scale, Math.atan2(d.y, d.x) - SETTING.visualAngle / 2, Math.atan2(d.y, d.x) + SETTING.visualAngle / 2);
            ctx.lineTo(p.x * scale, p.y * scale);
            ctx.fill();
        });
        system.data().forEach(({ c, p }) => {
            ctx.fillStyle = d3.cubehelix(
                c,
                1.5,
                Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-on-surface-var')) / 100,
                1
            ).formatHex8();
            ctx.beginPath();
            ctx.arc(p.x * scale, p.y * scale, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
        requestAnimationFrame(draw);
    }
    
    return {
        start: () => {
            canvas = document.querySelector("article .sketch");
            ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
            system = new BoidSystem(canvas.width / scale, canvas.height / scale, 256);
            setup();
            isActive = true;
            requestAnimationFrame(draw);
        },
        stop: () => {
            isActive = false;
            system = ctx = canvas = temp = null;
        },
    };
}
