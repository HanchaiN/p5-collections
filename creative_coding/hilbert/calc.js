//rotate/flip a quadrant appropriately
function rot(n, x, y, rx, ry) {
    if (ry == 0) {
        if (rx == 1) {
            x = n - 1 - x;
            y = n - 1 - y;
        }

        //Swap x and y
        let t = x;
        x = y;
        y = t;
    }
    return [x, y];
}
//convert (x,y) to d
export function xy2d(n, x, y) {
    let rx, ry, s, d = 0;
    for (s = n / 2; s > 0; s /= 2) {
        rx = (x & s) > 0;
        ry = (y & s) > 0;
        d += s * s * ((3 * rx) ^ ry);
        [x, y] = rot(n, x, y, rx, ry);
    }
    return d;
}

//convert d to (x,y)
export function d2xy(n, d) {
    let rx, ry, s, t = d;
    let x = 0;
    let y = 0;
    for (s = 1; s < n; s *= 2) {
        rx = 1 & (t / 2);
        ry = 1 & (t ^ rx);
        [x, y] = rot(s, x, y, rx, ry);
        x += s * rx;
        y += s * ry;
        t /= 4;
    }
    return [x, y];
}