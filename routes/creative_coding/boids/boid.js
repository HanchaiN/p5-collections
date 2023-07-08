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

import { Vector, map, randomGaussian } from "../utils/math.js";
/**
 * @readonly
 * @enum {Symbol}
 */
export const GROUP = {
    PEER: Symbol("peer"),
    PREY: Symbol("prey"),
    PRED: Symbol("hunt"),
}
export const SETTING = {
    speedMax: 1e10,
    speedMin: 200,
    margin: 10,
    visualRange: 500,
    visualAngle: .9 * Math.PI * 2,
    turnRadius: 100,
    accelFactor: 5e5,
    avoidance: 10,
    uniqueness: .50,
    [GROUP.PEER]: {
        alignment: .100,
        coherence: .050,
        separation: 1.00,
        agreeableness: 1.00,
    },
    [GROUP.PRED]: {
        alignment: .025,
        coherence: -.050,
        separation: 1.50,
        agreeableness: -.25,
    },
    [GROUP.PREY]: {
        alignment: .025,
        coherence: .075,
        separation: 1.00,
        agreeableness: -.25,
    }
}

export class Boid {
    /**
     * @param {BoidSystem} system
     * @param {Vector} pos
     * @param {Vector} vel
     * @param {number} id
     */
    constructor(system, pos, vel, id) {
        this.system = system;
        this.pos = pos.copy();
        this.vel = vel.copy();
        this.id_inherit = Vector.fromPolar(1, id * 2 * Math.PI);
        this.id = this.id_inherit.copy();
    }
    eval() {
        this._id_vel = this.id.copy().mult(0);
        this._accel = this.vel.copy().mult(0);
        this._id_vel.add(Vector.sub(this.id_inherit, this.id).mult(SETTING.uniqueness));
        const acc = {
            [GROUP.PEER]: {
                count: 0,
                pos: Vector.mult(this.pos, 0),
                vel: Vector.mult(this.vel, 0),
                id: Vector.mult(this.id, 0),
            },
            [GROUP.PREY]: {
                count: 0,
                pos: Vector.mult(this.pos, 0),
                vel: Vector.mult(this.vel, 0),
                id: Vector.mult(this.id, 0),
            },
            [GROUP.PRED]: {
                count: 0,
                pos: Vector.mult(this.pos, 0),
                vel: Vector.mult(this.vel, 0),
                id: Vector.mult(this.id, 0),
            },
        };
        for (let other of this.system.boids) {
            if (other == this)
                continue;
            const dist = Vector.sub(other.pos, this.pos);
            const id_diff = Vector.angleBetween(this.id, other.id) / (2 * Math.PI);
            const group = id_diff < -1 / 6 ? GROUP.PREY : id_diff > 1 / 6 ? GROUP.PRED : GROUP.PEER;
            if (dist.mag() > SETTING.margin)
                this._accel.add(dist.copy().setMag(-1).mult(SETTING[group].separation / dist.magSq()));
            if (dist.mag() > SETTING.visualRange)
                continue;
            if (Math.abs(this.vel.angleBetween(dist)) > SETTING.visualAngle / 2)
                continue;
            acc[group].count++;
            acc[group].pos.add(other.pos);
            acc[group].vel.add(other.vel);
            acc[group].id.add(other.id);
        }
        for (let key in GROUP) {
            const group = GROUP[key];
            if (acc[group].count === 0)
                continue;
            acc[group].pos.div(acc[group].count);
            acc[group].vel.div(acc[group].count);
            acc[group].id.div(acc[group].count);
            this._applyPerp(Vector.sub(acc[group].pos, this.pos).normalize(), SETTING[group].coherence);
            this._applyPerp(acc[group].vel, SETTING[group].alignment / SETTING.speedMax);
            this._id_vel.add(Vector.sub(acc[group].id, this.id).mult(SETTING[group].agreeableness));
        }
        {
            if (this.pos.x > this.system.wall.left)
                this._accel.add(new Vector(+1, 0).mult(SETTING.avoidance / Math.pow(SETTING.margin + Math.abs(this.pos.x - this.system.wall.left), 2)));
            // else
            // this._accel.add(new Vector(+1, 0).mult(SETTING.avoidance / Math.pow(SETTING.margin - Math.abs(this.pos.x - this.system.wall.left), 2)));
            if (this.pos.y > this.system.wall.top)
                this._accel.add(new Vector(0, +1).mult(SETTING.avoidance / Math.pow(SETTING.margin + Math.abs(this.pos.y - this.system.wall.top), 2)));
            // else
            // this._accel.add(new Vector(0, +1).mult(SETTING.avoidance / Math.pow(SETTING.margin - Math.abs(this.pos.y - this.system.wall.top), 2)));
            if (this.pos.x < this.system.wall.right)
                this._accel.add(new Vector(-1, 0).mult(SETTING.avoidance / Math.pow(SETTING.margin + Math.abs(this.system.wall.right - this.pos.x), 2)));
            // else
            // this._accel.add(new Vector(-1, 0).mult(SETTING.avoidance / Math.pow(SETTING.margin - Math.abs(this.system.wall.right - this.pos.x), 2)));
            if (this.pos.y < this.system.wall.bottom)
                this._accel.add(new Vector(0, -1).mult(SETTING.avoidance / Math.pow(SETTING.margin + Math.abs(this.system.wall.bottom - this.pos.y), 2)));
            // else
            // this._accel.add(new Vector(0, -1).mult(SETTING.avoidance / Math.pow(SETTING.margin - Math.abs(this.system.wall.bottom - this.pos.y), 2)));
        }
    }
    _applyPerp(v, w) {
        const perp = v.copy();
        let i = 0;
        while (Math.abs(perp.dot(this.vel)) > .1)
        {
            const proj =this.vel.copy().mult(this.vel.dot(perp) / this.vel.magSq());
            perp.sub(proj);
            if (i++ > 10)
                break;
        }
        this._accel.add(perp.mult(w / SETTING.turnRadius));
    }
    update(deltaTime) {
        const dt = deltaTime / 1000;
        if (this.vel.mag() < SETTING.speedMin)
            this.vel.add(new Vector(randomGaussian(0, 1), randomGaussian(0, 1)).mult(SETTING.speedMin));
        if (this.vel.mag() > SETTING.speedMax)
            this.vel.setMag(SETTING.speedMax);
        this.vel.add(this._accel.copy().mult(dt * SETTING.accelFactor));
        this.pos.add(this.vel.copy().mult(dt));
        this.id.add(this._id_vel.copy().mult(dt)).normalize();
        // if ((this.pos.x < this.system.wall.left && this.vel.x < 0)
        //     || (this.pos.x > this.system.wall.right && this.vel.x > 0))
        //     this.vel.mult(new Vector(-1, 1));
        // if ((this.pos.y < this.system.wall.top && this.vel.y < 0)
        //     || (this.pos.y > this.system.wall.bottom && this.vel.y > 0))
        //     this.vel.mult(new Vector(1, -1));
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
            c: map(this.id.heading(), -Math.PI, +Math.PI, 0, 360),
            p: {
                x: this.pos.x,
                y: this.pos.y,
            },
            d: {
                x: this.vel.x,
                y: this.vel.y,
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
        const tempRatio = 0,
            padding = .1;
        this.boids = new Array(n).fill(0).map((_) => {
            const vel = new Vector(randomGaussian(0, 1), randomGaussian(0, 1));
            return new Boid(
                this,
                new Vector(map(Math.random(), -padding, 1 + padding, 0, w), map(Math.random(), -padding, 1 + padding, 0, h)),
                vel.mult(Math.sqrt((tempRatio * Math.pow(SETTING.speedMax, 2) + (1 - tempRatio) * Math.pow(SETTING.speedMin, 2)))),
                Math.random(),
            );
        });
    }
    get T() {
        return this.boids.reduce((acc, boid) => acc + boid.vel.magSq(), 0) / this.boids.length;
    }
    data() {
        return this.boids.map(b => b.data())
    }
    update(deltaTime, n = 1) {
        for (let i = 0; i < n; i++) {
            this.boids.forEach(b => b.eval());
            this.boids.forEach(b => b.update(deltaTime / n));
            for (let i = 0; i < this.boids.length; i++)
                for (let j = i + 1; j < this.boids.length; j++) {
                    const boidA = this.boids[i];
                    const boidB = this.boids[j];
                    const dx = Vector.sub(boidB.pos, boidA.pos);
                    const dv = Vector.sub(boidB.vel, boidA.vel);
                    if (dx.magSq() == 0)
                        continue;
                    if (dx.mag() < SETTING.margin
                        && -Vector.dot(dx, dv) > 0
                    ) {
                        const r = Vector.normalize(dx);
                        boidA.vel.add(r.copy().mult(Vector.dot(dv, r)));
                        boidB.vel.sub(r.copy().mult(Vector.dot(dv, r)));
                    }
                }
        }
    }
}
