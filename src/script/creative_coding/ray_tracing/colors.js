import { MAX_LUM, MIN_LUM } from "./const";

const CHANNELS = 3;

function toRGB(v500, v600, v700) {
  return {
    r: (v600 + v700) / 2,
    g: (v500 + v600) / 2,
    b: (0 + v500) / 2,
  };
}

export class Light {
  constructor(...colors) {
    if (colors.length !== CHANNELS) throw new Error();
    this.color = colors;
  }
  rgb() {
    return toRGB(...this.color);
  }
  clone() {
    return new Light(...this.color);
  }
  mix(other) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] += other.color[i];
    }
    return this;
  }
  mult(fac) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] *= fac;
    }
    return this;
  }
  apply(pigment) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] *= pigment.color[i];
    }
    return this;
  }
  static get black() {
    return new Light(...new Array(CHANNELS).fill(0));
  }
  static get white() {
    return new Light(...new Array(CHANNELS).fill(MAX_LUM));
  }
}

export class Dye {
  constructor(...colors) {
    if (colors.length !== CHANNELS) throw new Error();
    this.color = colors.slice();
  }
  rgb() {
    return Light.white.apply(this).rgb();
  }
  clone() {
    return new Dye(...this.color);
  }
  lightMix(other) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] += other.color[i];
    }
    return this;
  }
  lightMult(fac) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] *= fac;
    }
    return this;
  }
  mix(other) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] *= other.color[i];
    }
    return this;
  }
  mult(fac) {
    for (let i = 0; i < CHANNELS; i++) {
      this.color[i] = Math.pow(this.color[i], fac);
    }
    return this;
  }
  static get black() {
    return new Dye(...new Array(CHANNELS).fill(0));
  }
  static get white() {
    return new Dye(...new Array(CHANNELS).fill(1));
  }
  isBlack() {
    return this.color.every((v) => v < MIN_LUM);
  }
}
