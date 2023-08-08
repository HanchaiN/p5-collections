//convert (x,y) to d
export function xy2d(n: number, x: number, y: number) {
  let rx = 1;
  let ry = 1;
  let d = 0;
  let _x = x;
  let _y = y;
  let s = n / 2;
  for (; s > 0; s /= 2) {
    rx = (_x & s) > 0 ? 1 : 0;
    ry = (_y & s) > 0 ? 1 : 0;
    d += s * s * ((3 * rx) ^ ry);
    if (ry == 0) {
      if (rx == 1) {
        _x = n - 1 - _x;
        _y = n - 1 - _y;
      }
      const t = _x;
      _x = _y;
      _y = t;
    }
  }
  return d;
}

//convert d to (x,y)
export function d2xy(n: number, d: number) {
  let rx = 1;
  let ry = 1;
  let s = 1;
  let t = d;
  let x = 0;
  let y = 0;
  for (s = 1; s < n; s *= 2) {
    rx = 1 & (t / 2);
    ry = 1 & (t ^ rx);
    if (ry == 0) {
      if (rx == 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      const t = x;
      x = y;
      y = t;
    }
    x += s * rx;
    y += s * ry;
    t /= 4;
  }
  return [x, y];
}
