import * as d3 from "../utils/color.js";
import { getColor } from "../utils/dom.js";
import { constrainMap, symlog, symlog_inv } from "../utils/math.js";
import { ParticleSystem, SETTING } from "./particles.js";
export default function execute() {
    /**@type {HTMLCanvasElement} */
    let canvas = null;
    /**@type {CanvasRenderingContext2D} */
    let ctx = null;
    /**@type {HTMLInputElement} */
    let volume_slider = null;
    /**@type {HTMLSlotElement} */
    let volume_value = null;
    /**@type {HTMLInputElement} */
    let temperature_slider = null;
    /**@type {HTMLSlotElement} */
    let temperature_value = null;
    /**@type {HTMLInputElement} */
    let pressure_slider = null;
    /**@type {HTMLSlotElement} */
    let pressure_value = null;
    /**@type {ParticleSystem} */
    let system = null;
    const background = () => getColor('--color-surface-container-3', "#000");
    const n = 512;
    const time_scale = 1/8;
    const max_dt = .5 * time_scale;
    let isActive = false;
    let pretime = 0;
    const scale = 1e-2;

    function setup() {
        if (!canvas) return;
        ctx.lineWidth = 0;
        ctx.fillStyle = background().formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        system.wall.right = canvas.width / scale;
        volume_slider.min = 1.5 * n * Math.PI * Math.pow(SETTING.RADIUS, 2);
        volume_slider.max = canvas.height / scale * system.w;
        volume_slider.value = system.h * system.w;
        temperature_slider.min = symlog(SETTING.TempMin);
        temperature_slider.max = symlog(SETTING.TempMax);
        temperature_slider.value = symlog(system.Temperature);
        pressure_slider.min = symlog(1/3 * n * SETTING.TempMin * (2 / (SETTING.DOF) * SETTING.BOLTZMANN) / parseFloat(volume_slider.max));
        pressure_slider.max = symlog(1/3 * n * SETTING.TempMax * (2 / (SETTING.DOF) * SETTING.BOLTZMANN) / parseFloat(volume_slider.min));
    }

    function draw(time) {
        if (!isActive) return;
        if (pretime) {
            const deltaTime = (time - pretime) * time_scale / 1000;
            // system.update(Math.min(deltaTime, max_dt), 1);
            const subdivide = Math.ceil(deltaTime / max_dt);
            system.update(deltaTime, subdivide);
        }
        pretime = time;
        ctx.lineWidth = 0;
        ctx.fillStyle = background().formatHex8();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        system.particles.forEach((particle) => {
            ctx.fillStyle = d3.cubehelix(
                constrainMap(symlog(particle.Temperature), symlog(SETTING.TempMin), symlog(SETTING.TempMax), 180, 360),
                1.5,
                Number.parseInt(getComputedStyle(document.body).getPropertyValue('--tone-on-surface-var')) / 100,
                1
            ).formatHex8();
            ctx.beginPath();
            ctx.arc(particle.pos.x * scale, particle.pos.y * scale, 3, 0, 2 * Math.PI);
            ctx.fill();
        })
        temperature_value.innerText = system.Temperature.toExponential(2);
        pressure_slider.value = symlog(1/3 * system.Pressure);
        pressure_value.innerText = system.Pressure.toExponential(2);
        requestAnimationFrame(draw);
    }

    function volume_handler() {
        const value = parseFloat(volume_slider.value) / system.w;
        system.wall.bottom = value;
        volume_value.innerText = (system.w * system.h).toExponential(2);
    }
    function temperature_handler() {
        const value = symlog_inv(parseFloat(temperature_slider.value));
        system.Temperature = value;
    }
    return {
        start: () => {
            canvas = document.querySelector("article .sketch");
            ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
            system = new ParticleSystem(canvas.width / scale, canvas.height / scale, n, SETTING.TempMax);
            volume_slider = document.querySelector("article #config #volume");
            volume_value = document.querySelector("article #config #volume-value");
            temperature_slider = document.querySelector("article #config #temperature");
            temperature_value = document.querySelector("article #config #temperature-value");
            pressure_slider = document.querySelector("article #config #pressure");
            pressure_value = document.querySelector("article #config #pressure-value");
            volume_slider.addEventListener("input", volume_handler);
            temperature_slider.addEventListener("input", temperature_handler);
            volume_slider.addEventListener("change", () => system.resetStat(0));
            temperature_slider.addEventListener("change", () => system.resetStat(0));
            setup();
            volume_handler();
            temperature_handler();
            isActive = true;
            requestAnimationFrame(draw);
        },
        stop: () => {
            isActive = false;
            system = ctx = canvas = null;
            volume_slider = volume_value = null;
            temperature_slider = temperature_value = null;
            pressure_slider = pressure_value = null;
        },
    };
}
