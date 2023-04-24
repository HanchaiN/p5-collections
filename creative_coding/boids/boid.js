// id <- wt : visible characteristic
// d id << : offspring
// d id >> : predate

// delta <- wt : mutability

// Coherence <- exp(A-B) * tanh(wt) : + @ A > B
// Seperation <- exp(B-A) * tanh(wt) : + @ A < B
// Alignment <- exp(-square(B-A)) * tanh(wt) : + @ A = B

// Range -> lim * sigmoid(wt)
// Angle -> lim * sigmoid(wt)
// Speed -> lim * sigmoid(wt)

import * as d3 from "../utils/color.js";
import { Vector, map, randomGaussian, sigm } from "../utils/math.js";
export const lim = {
    range: 100,
    steer: .1,
    angularRange: 2 / 3,
    speed: 50,
    mutability: 0.1,
    size: 5,
    wallRange: 50,
    wallRepulsion: 1,
};

export class Boid {
    constructor(system, pos, dir, id, cohesion, seperation, alignment, viewRange, viewAngle, speed, mutability) {
        this.system = system;
        this.prop_inherit = {
            id: id,
            cohesion: cohesion,
            seperation: seperation,
            alignment: alignment,
            viewRange: viewRange,
            viewAngle: viewAngle,
            speed: speed,
            mutability: mutability,
        };
        this.prop = {
            id: this.prop_inherit.id.copy(),
            idAcceptance: lim.angularRange * 2 * Math.PI,
            idCohesion: lim.steer,
            cohesion: this.prop_inherit.cohesion * lim.steer * 1,
            alignment: this.prop_inherit.alignment * lim.steer * 2,
            seperation: this.prop_inherit.seperation * lim.steer * 4,
            viewRange: this.prop_inherit.viewRange * lim.range,
            viewAngle: this.prop_inherit.viewAngle * lim.angularRange * 2 * Math.PI,
            speed: lim.speed,
            mutability: this.prop_inherit.mutability * lim.mutability,
        };
        this.pos = pos;
        this.dir = dir;
        dir.setMag(this.prop.speed);
    }
    eval() {
        let sumSpeedFactor = 0;
        const avgSpeed = Vector.zero(2);
        let sumPositionFactor = 0;
        const avgPosition = Vector.zero(2);
        let sumDisplacementFactor = 0;
        const avgDisplacement = Vector.zero(2);
        let sumIdFactor = .1;
        const avgId = this.prop_inherit.id.copy().mult(sumIdFactor);
        for (let ind = 0; ind < this.system.boids.length; ind++) {
            const other = this.system.boids[ind];
            if (other === this) continue;
            const displacement = Vector.sub(other.pos, this.pos);
            const id_phase = this.prop.id.angleBetween(other.prop.id);
            const angle = this.dir.angleBetween(displacement);
            if (displacement.mag() < this.prop.viewRange) {
                let wtS = Math.exp(Math.pow(id_phase, 2));
                // let wtS = 1;
                avgDisplacement.add(Vector.mult(displacement, wtS));
                sumDisplacementFactor += wtS;
            }
            if (
                displacement.mag() < this.prop.viewRange * 2 &&
                Math.abs(angle) < this.prop.viewAngle
            ) {
                let wtA = Math.exp(-Math.pow(id_phase, 4));
                // let wtA = 1;
                avgSpeed.add(Vector.normalize(other.dir).mult(wtA));
                sumSpeedFactor += wtA;
            }
            if (
                displacement.mag() < this.prop.viewRange * 3 &&
                Math.abs(angle) < this.prop.viewAngle
            ) {
                let wtC = Math.exp(- Math.pow(id_phase, 4));
                // let wtC = 1;
                avgPosition.add(Vector.mult(other.pos, wtC));
                sumPositionFactor += wtC;
            }
            if (
                displacement.mag() < this.prop.viewRange * 1 &&
                Math.abs(angle) < this.prop.viewAngle
            ) {
                let wtI;
                if (- this.prop.idAcceptance / 2 < id_phase && id_phase < + this.prop.idAcceptance / 2)
                    wtI = Math.exp(- Math.pow(id_phase, 2));
                else
                    wtI = - Math.exp(+ Math.pow(id_phase, 2));
                // let wtI = 0;
                avgId.add(Vector.mult(other.prop.id, wtI));
                sumIdFactor += Math.abs(wtI);
            }
        }
        {
            const wt = lim.wallRepulsion;
            if (this.pos.x - this.system.wall.left < lim.wallRange) {
                avgDisplacement.add(new Vector(this.system.wall.left - this.pos.x, 0).mult(wt));
                sumDisplacementFactor += wt;
            }
            if (this.pos.y - this.system.wall.top < lim.wallRange) {
                avgDisplacement.add(new Vector(0, this.system.wall.top - this.pos.y).mult(wt));
                sumDisplacementFactor += wt;
            }
            if (this.system.wall.right - this.pos.x < lim.wallRange) {
                avgDisplacement.add(new Vector(this.system.wall.right - this.pos.x, 0).mult(wt));
                sumDisplacementFactor += wt;
            }
            if (this.system.wall.bottom - this.pos.y < lim.wallRange) {
                avgDisplacement.add(new Vector(0, this.system.wall.bottom - this.pos.y).mult(wt));
                sumDisplacementFactor += wt;
            }
        }
        if (sumSpeedFactor !== 0) {
            avgSpeed.mult(1 / sumSpeedFactor);
            this.dir.add(avgSpeed.copy().sub(this.dir).mult(this.prop.alignment));
        }
        if (sumPositionFactor !== 0) {
            avgPosition.mult(1 / sumPositionFactor);
            this.dir.add(avgPosition.copy().sub(this.pos).mult(this.prop.cohesion));
        }
        if (sumDisplacementFactor !== 0) {
            avgDisplacement.mult(1 / sumDisplacementFactor);
            this.dir.sub(avgDisplacement.copy().mult(this.prop.seperation));
        }
        if (sumIdFactor !== 0) {
            avgId.mult(1 / sumIdFactor);
            this.id_ = avgId.copy().sub(this.prop.id);
            if (this.id_.magSq() !== 0)
                this.id_.setMag(this.prop.idCohesion);
        }
        this.dir.setMag(this.prop.speed);
    }
    update(deltaTime) {
        this.pos.add(this.dir.copy().mult(deltaTime / 1000));
        this.prop.id.add(this.id_.mult(deltaTime / 1000));
        this.prop.id.setMag(1);
        delete this.id_;
        while (this.pos.x < this.system.wall.left)
            this.pos.add(new Vector(this.system.wall.right - this.system.wall.left, 0));
        while (this.pos.x > this.system.wall.right)
            this.pos.sub(new Vector(this.system.wall.right - this.system.wall.left, 0));
        while (this.pos.y < this.system.wall.top)
            this.pos.add(new Vector(0, this.system.wall.bottom - this.system.wall.top));
        while (this.pos.y > this.system.wall.bottom)
            this.pos.sub(new Vector(0, this.system.wall.bottom - this.system.wall.top));
    }
    data() {
        return {
            c: d3.hcl(
                map(this.prop.id.heading(), -Math.PI, +Math.PI, 0, 360),
                50,
                75,
                1
            ).formatHex8(),
            p: {
                x: this.pos.x,
                y: this.pos.y,
            },
            d: {
                x: this.dir.x,
                y: this.dir.y,
            },
        }
    }
}

export class BoidSystem {
    constructor(w, h, n) {
        this.wall = {
            left: 0,
            right: w,
            top: 0,
            bottom: h,
        };
        this.boids = new Array(n).fill(0).map((_) => {
            let v = Vector.random2D();
            v.setMag(sigm(randomGaussian(0, 1)));
            return new Boid(
                this,
                new Vector(map(v.x, -1, +1, 0, w), map(v.y, -1, +1, 0, h)),
                Vector.random2D(),
                Vector.random2D(),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                Math.random(),
            );
        });
    }
    data() {
        return this.boids.map(b => b.data())
    }
    update(deltaTime, n = 1) {
        for (let i = 0; i < n; i++) {
            this.boids.forEach(b => b.eval());
            this.boids.forEach(b => b.update(deltaTime / n));
        }
    }
}
