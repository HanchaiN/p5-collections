import { Vector } from "@/script/utils/math";
import type p5 from "p5";
export class Branch {
  init: number[][][];
  begin: Vector;
  end: Vector;
  type: number;
  finished: boolean;
  size: number;
  constructor(begin: Vector, end: Vector, type: number, rule: number[][][]) {
    this.init = rule;
    this.begin = begin;
    this.end = end;
    this.type = type;
    this.finished = false;
    this.size = 1;
  }

  show(p: p5) {
    p.stroke(255);
    p.strokeWeight(this.size);
    p.line(this.begin.x, this.begin.y, this.end.x, this.end.y);
  }

  length() {
    const l = Vector.sub(this.end, this.begin);
    return l.mag();
  }

  branch() {
    const branch = [];
    for (let i = 0; i < this.init[this.type].length; i++) {
      const newEnd = Vector.sub(this.end, this.begin)
        .rotate(this.init[this.type][i][0])
        .mult(this.init[this.type][i][1])
        .add(this.end);
      const child = new Branch(
        this.end,
        newEnd,
        this.init[this.type][i][2],
        this.init,
      );
      branch.push(child);
    }
    return branch;
  }
}
