var grid;
function setup() {
    createCanvas(200, 200);
    pixelDensity(1);
    grid = [];
    for (var x = 0; x < width; x++) {
        grid[x] = [];
        for (var y = 0; y < height; y++) {
            grid[x][y] = [1, 0];
        }
    }
    for (var i = -5; i < 5; i++) {
        for (var j = -5; j < 5; j++) {
            grid[i + floor(width / 2)][j + floor(height / 2)][1] = 1;
        }
    }
    let f = 0.055;
    let k = 0.062;
    grid = new Grid(grid, [1, 0.5], function (s) {
        return [
            -s[0] * s[1] * s[1] + f * (1 - s[0]),
            +s[0] * s[1] * s[1] - (k + f) * s[1],
        ];
    });
    // noLoop();
    frameRate(15);
}

function draw() {
    // background(255, 255, 0);
    grid.calc(1);
    loadPixels();
    for (let i = 0; i < width; i += 1) {
        for (let j = 0; j < width; j += 1) {
            let c = constrain(
                floor((grid.grid[i][j][0] - grid.grid[i][j][1]) * 255),
                0,
                255
            );
            // set(i, j, color(c, c, c, 255)); // Pixilized result
            let pix = (i + j * width) * 4;
            pixels[pix + 0] = c;
            pixels[pix + 1] = c;
            pixels[pix + 2] = c;
            pixels[pix + 3] = 255; // smooth result
        }
    }
    updatePixels();
}
