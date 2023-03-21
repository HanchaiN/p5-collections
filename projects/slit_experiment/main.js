import "p5";
import { getParentSize, Vector, d3 } from "../utils/index.js";
export default function execute() {
    let parent = null;
    let canvas = null;
    let resizeObserver = null;

    const sketch = (p) => {
        const SOURCE_POSITION = new Vector(.5, 0);
        const PREVIEW_RATIO = 1 - 1 / 16;
        const SINK_POSITION = PREVIEW_RATIO;
        function _getLayerPosition(layerIndex, LAYER_COUNT, LAYER_BEGIN, LAYER_END) {
            return p.lerp(LAYER_BEGIN, LAYER_END, (layerIndex + 1) / (LAYER_COUNT + 1));
        }
        function _getSlitPosition(slitIndex, SLIT_COUNT, SLIT_BEGIN, SLIT_END) {
            if (SLIT_COUNT === 1)
                return 0.5
            return p.lerp(SLIT_BEGIN, SLIT_END, (slitIndex) / (SLIT_COUNT - 1));
        }
        const TOTAL_SLIT_WIDTH = .1 / 2;
        const SLIT_COUNTS = [10000];
        const SLIT_BEGIN = SOURCE_POSITION.x - TOTAL_SLIT_WIDTH / 2;
        const SLIT_END = SOURCE_POSITION.x + TOTAL_SLIT_WIDTH / 2;
        const LAYERS = SLIT_COUNTS.map((slitCount, i) => ({
            SLIT_POSITION: new Array(slitCount).fill(0).map((_, i) => _getSlitPosition(i, slitCount, SLIT_BEGIN, SLIT_END)),
            LAYER_POSITION: _getLayerPosition(i, SLIT_COUNTS.length, SOURCE_POSITION.y, SINK_POSITION),
            REFRACTIVE_INDEX: 1,
        }));
        const REFRACTIVE_INDEX_SINK = 1;
        const WAVELENGTH_REL = .01 / 2;
        let WAVENUMBER;
        const PATH_OPACITY = 0.5;
        const SINK_PIXEL_DENSITY = 3;
        const LAYER_HEIGHT = 1;
        let background, preview, mag_plot, mag_plot_line, foreground;
        let max_mag = 0;
        let iteration = 0;
        let scan_x = 0;
        let precomputed_phasors;
        let scaler = new Vector(0, 0);

        function getColor(phasor, opacity = 1, normalized = false) {
            let brightness = phasor.magSq();
            if (!normalized) {
                brightness *= 1 / (1 + brightness);
                // brightness = (2 / Math.PI) * Math.atan(brightness);
                // brightness = 1 - Math.pow(.5, brightness);
            }
            const gamma = 1;
            brightness = Math.pow(brightness, gamma);

            const hue = p.map(phasor.heading(), -Math.PI, +Math.PI, 0, 360);
            const saturation = 1;
            const lightness = brightness * (1 - saturation / 2);
            const saturation_l = lightness === 0 || lightness === 1 ? 0 : (brightness - lightness) / Math.min(lightness, 1 - lightness);
            const chroma = saturation * brightness;
            const hsv = [
                p.constrain(hue, 0, 360),
                p.constrain(saturation, 0, 1),
                p.constrain(brightness, 0, 1),
            ];
            const hsl = [
                p.constrain(hue, 0, 360),
                p.constrain(saturation_l, 0, 1),
                p.constrain(lightness, 0, 1),
            ]
            const hcl = [
                p.constrain(hue, 0, 360),
                p.constrain(chroma * 100, 0, 230),
                p.constrain(brightness * 100, 0, 100),
            ];
            const c = p.color(d3.hcl(...hcl).formatHex());
            c.setAlpha(opacity * 255)
            return c;
        }
        function getPhasor(draw = false) {
            let phasors = [{ phasor: Vector.fromPolar(1, 0), position: Vector.mult(SOURCE_POSITION, scaler) }];
            for (let LAYER of LAYERS) {
                const nextLayer = computeLayer(phasors.map(e => e.position), LAYER);
                const phasors_ = [];
                background.line(
                    0 * p.width,
                    LAYER.LAYER_POSITION * p.height,
                    1 * p.width,
                    LAYER.LAYER_POSITION * p.height
                );
                nextLayer.forEach(({ phaseShifts, position }, slitIndex) => {
                    phasors_.push({ phasor: new Vector(0, 0), position });
                    let SLIT_WIDTH, SLIT_BEGIN, SLIT_END;
                    if (LAYER.SLIT_POSITION.length === 1)
                        SLIT_WIDTH = .05;
                    else if (slitIndex === LAYER.SLIT_POSITION.length - 1)
                        SLIT_WIDTH = (LAYER.SLIT_POSITION[slitIndex] - LAYER.SLIT_POSITION[slitIndex - 1]) / 3;
                    else if (slitIndex === 0)
                        SLIT_WIDTH = (LAYER.SLIT_POSITION[slitIndex + 1] - LAYER.SLIT_POSITION[slitIndex]) / 3;
                    else
                        SLIT_WIDTH = (LAYER.SLIT_POSITION[slitIndex + 1] - LAYER.SLIT_POSITION[slitIndex - 1]) / 6;
                    SLIT_BEGIN = LAYER.SLIT_POSITION[slitIndex] - SLIT_WIDTH / 2;
                    SLIT_END = LAYER.SLIT_POSITION[slitIndex] + SLIT_WIDTH / 2;
                    background.push();
                    background.stroke(0);
                    background.line(
                        SLIT_BEGIN * p.width,
                        LAYER.LAYER_POSITION * p.height,
                        SLIT_END * p.width,
                        LAYER.LAYER_POSITION * p.height
                    );
                    phaseShifts.forEach((phaseShift, prevIndex) => {
                        const phasor = Vector.rotate(phasors[prevIndex].phasor, phaseShift);
                        const prev_pos = phasors[prevIndex].position;
                        phasors_.at(-1).phasor.add(phasor);
                        if (draw) background.stroke(getColor(phasor, PATH_OPACITY));
                        if (draw) background.line(prev_pos.x, prev_pos.y, position.x, position.y);
                    });
                    background.stroke(getColor(phasors_.at(-1).phasor));
                    background.strokeWeight(Math.max(LAYER_HEIGHT, SLIT_WIDTH * scaler.x));
                    background.point(position.x, position.y)
                    background.pop();
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
        function compute(precomputed_phasors, sink_x, draw = false, normalizer = 0) {
            const sink = new Vector(sink_x, SINK_POSITION).mult(scaler);
            if (draw) preview.push();
            const phasors = precomputed_phasors.map(({ phasor, position }) => {
                const phaseShift = position.dist(sink) * WAVENUMBER * REFRACTIVE_INDEX_SINK;
                const phasor_ = Vector.rotate(phasor, phaseShift);
                if (draw) preview.stroke(getColor(phasor_, PATH_OPACITY));
                if (draw) preview.line(position.x, position.y, sink.x, sink.y);
                return phasor_;
            })
            const phasor = phasors.reduce(
                (acc, phasor) => {
                    const sum = Vector.add(acc, phasor);
                    return sum;
                },
                new Vector(0, 0)
            );
            if (normalizer != 0) {
                const factor = Math.min(foreground.width, foreground.height) / 3 / normalizer;
                let ref = new Vector(0, 1);
                const angle = Vector.angleBetween(phasor, ref);
                const origin = new Vector(foreground.width / 2, foreground.height / 2);
                const avg_phasor = Vector.mult(getAvgPhasor(sink_x), factor).rotate(angle);
                foreground.strokeWeight(1);
                const [pos, neg] = phasors.reduce(
                    ([sum, diff], phasor) => {
                        const phasor_ = Vector.mult(phasor, factor).rotate(angle);
                        const sum_ = Vector.add(sum, phasor_);
                        const diff_ = Vector.sub(diff, phasor_);
                        foreground.stroke(getColor(phasor, 1, false));
                        foreground.line(sum.x, sum.y, sum_.x, sum_.y);
                        foreground.line(diff.x, diff.y, diff_.x, diff_.y);
                        return [sum_, diff_];
                    },
                    [origin.copy(), origin.copy()]
                )
                foreground.line(origin.x, origin.y, origin.x + avg_phasor.x, origin.y + avg_phasor.y);
                foreground.strokeWeight(3);
                foreground.stroke(255);
                foreground.line(neg.x, neg.y, pos.x, pos.y);
            }
            if (draw) preview.pop();
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

        p.setup = function () {
            const { width, height } = getParentSize(parent, canvas);
            p.createCanvas(width, height);
            scaler.set(p.width, p.height);
            WAVENUMBER = 2 * Math.PI / (WAVELENGTH_REL * scaler.x);
            foreground = p.createGraphics(p.width, PREVIEW_RATIO * p.height);
            background = p.createGraphics(p.width, PREVIEW_RATIO * p.height);
            preview = p.createGraphics(p.width, PREVIEW_RATIO * p.height);
            mag_plot = p.createGraphics(p.width, (1 - PREVIEW_RATIO) * p.height);
            mag_plot_line = p.createGraphics(p.width, (1 - PREVIEW_RATIO) * p.height);
            p.angleMode(p.RADIANS);
            background.strokeWeight(LAYER_HEIGHT);
            background.stroke(255);
            precomputed_phasors = getPhasor();
            background.strokeWeight(10);
            background.point(Vector.mult(SOURCE_POSITION, scaler));
            preview.strokeWeight(1);
            mag_plot.background(0);
            mag_plot_line.strokeWeight(2);
            mag_plot_line.stroke(255, 0, 0);
        }
        p.draw = function () {
            preview.background(0);
            preview.image(background, 0, 0);
            preview.image(foreground, 0, 0);
            foreground.clear();
            const phasor = compute(precomputed_phasors, scan_x, false, max_mag);
            if (iteration === 0) max_mag = Math.max(max_mag, phasor.mag());
            const normalized_phasor = Vector.div(phasor, max_mag);
            const strokeColor = getColor(normalized_phasor, 1, true);
            preview.push();
            preview.strokeWeight(10);
            preview.strokeWeight(5);
            preview.stroke(255);
            preview.point(scan_x * p.width, PREVIEW_RATIO * p.height);
            preview.pop();
            if (iteration < 2) {
                mag_plot.stroke(strokeColor);
                mag_plot.line(scan_x * p.width, 0, scan_x * p.width, mag_plot.height);
                if (iteration === 1)
                    mag_plot_line.point(scan_x * p.width, p.map(normalized_phasor.magSq(), 0, 1, mag_plot_line.height, 0));
            }
            p.image(foreground, 0, 0);
            p.image(preview, 0, 0);
            p.image(mag_plot, 0, PREVIEW_RATIO * p.height);
            p.image(mag_plot_line, 0, PREVIEW_RATIO * p.height);
            if (iteration === 0) {
                scan_x += 1 / p.width;
            } else {
                if (iteration % 2 === 0)
                    scan_x += 1 / (p.width * SINK_PIXEL_DENSITY);
                if (iteration % 2 === 1)
                    scan_x -= 1 / (p.width * SINK_PIXEL_DENSITY);
            }
            if (
                scan_x > 1 && iteration % 2 === 0
                || scan_x < 0 && iteration % 2 === 1
            ) {
                iteration += 1;
            }
        }
    }


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
