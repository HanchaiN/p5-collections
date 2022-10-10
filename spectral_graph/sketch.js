let mainelem;
function setup() {
    createCanvas(500, 500, WEBGL);
    mainelem = new graph();
    mainelem.addNode(1);
    mainelem.addNode(2);
    mainelem.addNode(3);
    mainelem.addEdge(1, 2);
    mainelem.addEdge(2, 3);
    mainelem.addEdge(3, 1);
    mainelem.simplify();
    // noLoop();
}

function draw() {
    background(220);
    orbitControl();
    debugMode();
    let coord = mainelem.spectral();
    let x = 0;
    let y = coord.length - 1;
    let z = floor(coord.length / 2) + 1;
    let xmax = coord.reduce((acc, elem) => max(acc, abs(elem[x])), 0);
    let ymax = coord.reduce((acc, elem) => max(acc, abs(elem[y])), 0);
    let zmax = coord.reduce((acc, elem) => max(acc, abs(elem[z])), 0);
    let max_ = max(xmax, ymax, zmax);
    for (let i in coord) {
        push();
        translate(
            map(coord[i][x], -max_, +max_, -100, +100),
            map(coord[i][y], -max_, +max_, -100, +100),
            map(coord[i][z], -max_, +max_, -100, +100),
        );
        sphere(10);
        translate(
            -map(coord[i][x], -max_, +max_, -100, +100),
            -map(coord[i][y], -max_, +max_, -100, +100),
            -map(coord[i][z], -max_, +max_, -100, +100),
        );
        strokeWeight(1);
        for (let j in coord) {
            if (mainelem.adj[i][j]) {
                line(
                    map(coord[i][x], -max_, +max_, -100, +100),
                    map(coord[i][y], -max_, +max_, -100, +100),
                    map(coord[i][z], -max_, +max_, -100, +100),

                    map(coord[j][x], -max_, +max_, -100, +100),
                    map(coord[j][y], -max_, +max_, -100, +100),
                    map(coord[j][z], -max_, +max_, -100, +100),
                );
            }
        }
        pop();
    }
}