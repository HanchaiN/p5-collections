import { getColor } from "../utils/dom.js";
import { drawDungeon, generateDungeon } from "./generator.js";
export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /** @type {ReturnType<generateDungeon>} */
    let gen;
    const palette = [
        getColor('--color-surface-container-3', "#1C0B40").formatHex8(),
        getColor('--color-primary-container', "#142273").formatHex8(),
        getColor('--color-outline', "#0F71F2").formatHex8(),
        getColor('--color-secondary-container', "#0F9BF2").formatHex8(),
        getColor('--color-tertiary', "#F222A9").formatHex8(),
    ];
    const unit = { x: 5, y: 5 };
    let size = { x: 0, y: 0 };
    
    function generate_and_draw(grid_size) {
        gen?.return();
        gen = generateDungeon(grid_size);
    }
    
    function drawStep() {
        if (!canvas)
            return;
        const { value, done } = gen.next();
        if (!done)
            setTimeout(() => requestAnimationFrame(drawStep), 0);
        drawDungeon(value, ctx, unit, palette);
    }
    function redraw() {
        generate_and_draw(size);
        requestAnimationFrame(drawStep);
    }
    function setup() {
        if (!canvas) return;
        size = {
            x: Math.ceil(canvas.width / unit.x),
            y: Math.ceil(canvas.height / unit.y),
        };
        redraw();
    }

    return {
        start: () => {
            canvas = document.querySelector("article canvas.sketch");
            ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
            canvas.addEventListener("click", redraw);
            setup();
        },
        stop: () => {
            canvas?.remove();
            canvas = ctx = null;
        },
    };
}
