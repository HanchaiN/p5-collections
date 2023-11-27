import { getColor } from "@/script/utils/dom";
import { constrainLerp, constrainMap } from "@/script/utils/math";
import * as color from "@thi.ng/color";
import GIFEncoder from "gifencoder";
import type { Complex, MathJsChain } from "mathjs";
import { arg, fft, im, re, reshape } from "mathjs";

export default function execute() {
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	const getBackground = () => getColor("--md-sys-color-surface", "#000");
	let isActive = false;
	let src = "";

	function setup() {
		if (!canvas) return;
		ctx.lineWidth = 0;
		ctx.fillStyle = getBackground();
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	function redraw(img: HTMLImageElement) {
		if (!isActive) return;
		const _canvas = new OffscreenCanvas(128, 128);
		const _ctx = _canvas.getContext("2d", {
			alpha: false,
			desynchronized: true,
		})!;
		const kspace = (() => {
			const downscale_canvas = new OffscreenCanvas(64, 64);
			const downscale_ctx = downscale_canvas.getContext("2d", {
				alpha: false,
				desynchronized: true,
			})!;
			downscale_ctx.fillStyle = "#000";
			downscale_ctx.fillRect(
				0,
				0,
				downscale_canvas.width,
				downscale_canvas.height,
			);
			downscale_ctx.drawImage(
				img,
				0,
				0,
				downscale_canvas.width,
				downscale_canvas.height,
			);
			const imageData = downscale_ctx.getImageData(
				0,
				0,
				downscale_canvas.width,
				downscale_canvas.height,
			);
			const luminance = new Array(imageData.width * imageData.height)
				.fill(0)
				.map((_, i) => {
					const index = i * 4;
					return color.oklch(
						color.srgb(
							imageData.data[index] / 255,
							imageData.data[index + 1] / 255,
							imageData.data[index + 2] / 255,
						),
					).l;
				});
			return fft(
				reshape(luminance, [
					imageData.width,
					imageData.height,
				]) as unknown as number[][],
			) as unknown[][] as Complex[][];
		})();
		function* draw() {
			let minColor = color.rgb(getColor("--md-sys-color-surface", "#000")).xyz;
			let maxColor = color.rgb(
				getColor("--md-sys-color-on-surface", "#FFF"),
			).xyz;
			if (color.oklch(minColor).l > color.oklch(maxColor).l) {
				[minColor, maxColor] = [maxColor, minColor];
			}
			const overlay = 0.05;
			const data = new Array(_ctx.canvas.width * _ctx.canvas.height).fill(0);
			const kspace_height = kspace.length,
				kspace_width = kspace[0].length;
			const normalizer = 1 / (kspace_width * kspace_height);
			const iter = (function* helicalIndices(n) {
				let num = 0;
				let curr_x = 0,
					dir_x = 1,
					lim_x = 1,
					curr_num_lim_x = 2;
				let curr_y = -1,
					dir_y = 1,
					lim_y = 1,
					curr_num_lim_y = 3;
				let curr_rep_at_lim_x = 0;
				let curr_rep_at_lim_y = 0;
				yield [0, 0];
				while (num < n) {
					if (curr_x != lim_x) {
						curr_x += dir_x;
					} else {
						curr_rep_at_lim_x += 1;
						if (curr_rep_at_lim_x == curr_num_lim_x - 1) {
							if (lim_x < 0) {
								lim_x = -lim_x + 1;
							} else {
								lim_x = -lim_x;
							}
							curr_rep_at_lim_x = 0;
							curr_num_lim_x += 1;
							dir_x = -dir_x;
						}
					}
					if (curr_y != lim_y) {
						curr_y += dir_y;
					} else {
						curr_rep_at_lim_y += 1;
						if (curr_rep_at_lim_y == curr_num_lim_y - 1) {
							if (lim_y < 0) {
								lim_y = -lim_y + 1;
							} else {
								lim_y = -lim_y;
							}
							curr_rep_at_lim_y = 0;
							curr_num_lim_y += 1;
							dir_y = -dir_y;
						}
					}
					yield [curr_x, curr_y];
					num += 1;
				}
			})(kspace.length * kspace[0].length);
			let acc_lambda = 0;
			for (const index of iter) {
				_ctx.fillStyle = "#000";
				_ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
				const imageData = _ctx.getImageData(
					0,
					0,
					_ctx.canvas.width,
					_ctx.canvas.height,
				);
				const x_ = index[0] + kspace_width / 2,
					y_ = index[1] + kspace_height / 2;
				const x =
					x_ < kspace_width / 2
						? x_ + kspace_width / 2
						: x_ - kspace_width / 2,
					y =
						y_ < kspace_height / 2
							? y_ + kspace_height / 2
							: y_ - kspace_height / 2;
				const lambda = 1 / Math.sqrt(x * x + y * y);
				const value = kspace[y][x];
				const wx = constrainMap(x_, 0, kspace_width, -0.5, 0.5);
				const wy = constrainMap(y_, 0, kspace_height, -0.5, 0.5);
				for (let i = 0; i < _ctx.canvas.height; i++) {
					for (let j = 0; j < _ctx.canvas.width; j++) {
						const phase =
							(wx * j * kspace_width) / _ctx.canvas.width +
							((wy * kspace_height) / _ctx.canvas.height) * i;
						const amp = constrainMap(
							Math.cos(0 * arg(value) + phase * 2 * Math.PI),
							-1,
							1,
							0,
							1,
						);
						const c = color.srgb(color.oklch(amp, 0.125, phase));
						imageData.data[(i * _ctx.canvas.width + j) * 4 + 0] =
							c.r * 255 * overlay;
						imageData.data[(i * _ctx.canvas.width + j) * 4 + 1] =
							c.g * 255 * overlay;
						imageData.data[(i * _ctx.canvas.width + j) * 4 + 2] =
							c.b * 255 * overlay;
						data[i * _ctx.canvas.width + j] +=
							normalizer *
							(re(
								value as unknown as MathJsChain<Complex>,
							) as unknown as number) *
							Math.cos(phase * Math.PI * 2);
						data[i * _ctx.canvas.width + j] -=
							normalizer *
							(im(
								value as unknown as MathJsChain<Complex>,
							) as unknown as number) *
							Math.sin(phase * Math.PI * 2);
					}
				}
				data.forEach((value, i) => {
					imageData.data[i * 4 + 0] +=
						constrainLerp(value, minColor[0], maxColor[0]) *
						255 *
						(1 - overlay);
					imageData.data[i * 4 + 1] +=
						constrainLerp(value, minColor[1], maxColor[1]) *
						255 *
						(1 - overlay);
					imageData.data[i * 4 + 2] +=
						constrainLerp(value, minColor[2], maxColor[2]) *
						255 *
						(1 - overlay);
				});
				_ctx.putImageData(imageData, 0, 0);
				acc_lambda += lambda;
				const is_yield = acc_lambda > 1 / 8;
				yield is_yield;
				if (is_yield) acc_lambda = 0;
			}
			_ctx.fillStyle = "#000";
			_ctx.fillRect(0, 0, _ctx.canvas.width, _ctx.canvas.height);
			const imageData = _ctx.getImageData(
				0,
				0,
				_ctx.canvas.width,
				_ctx.canvas.height,
			);
			data.forEach((value, i) => {
				imageData.data[i * 4 + 0] =
					constrainLerp(value, minColor[0], maxColor[0]) * 255;
				imageData.data[i * 4 + 1] =
					constrainLerp(value, minColor[1], maxColor[1]) * 255;
				imageData.data[i * 4 + 2] =
					constrainLerp(value, minColor[2], maxColor[2]) * 255;
			});
			_ctx.putImageData(imageData, 0, 0);
			return true;
		}
		const encoder = new GIFEncoder(_canvas.width, _canvas.height);
		encoder.start();
		encoder.setRepeat(-1);
		encoder.setDelay(1000 / 60);
		encoder.setQuality(10);
		const frames = draw();
		requestAnimationFrame(function draw() {
			if (!isActive || img.src != src) return;
			const res = frames.next();
			ctx.drawImage(_canvas, 0, 0, ctx.canvas.width, ctx.canvas.height);
			if (res.value)
				encoder.addFrame(_ctx as unknown as CanvasRenderingContext2D);
			if (!res.done) requestAnimationFrame(draw);
			else {
				encoder.finish();
				const elem = document.createElement("img");
				elem.src =
					"data:image/gif;base64," + encoder.out.getData().toString("base64");
				elem.className = canvas.className;
				elem.width = canvas.width;
				elem.height = canvas.height;
				canvas.replaceWith(elem);
			}
		});
	}

	return {
		start: (sketch: HTMLCanvasElement, config: HTMLFormElement) => {
			canvas = sketch;
			const parent = canvas.parentElement!;
			ctx = canvas.getContext("2d", { alpha: false, desynchronized: true })!;
			config
				.querySelector<HTMLInputElement>("#image")!
				.addEventListener("change", function () {
					parent.querySelector("img")?.replaceWith(canvas);
					const img = new Image();
					img.addEventListener("load", function onImageLoad() {
						this.removeEventListener("load", onImageLoad);
						redraw(img);
					});
					img.src = URL.createObjectURL(this.files![0]);
					src = img.src;
				});
			setup();
			isActive = true;
		},
		stop: () => {
			isActive = false;
		},
	};
}
