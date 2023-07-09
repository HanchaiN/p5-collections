import { Vector, map, randomGaussian } from "../utils/math.js";

export const SETTING = {
    TempMax: 1e10,
    TempMin: 0,
    RADIUS: 500,
    BOLTZMANN: 1,
    MASS: 1,
    DOF: 2,
    UPDATE_RATE: 1,
    RECALL_RATE: .01,
}

export class Particle {
    /**
     * @param {Vector} pos
     * @param {Vector} vel
     */
    constructor(pos, vel) {
        this.pos = pos.copy();
        this.vel = vel.copy();
    }
    update(deltaTime) {
        const dt = deltaTime;
        if (this._accel)
            this.vel.add(this._accel.copy().mult(dt / SETTING.MASS));
        this.pos.add(this.vel.copy().mult(dt));
    }
    get KE() {
        return ParticleSystem.getKE(this.vel.magSq());
    }
    get Temperature() {
        return ParticleSystem.getTemp(this.KE);
    }
}

export class ParticleSystem {
    constructor(w, h, n, temp) {
        this.wall = {
            left: 0,
            right: w,
            top: 0,
            bottom: h,
        };
        const padding = 0;
        this.particles = new Array(n).fill(0).map((_) => {
            return new Particle(
                new Vector(map(Math.random(), -padding, 1 + padding, 0, w), map(Math.random(), -padding, 1 + padding, 0, h)),
                new Vector(...new Array(SETTING.DOF).fill(0)),
            );
        });
        this.Temperature = temp;
        this.Pressure = 0;
        this.resetStat();
    }
    get w() {
        return this.wall.right - this.wall.left;
    }
    get h() {
        return this.wall.bottom - this.wall.top;
    }
    get KE() {
        return this.particles.reduce((acc, particle) => acc + particle.KE, 0) / this.particles.length;
    }
    get Temperature() {
        return ParticleSystem.getTemp(this.KE);
    }
    set Temperature(temp) {
        const T0 = this.Temperature;
        if (temp < T0) {
            const factor = Math.sqrt(SETTING.BOLTZMANN * temp / SETTING.MASS) / Math.sqrt(SETTING.BOLTZMANN * this.Temperature / SETTING.MASS);
            this.particles.forEach(particle => {
                particle.vel.mult(factor);
            });
        } else {
            const factor = Math.sqrt(SETTING.BOLTZMANN * temp / SETTING.MASS) - Math.sqrt(SETTING.BOLTZMANN * this.Temperature / SETTING.MASS);
            this.particles.forEach(particle => {
                particle.vel.add(
                    new Vector(...new Array(SETTING.DOF).fill(0).map(_ => randomGaussian(0, 1))).mult(factor)
                );
            });
        }
    }
    static getKE(velSq) {
        return 0.5 * SETTING.MASS * velSq;
    }
    static getTemp(KE) {
        return KE / (2 / (SETTING.DOF) * SETTING.BOLTZMANN);
    }
    resetStat(r = SETTING.RECALL_RATE)
    {
        if (this._dt > 0)
        {
            const dt_ = r * SETTING.UPDATE_RATE;
            this._dp *= dt_ / this._dt;
            this._dt = dt_;
        } else {
            this._dt = this._dp = 0;
        }
    }
    update(deltaTime, n = 1) {
        for (let i = 0; i < n; i++) {
            for (let i = 0; i < this.particles.length; i++) {
                const particle = this.particles[i];
                this._eval_particle(particle);
            }
            for (let i = 0; i < this.particles.length; i++) {
                const particleA = this.particles[i];
                for (let j = i + 1; j < this.particles.length; j++) {
                    const particleB = this.particles[j];
                    this._eval_pair(particleA, particleB);
                }
            }
            this.particles.forEach(b => b.update(deltaTime / n));
            this._dt += deltaTime / n;
        }
        const P = (this._dp / this._dt) / (2 * (this.w + this.h));
        this.Pressure = P;
        if (this._dt > SETTING.UPDATE_RATE)
            this.resetStat();
    }
    /**
     * @param {Particle} particle
     */
    _eval_particle(particle) {
        if ((particle.pos.x < this.wall.left && particle.vel.x < 0)
            || (particle.pos.x > this.wall.right && particle.vel.x > 0)) {
            particle.vel.mult(new Vector(-1, 1));
            this._dp += 2 * Math.abs(particle.vel.x) * SETTING.MASS;
        }
        if ((particle.pos.y < this.wall.top && particle.vel.y < 0)
            || (particle.pos.y > this.wall.bottom && particle.vel.y > 0)) {
            particle.vel.mult(new Vector(1, -1));
            this._dp += 2 * Math.abs(particle.vel.y) * SETTING.MASS;
        }
    }
    /**
     * @param {Particle} particleA
     * @param {Particle} particleB
     */
    _eval_pair(particleA, particleB) {
        const dx = Vector.sub(particleB.pos, particleA.pos);
        const dv = Vector.sub(particleB.vel, particleA.vel);
        if (dx.magSq() == 0)
            return;
        if (dx.mag() < SETTING.RADIUS) {
            if (Vector.dot(dx, dv) < 0) {
                const r = Vector.normalize(dx);
                particleA.vel.add(r.copy().mult(Vector.dot(dv, r)));
                particleB.vel.sub(r.copy().mult(Vector.dot(dv, r)));
            }
        }
    }
}
