let sys;

let gridCanv;

const tanh = (x) => (exp(x) - exp(-x)) / (exp(x) + exp(-x));
const sigm = (x) => 1 / (1 + exp(-x));

function setup() {
    createCanvas(750, 500);
    gridCanv = createGraphics(width, height);
    gridCanv.background(0);
    gridCanv.noFill();
    gridCanv.stroke(255);
    for (let i = 0; i < width / lim.rng; i++) {
        for (let j = 0; j < width / lim.rng; j++) {
            gridCanv.square(i * lim.rng, j * lim.rng, lim.rng);
        }
    }
    sys = new System(width, height, 250);
    colorMode(HSL);
}

function draw() {
    image(gridCanv, 0, 0);
    sys.draw();
    sys.update();
}