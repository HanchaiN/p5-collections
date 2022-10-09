//convert (x,y) to d
function xy2d(n, x, y) {
  var rx, ry, s, d = 0;
  for (s = n / 2; s > 0; s /= 2) {
    rx = (x & s) > 0;
    ry = (y & s) > 0;
    d += s * s * ((3 * rx) ^ ry);
    loc = rot(n, x, y, rx, ry);
    x = loc[0];
    y = loc[1];
  }
  return d;
}

//convert d to (x,y)
function d2xy(n, d) {
  var rx, ry, s, t = d;
  var x = 0;
  var y = 0;
  var k = 0;
  for (s = 1; s < n; s *= 2) {
    rx = 1 & (t / 2);
    ry = 1 & (t ^ rx);
    var loc = rot(s, x, y, rx, ry);
    x = loc[0];
    y = loc[1];
    x += s * rx;
    y += s * ry;
    t /= 4;
    k += 1;
  }
  rx = 1 & ~(floor(log(sqrt(n))/log(2)));
  ry = rx;
  var loc = rot(s, x, y, rx, ry);
  x = loc[0];
  y = loc[1];
  return [x, y];
}

//rotate/flip a quadrant appropriately
function rot(n, x, y, rx, ry) {
  if (ry == 0) {
    if (rx == 1) {
      x = n - 1 - x;
      y = n - 1 - y;
    }

    //Swap x and y
    var t = x;
    x = y;
    y = t;
  }
  return [x, y];
}
var order = 0;

function setup() {
  createCanvas(500, 500);
  colorMode(HSB, 1, 1, 1);
}

function draw() {
  background(1);
  var resolution = pow(2, order);
  strokeWeight(min(width, height) / (resolution + 1));
  beginShape();
  for (var i = 0; i < pow(resolution, 2); i++) {
    var n = pow(resolution, 2);
    stroke(i / n, 1, 1)
    var loc = d2xy(n, i);
    point(map(loc[0], -1, resolution, 0, width), map(loc[1], -1, resolution, 0, height));
    vertex(map(loc[0], -1, resolution, 0, width), map(loc[1], -1, resolution, 0, height));
    //print(loc)
  }
  noFill();
  strokeWeight(min(width, height) / (resolution + 1) / 10);
  stroke(0);
  endShape();
  noLoop()
}

function mousePressed() {
  order += 1;
  redraw();
}
