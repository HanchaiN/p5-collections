let pos;
let objects;
function setup() {
    pixelDensity(1.0);
    createCanvas(100, 100);
    pos = new p5.Vector(0, 0, 0);
    objects = new prop();
    objects.material = (_, dir) => new material(light.white.mult(map(dir.dot(createVector(-1, 0, 0).normalize()), -1, +1, 0, 1)));
    objects = objects.union(
        new ball(createVector(0, 0, 50), 10, new material(light.white()).this())
    );
    noLoop();
}

function draw() {
    background(255);
    render(pos, 100);
}

function render(pos, nsample = 100) {
    loadPixels();
    d = pixelDensity();
    for (let i = 0; i < width * d; i++) {
        for (let j = 0; j < height * d; j++) {
            let col = light.black();
            for (let k = 0; k < nsample; k++) {
                let r = new ray();
                r.position = pos;
                let dir = createVector(
                    map(i, 0, width * d, -10, +10),
                    map(j, height * d, 0, -10, +10),
                    10
                );
                dir.normalize();
                r.direction = dir;
                col = col.mix(trace(r, objects));
            }
            col = col.mult(1 / nsample);
            col = col.rgb();
            pixels[i * height * d * 4 + j * 4 + 0] = col.r * 255;
            pixels[i * height * d * 4 + j * 4 + 1] = col.g * 255;
            pixels[i * height * d * 4 + j * 4 + 2] = col.b * 255;
            pixels[i * height * d * 4 + j * 4 + 3] = 255;
        }
    }
    updatePixels();
}
