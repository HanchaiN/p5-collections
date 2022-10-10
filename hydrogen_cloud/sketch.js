function vrt(y) {
    return (-2 * y + height) / height;
}
function hrz(x) {
    return (2 * x - width) / width;
}

let u = [
    // [1, wave_function(1, 0, 0)],
    // [1, wave_function(2, 0, 0)],
    [1, wave_function(2, 1, -1)],
    // [1, wave_function(2, 1, 0)],
    // [1, wave_function(2, 1, +1)],
    // [1, wave_function(3, 0, 0)],
    // [1, wave_function(4, 0, 0)],
];
// Normalize
{
    let s = 0;
    for (let i = 0; i < u.length; i += 1) {
        s = math.add(s, math.square(u[i][0]));
    }
    s = math.sqrt(s);
    for (let i = 0; i < u.length; i += 1) {
        u[i][0] = math.divide(u[i][0], s);
    }
}
let psi = function (r, theta, phi) {
    // superposition involved
    let psi_ = 0;
    for (let i = 0; i < u.length; i += 1) {
        psi_ = math.add(psi_, math.multiply(u[i][0], u[i][1](r, theta, phi)));
    }
    return psi_;
};

function setup() {
    createCanvas(500, 500);
    colorMode(RGB);
    angleMode(RADIANS);
    pixelDensity(1);
    background(255);
    noLoop();
}
function draw() {
    loadPixels();
    let size_scale = 25;
    for (let px = 0; px < width; px += 1) {
        for (let py = 0; py < height; py += 1) {
            let x = size_scale * hrz(px);
            let y = size_scale * vrt(py);
            let z = size_scale * 0;
            let r = math.norm([x, y, z]);
            let theta = math.acos(z / r);
            let phi = math.atan2(y, x);
            let c = psi(r, theta, phi);
            let polar = c.toPolar();
            let possibility = math.square(polar.r);
            let phrase = polar.phi;
            {
                let color_;
                let brightness = possibility;
                let brightness_scale = 100;
                // brightness scaling
                brightness *= brightness_scale;
                // // gamma correction
                // let gamma = 0.7;
                // brightness = pow(brightness, gamma);

                // // tone mapping to [0,1)
                brightness *= 1 / (1 + brightness);
                // // tone mapping to [0,1)
                // brightness = (2 / PI) * atan(brightness);
                // // tone mapping to [0,1)
                // let a = 1 / 2;
                // brightness = 1 - pow(a, abs(brightness));

                // Re coloring for gracefulness
                let hue = phrase;// - PI / 6;
                // loop back to range [0, 2PI]
                while (hue < 0) {
                    hue += 2 * PI;
                }
                while (hue > 2 * PI) {
                    hue -= 2 * PI;
                }

                if (false) {
                    // Possibility monochrome
                    color_ = color(255 * brightness);
                } else {
                    // Domain coloring of wave fuction
                    let hsv = [degrees(hue), 1, brightness]; // HSB=HSV
                    hsv[0] = constrain(hsv[0], 0, 360);
                    hsv[1] = constrain(hsv[1], 0, 1);
                    hsv[2] = constrain(hsv[2], 0, 1);
                    let hsl = [hsv[0], 0, hsv[2] * (1 - hsv[1] / 2)];
                    if (hsl[2] != 0 && hsl[2] != 1) {
                        hsl[1] = (hsv[2] - hsl[2]) / min(hsl[2], 1 - hsl[2]);  // HSL
                    }
                    hsl[0] = constrain(hsl[0], 0, 360);
                    hsl[1] = constrain(hsl[1], 0, 1);
                    hsl[2] = constrain(hsl[2], 0, 1);
                    let lch = [hsv[2] * 100, hsv[1] * 100 * brightness, hsv[0]];
                    lch[0] = constrain(lch[0], 0, 100);
                    lch[1] = constrain(lch[1], 0, 160);  // Ideally no limits
                    lch[2] = constrain(lch[2], 0, 360);
                    color_ = color(d3.lch(lch[0], lch[1], lch[2]).formatHex());
                    // color_ = color(d3.hsl(hsl[0], hsl[1], hsl[2]).formatHex());
                }
                pixels[(px + py * width) * 4 + 0] = red(color_);
                pixels[(px + py * width) * 4 + 1] = green(color_);
                pixels[(px + py * width) * 4 + 2] = blue(color_);
                pixels[(px + py * width) * 4 + 3] = alpha(color_);
            }
        }
    }
    updatePixels();
    // filter(GRAY);
    noFill();
    stroke(0, 0, 100, 0.25);
    strokeWeight(1);
    for (let i = 1; i < sqrt(size_scale) + 1; i += 1) {
        let radius = (i * i) / size_scale;
        ellipse(width / 2, height / 2, radius * width, radius * height);
    }
}

// function mousePressed(){
//   redraw();
// }
