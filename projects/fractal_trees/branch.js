import { Vector } from "../utils/index.js";
export class Branch {
  constructor(begin, end, type, rule) {
    this.init = rule;
    this.begin = begin;
    this.end = end;
    this.type = type;
    this.finished = false;
    this.size = 1;
  }

  show(p) {
    p.stroke(255);
    p.strokeWeight(this.size);
    p.line(this.begin.x, this.begin.y, this.end.x, this.end.y);
  }

  length() {
    let l = Vector.sub(this.end, this.begin);
    return l.mag();
  }

  branch() {
    let branch = [];
    for (let i = 0; i < this.init[this.type].length; i++) {
      const newEnd = Vector.sub(this.end, this.begin)
        .rotate(this.init[this.type][i][0])
        .mult(this.init[this.type][i][1])
        .add(this.end);
      const child = new this.constructor(
        this.end,
        newEnd,
        this.init[this.type][i][2],
        this.init
      );
      branch.push(child);
    }
    return branch;
  }
}