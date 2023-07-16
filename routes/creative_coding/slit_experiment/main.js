import * as d3 from "../utils/color.js";
import { getParentSize } from "../utils/dom.js";
import { Vector, constrain, fpart, lerp, map } from "../utils/math.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;

    const SOURCE_POSITION = new Vector(.5, 0);
    const PLOT_RATIO = 1 / 2;
    const SINK_POSITION = 1;
    function _getLayerPosition(layerIndex, LAYER_COUNT, LAYER_BEGIN, LAYER_END) {
        return lerp((layerIndex + 1) / (LAYER_COUNT + 1), LAYER_BEGIN, LAYER_END);
    }
    function _getSlitPosition(slitIndex, SLIT_COUNT, SLIT_BEGIN, SLIT_END) {
        if (SLIT_COUNT === 1)
            return 0.5
        return lerp((slitIndex) / (SLIT_COUNT - 1), SLIT_BEGIN, SLIT_END);
    }
    const TOTAL_SLIT_WIDTH = 1 / 64;
    const TOTAL_SLIT_HEIGHT = 1 / 2;
    const LAYER_COUNT = 1;
    const TOTAL_SLIT_COUNT = 128;
    const ORDER = 0;
    const SLIT_COUNTS = new Array(LAYER_COUNT).fill(0).map((_, i) => Math.round(map(Math.pow(i + 1, ORDER), 0, Math.pow(LAYER_COUNT, ORDER), 1, TOTAL_SLIT_COUNT)));
    const LAYERS = SLIT_COUNTS.map((slitCount, i) => {
        const SLIT_WIDTH = map(Math.pow(i + 1, ORDER), 0, Math.pow(LAYER_COUNT, ORDER), 0, TOTAL_SLIT_WIDTH);
        const SLIT_BEGIN = SOURCE_POSITION.x - SLIT_WIDTH / 2;
        const SLIT_END = SOURCE_POSITION.x + SLIT_WIDTH / 2;
        return {
            SLIT_POSITION: new Array(slitCount).fill(0).map((_, i) => _getSlitPosition(i, slitCount, SLIT_BEGIN, SLIT_END)),
            LAYER_POSITION: _getLayerPosition(i, LAYER_COUNT, SOURCE_POSITION.y, (TOTAL_SLIT_HEIGHT) * SINK_POSITION + (1 - TOTAL_SLIT_HEIGHT) * SOURCE_POSITION.y),
            REFRACTIVE_INDEX: 1,
        }
    });
    const REFRACTIVE_INDEX_SINK = 1;
    const WAVELENGTH_REL = .005;
    let WAVENUMBER;
    const PATH_OPACITY = 0.5;
    const FULL_WIDTH_DURATION = 60;
    const LAYER_HEIGHT = 1;
    const SLIT_WIDTH_RATIO = 0.75;
    let max_mag = 0;
    let precomputed_phasors;
    let scaler = new Vector(0, 0);

    function getColor(phasor, opacity = 1, normalized = false) {
        let brightness = phasor.magSq();
        if (!normalized) {
            brightness *= 1 / (0.5 + brightness);
            brightness = constrain(brightness, 0, 1);
        }
        const gamma = 1;
        brightness = Math.pow(brightness, gamma);

        const hue = map(phasor.heading(), -Math.PI, +Math.PI, 0, 360);
        const saturation = 1;
        const chroma = saturation * brightness;
        const c = d3.hcl(
            constrain(hue, 0, 360),
            constrain(chroma * 100, 0, 230),
            constrain(brightness * 100, 0, 100),
            opacity
        ).formatHex8();
        return c;
    }
    function getPhasor(bg_ctx = null, mg_ctx = null) {
        let phasors = [{ phasor: Vector.fromPolar(1, 0), position: Vector.mult(SOURCE_POSITION, scaler) }];
        for (let LAYER of LAYERS) {
            const nextLayer = computeLayer(phasors.map(e => e.position), LAYER);
            const phasors_ = [];
            if (bg_ctx) bg_ctx.strokeStyle = "#FFFFFF";
            if (bg_ctx) bg_ctx.lineWidth = LAYER_HEIGHT;
            bg_ctx?.beginPath();
            bg_ctx?.moveTo(
                0 * scaler.x,
                LAYER.LAYER_POSITION * scaler.y
            );
            bg_ctx?.lineTo(
                1 * scaler.x,
                LAYER.LAYER_POSITION * scaler.y
            );
            bg_ctx?.stroke();
            nextLayer.forEach(({ phaseShifts, position }, slitIndex) => {
                phasors_.push({ phasor: new Vector(0, 0), position });
                let SLIT_WIDTH, SLIT_BEGIN, SLIT_END;
                if (LAYER.SLIT_POSITION.length === 1)
                    SLIT_WIDTH = .05;
                else if (slitIndex === LAYER.SLIT_POSITION.length - 1)
                    SLIT_WIDTH = (LAYER.SLIT_POSITION[slitIndex] - LAYER.SLIT_POSITION[slitIndex - 1]) * SLIT_WIDTH_RATIO;
                else if (slitIndex === 0)
                    SLIT_WIDTH = (LAYER.SLIT_POSITION[slitIndex + 1] - LAYER.SLIT_POSITION[slitIndex]) * SLIT_WIDTH_RATIO;
                else
                    SLIT_WIDTH = (LAYER.SLIT_POSITION[slitIndex + 1] - LAYER.SLIT_POSITION[slitIndex - 1]) / 2 * SLIT_WIDTH_RATIO;
                SLIT_BEGIN = LAYER.SLIT_POSITION[slitIndex] - SLIT_WIDTH / 2;
                SLIT_END = LAYER.SLIT_POSITION[slitIndex] + SLIT_WIDTH / 2;
                if (bg_ctx) bg_ctx.strokeStyle = "#000000";
                if (bg_ctx) bg_ctx.lineWidth = LAYER_HEIGHT;
                bg_ctx?.beginPath();
                bg_ctx?.moveTo(
                    SLIT_BEGIN * scaler.x,
                    LAYER.LAYER_POSITION * scaler.y,
                );
                bg_ctx?.lineTo(
                    SLIT_END * scaler.x,
                    LAYER.LAYER_POSITION * scaler.y,
                );
                bg_ctx?.stroke();
                phaseShifts.forEach((phaseShift, prevIndex) => {
                    const phasor = Vector.rotate(phasors[prevIndex].phasor, phaseShift);
                    const prev_pos = phasors[prevIndex].position;
                    phasors_.at(-1).phasor.add(phasor);
                    if (mg_ctx) mg_ctx.strokeStyle = getColor(phasor, PATH_OPACITY);
                    mg_ctx?.beginPath();
                    mg_ctx?.moveTo(prev_pos.x, prev_pos.y);
                    mg_ctx?.lineTo(position.x, position.y);
                    mg_ctx?.stroke();
                });
                if (bg_ctx) bg_ctx.fillStyle = getColor(phasors_.at(-1).phasor);
                bg_ctx?.beginPath();
                bg_ctx?.arc(position.x, position.y, Math.min(LAYER_HEIGHT, SLIT_WIDTH * scaler.x), 0, 2 * Math.PI);
                bg_ctx?.fill();
            })
            phasors = phasors_;
        }
        return phasors;
    }
    function computeLayer(prev_positions, LAYER) {
        return new Array(LAYER.SLIT_POSITION.length).fill(0).map((_, nextSlitIndex) => {
            const position = new Vector(
                LAYER.SLIT_POSITION[nextSlitIndex],
                LAYER.LAYER_POSITION,
            ).mult(scaler);
            const phaseShifts = prev_positions.map((prev_pos) => {
                return position.dist(prev_pos) * WAVENUMBER * LAYER.REFRACTIVE_INDEX;
            });
            return { phaseShifts, position };
        });
    }
    function compute(precomputed_phasors, sink_x, fg_ctx = null, normalizer = 0, mg_ctx = null) {
        const sink = new Vector(sink_x, SINK_POSITION).mult(scaler);
        const phasors = precomputed_phasors.map(({ phasor, position }) => {
            const phaseShift = position.dist(sink) * WAVENUMBER * REFRACTIVE_INDEX_SINK;
            const phasor_ = Vector.rotate(phasor, phaseShift);
            if (mg_ctx) mg_ctx.strokeStyle = getColor(phasor_, PATH_OPACITY);
            if (mg_ctx) mg_ctx.lineWidth = 1;
            mg_ctx?.beginPath();
            mg_ctx?.moveTo(position.x, position.y);
            mg_ctx?.lineTo(sink.x, sink.y);
            mg_ctx?.stroke();
            return phasor_;
        })
        const phasor = phasors.reduce(
            (acc, phasor) => {
                const sum = Vector.add(acc, phasor);
                return sum;
            },
            new Vector(0, 0)
        );
        if (fg_ctx && normalizer != 0) {
            const factor = Math.min(fg_ctx.canvas.width, fg_ctx.canvas.height) / 3 / normalizer;
            const angle = Vector.angleBetween(phasor, new Vector(1, 0));
            const normalize = (v) => Vector.mult(v, factor).rotate(angle);
            const origin = new Vector(fg_ctx.canvas.width / 2, fg_ctx.canvas.height / 2);
            const avg_phasor = getAvgPhasor(sink_x);
            const avg_phasor_ = normalize(avg_phasor.copy().setMag(phasor.mag()));
            const phasor_ = normalize(phasor);
            fg_ctx.lineWidth = 3;
            fg_ctx.strokeStyle = getColor(avg_phasor, 1, false);
            fg_ctx.beginPath();
            fg_ctx.moveTo(origin.x - avg_phasor_.x, origin.y - avg_phasor_.y);
            fg_ctx.lineTo(origin.x + avg_phasor_.x, origin.y + avg_phasor_.y);
            fg_ctx.stroke();
            fg_ctx.strokeStyle = getColor(phasor.copy().div(normalizer), 1, true);
            fg_ctx.beginPath();
            fg_ctx.moveTo(origin.x - phasor_.x, origin.y - phasor_.y);
            fg_ctx.lineTo(origin.x + phasor_.x, origin.y + phasor_.y);
            fg_ctx.stroke();
            fg_ctx.lineWidth = 1;
            phasors.reduce(
                (sum, phasor) => {
                    const sum_ = Vector.add(sum, normalize(phasor));
                    fg_ctx.strokeStyle = getColor(phasor, 1, false);
                    fg_ctx.beginPath();
                    fg_ctx.moveTo(sum.x, sum.y);
                    fg_ctx.lineTo(sum_.x, sum_.y);
                    fg_ctx.stroke();
                    return sum_;
                },
                origin.copy()
            )
            phasors.reduce(
                (sum, phasor) => {
                    const sum_ = Vector.sub(sum, normalize(phasor));
                    fg_ctx.strokeStyle = getColor(phasor, 1, false);
                    fg_ctx.beginPath();
                    fg_ctx.moveTo(sum.x, sum.y);
                    fg_ctx.lineTo(sum_.x, sum_.y);
                    fg_ctx.stroke();
                    return sum_;
                },
                origin.copy()
            )
        }
        return phasor;
    }
    function getAvgPhasor(sink_x) {
        let phaseShift = 0;
        let prevPosition = Vector.mult(SOURCE_POSITION, scaler);
        for (let LAYER of LAYERS) {
            const position = new Vector(LAYER.SLIT_POSITION.reduce((sum, curr) => sum + curr, 0) / LAYER.SLIT_POSITION.length, LAYER.LAYER_POSITION).mult(scaler);
            phaseShift += position.dist(prevPosition) * WAVENUMBER * LAYER.REFRACTIVE_INDEX;
            prevPosition = position;
        }
        phaseShift += new Vector(sink_x, SINK_POSITION).mult(scaler).dist(prevPosition) * WAVENUMBER * REFRACTIVE_INDEX_SINK;
        return Vector.fromPolar(1, phaseShift);
    }
    function draw(t) {
        if (!canvas) return;
        const foreground_ctx = canvas.querySelector("#foreground").getContext("2d");
        const middleground_ctx = canvas.querySelector("#middleground").getContext("2d");
        const mag_plot_ctx = canvas.querySelector("#mag_plot").getContext("2d");
        const t_ = fpart(t / (2 * FULL_WIDTH_DURATION * 1000));
        const forward = t_ < 0.5;
        const x_ = forward ? map(t_, 0, 0.5, -1, 1) : map(t_, 0.5, 1, 1, -1);
        const scan_x = map(x_, -1, 1, 0, 1);
        foreground_ctx.clearRect(0, 0, canvas.width, canvas.height);
        middleground_ctx.clearRect(0, LAYERS.at(-1).LAYER_POSITION * scaler.y, canvas.width, canvas.height - LAYERS.at(-1).LAYER_POSITION * scaler.y);
        mag_plot_ctx.clearRect(scan_x * canvas.width, 0, forward ? +10 : -10, canvas.height);
        const phasor = compute(precomputed_phasors, scan_x, foreground_ctx, max_mag, middleground_ctx);
        max_mag = Math.max(max_mag, phasor.mag());
        const normalized_phasor = Vector.div(phasor, max_mag);
        foreground_ctx.fillStyle = "#000000";
        foreground_ctx.beginPath();
        foreground_ctx.arc(scan_x * canvas.width, canvas.height, 2.5, 0, 2 * Math.PI);
        foreground_ctx.fill();
        mag_plot_ctx.strokeStyle = getColor(normalized_phasor, 1, true);
        mag_plot_ctx.beginPath();
        mag_plot_ctx.moveTo(scan_x * canvas.width, map(normalized_phasor.magSq(), 0, 1, PLOT_RATIO * canvas.height, 0));
        mag_plot_ctx.lineTo(scan_x * canvas.width, PLOT_RATIO * canvas.height);
        mag_plot_ctx.stroke();
        requestAnimationFrame(draw);
    }
    function parentResized() {
        if (!canvas) return;
        const { width, height } = getParentSize(parent, canvas);
        canvas.width = width;
        canvas.height = height;
        canvas.style.minWidth = `${canvas.width}px`;
        canvas.style.minHeight = `${canvas.height}px`;
        const background = canvas.querySelector("#background");
        background.width = canvas.width;
        background.height = canvas.height;
        const middleground = canvas.querySelector("#middleground");
        middleground.width = canvas.width;
        middleground.height = canvas.height;
        const foreground = canvas.querySelector("#foreground");
        foreground.width = canvas.width;
        foreground.height = canvas.height;
        const mag_plot = canvas.querySelector("#mag_plot");
        mag_plot.width = canvas.width;
        mag_plot.height = canvas.height * PLOT_RATIO;
        scaler.set(canvas.width, canvas.height);
        WAVENUMBER = 2 * Math.PI / (WAVELENGTH_REL * scaler.x);

        const background_ctx = background.getContext("2d");
        const middleground_ctx = middleground.getContext("2d");
        precomputed_phasors = getPhasor(background_ctx, middleground_ctx);
        background_ctx.fillStyle = "white";
        background_ctx.beginPath();
        background_ctx.arc(SOURCE_POSITION.x * scaler.x, SOURCE_POSITION.y * scaler.y, 5, 0, 2 * Math.PI);
        background_ctx.fill();
    }


    return {
        start: (node = document.querySelector("main.sketch")) => {
            parent = node;
            resizeObserver = new ResizeObserver(parentResized).observe(parent);
            const { width, height } = getParentSize(parent, canvas);
            canvas = document.createElement("div");
            canvas.width = width;
            canvas.height = height;
            const background = document.createElement("canvas");
            background.id = "background";
            background.style.position = "absolute";
            background.style.zIndex = -3;
            const middleground = document.createElement("canvas");
            middleground.id = "middleground";
            middleground.style.display = "none";
            middleground.style.position = "absolute";
            middleground.style.zIndex = -2;
            const foreground = document.createElement("canvas");
            foreground.id = "foreground";
            foreground.style.position = "absolute";
            foreground.style.zIndex = -1;
            const mag_plot = document.createElement("canvas");
            mag_plot.id = "mag_plot";
            mag_plot.style.position = "absolute";
            mag_plot.style.bottom = 0;
            mag_plot.style.zIndex = -4;
            canvas.append(foreground, middleground, background, mag_plot);
            parent.appendChild(canvas);
            parent.style.display = "flex";
            parent.style.justifyContent = "center";
            parent.style.alignItems = "center";
            canvas.style.display = "block";

            scaler.set(canvas.width, canvas.height);
            WAVENUMBER = 2 * Math.PI / (WAVELENGTH_REL * scaler.x);

            const background_ctx = background.getContext("2d");
            const middleground_ctx = middleground.getContext("2d");
            precomputed_phasors = getPhasor(background_ctx, middleground_ctx);
            background_ctx.fillStyle = "white";
            background_ctx.beginPath();
            background_ctx.arc(SOURCE_POSITION.x * scaler.x, SOURCE_POSITION.y * scaler.y, 5, 0, 2 * Math.PI);
            background_ctx.fill();

            requestAnimationFrame(draw);
        },
        stop: () => {
            canvas?.remove();
            resizeObserver?.disconnect();
            parent = canvas = resizeObserver = null;
        },
    };
}
