var r, Ox, Oy;
var P, Q;

function setup() {
    createCanvas(windowWidth, windowHeight);
    setOffset();
    let p = canvasposition(0, 0.975);
    P = new Draggable(p[0], p[1], 10, Ox, Oy, r);
    let q = canvasposition(0.1, -0.99);
    Q = new Draggable(q[0], q[1], 10, Ox, Oy, r);
}
function setOffset() {
    Ox = width / 2;
    Oy = height / 2;
    r = min(Ox, Oy);
}
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setOffset();
    P.setOffset(Ox, Oy, r);
    Q.setOffset(Ox, Oy, r);
}
function draw() {
    background(0);
    noStroke();
    fill(255);
    circle(Ox, Oy, 2 * r);
    strokeWeight(5);
    stroke(0);
    point(Ox, Oy);

    P.over();
    P.update();
    Q.over();
    Q.update();

    operate();
    P.show();
    Q.show();
}

function operate() {
    push();
    let p = calculateposition(P.x, P.y);
    p = new Gyrovector(new p5.Vector(p[0], p[1]));
    let q = calculateposition(Q.x, Q.y);
    q = new Gyrovector(new p5.Vector(q[0], q[1]));
    strokeWeight(2.5);
    stroke(220, 0, 0);
    line(Ox, Oy, P.x, P.y);
    stroke(0, 0, 220);
    line(Ox, Oy, Q.x, Q.y);
    {
        // Draw line with point and vector
        strokeWeight(3.75);
        stroke(255, 100, 125);
        noFill();
        beginShape();
        let t = 0;
        for (let t = -100; t < 100; t += 0.1) {
            let s = p.add(q.mult(t));
            s = canvasposition(s.vec.x, s.vec.y);
            curveVertex(s[0], s[1]);
            strokeWeight(5);
            point(s[0], s[1]);
            strokeWeight(3.75);
        }
        endShape();
    }
    {
        // Add vectors
        let s = p.add(q);
        s = canvasposition(s.vec.x, s.vec.y);
        strokeWeight(7.5);
        stroke(0, 155, 130);
        point(s[0], s[1]);
    }
    {
        // Draw line connect points
        strokeWeight(3.75);
        stroke(255, 255, 100);
        noFill();
        beginShape();
        let t = 0;
        for (let t = -100; t < 100; t += 0.1) {
            let s = p.add(p.neg().add(q).mult(t));
            s = canvasposition(s.vec.x, s.vec.y);
            curveVertex(s[0], s[1]);
            strokeWeight(5);
            point(s[0], s[1]);
            strokeWeight(3.75);
        }
        endShape();
    }
    pop();
}

function drawGeodesic(a, b) {
    let G = geodesic(a, b);
    switch (G[0]) {
        case "l":
            let p0 = canvasposition(G[1], G[2]);
            let p1 = canvasposition(G[3], G[4]);
            line(p0[0], p0[1], p1[0], p1[1]);
            break;
        case "c":
            let p = canvasposition(G[1], G[2]);
            circle(p[0], p[1], 2 * G[3] * r);
            break;
    }
}

function mousePressed() {
    P.pressed();
    Q.pressed();
}
function mouseReleased() {
    P.released();
    Q.released();
}

function canvasposition(x, y) {
    return [x * r + Ox, -y * r + Oy];
}
function calculateposition(x, y) {
    return [(x - Ox) / r, (- y + Oy) / r];
}