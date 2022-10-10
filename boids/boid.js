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

const lim = {
    rng: 100,
    ang: 1 / 3,
    spd: 100,
    del: 0.1,
    sze: 10,
};

class Boid {
    constructor(pos, dir, id, coh, sep, ali, rng, ang, spd, del) {
        this.prop_inherit = {
            id: id,
            coh: coh,
            sep: sep,
            ali: ali,
            rng: rng,
            ang: ang,
            spd: spd,
            del: del,
        };
        this.prop = {
            id: this.prop_inherit.id,
            coh: this.prop_inherit.coh,
            sep: this.prop_inherit.sep,
            ali: this.prop_inherit.ali,
            rng: this.prop_inherit.rng * lim.rng,
            srng: 10,
            ang: this.prop_inherit.ang * PI * lim.ang,
            spd: this.prop_inherit.spd * lim.spd,
            del: this.prop_inherit.del * lim.del,
        };
        this.pos = pos;
        this.dir = dir;
        dir.setMag(this.prop.spd);
        this.hasher = {
            x: floor(1 + this.pos.x / lim.rng),
            y: floor(1 + this.pos.y / lim.rng),
        };
    }
    draw() {
        noStroke();
        fill(0, 0, 100, 0.01);
        // range
        arc(
            this.pos.x,
            this.pos.y,
            2 * this.prop.rng,
            2 * this.prop.rng,
            this.dir.heading() - this.prop.ang,
            this.dir.heading() + this.prop.ang
        );
        fill(240 * this.prop.id, 100, 80, 0.5);
        // main
        circle(this.pos.x, this.pos.y, lim.sze);
        // dir
        line(
            this.pos.x,
            this.pos.y,
            this.pos.x + (lim.sze * this.dir.x) / this.prop.spd,
            this.pos.y + (lim.sze * this.dir.y) / this.prop.spd
        );
    }
    eval(neighbors) {
        this.dir_ = this.dir.copy();
        let inds = [];
        let avgA = createVector();
        let sumA = 1;
        let avgC = createVector();
        let sumC = 1;
        let avgS = createVector();
        let sumS = 1;
        neighbors.forEach((elem, ind) => {
            // let wtS = exp(elem.prop.id-this.prop.id);
            let wtS = 1;
            let r = p5.Vector.sub(elem.pos, this.pos);
            if (
                r.mag() < this.prop.rng &&
                abs(this.dir.angleBetween(r)) < this.prop.ang
            ) {
                inds.push(ind);
            }
            if (r.mag() < this.prop.srng) {
                avgS.sub(p5.Vector.mult(r, wtS));
                sumS += wtS;
            }
        });
        inds.forEach((ind) => {
            let elem = neighbors[ind];
            // let wtA = exp(-sq(this.prop.id-elem.prop.id));
            // let wtC = exp(this.prop.id-elem.prop.id);
            let wtA = 1;
            let wtC = 1;
            let r = p5.Vector.sub(elem.pos, this.pos)
            avgA.add(p5.Vector.mult(p5.Vector.normalize(elem.dir), wtA));
            sumA += wtA;
            avgC.add(p5.Vector.mult(r, wtC));
            sumC += wtC;
        });
        let wt = 1000 * sumS;
        if (this.pos.x < this.prop.srng) {
            avgS.sub(p5.Vector.mult(createVector(-this.pos.x, 0), wt));
            sumS += wt;
        }
        if (this.pos.y < this.prop.srng) {
            avgS.sub(p5.Vector.mult(createVector(0, -this.pos.y), wt));
            sumS += wt;
        }
        if (width - this.pos.x < this.prop.srng) {
            avgS.sub(p5.Vector.mult(createVector(width - this.pos.x, 0), wt));
            sumS += wt;
        }
        if (height - this.pos.y < this.prop.srng) {
            avgS.sub(p5.Vector.mult(createVector(0, height - this.pos.y), wt));
            sumS += wt;
        }
        avgA.mult(this.prop.ali1 / sumA);
        avgC.mult(this.prop.coh / sumC);
        avgS.mult(this.prop.sep / sumS);
        this.dir_.add(avgA);
        this.dir_.add(avgC);
        this.dir_.add(avgS);
        this.dir_.setMag(this.prop.spd);
    }
    update() {
        this.dir = this.dir_;
        delete this.dir_;
        this.pos.add(p5.Vector.mult(this.dir, deltaTime / 1000));
        if (this.pos.x < 0) {
            this.pos.x = width;
        }
        if (this.pos.x > width) {
            this.pos.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = height;
        }
        if (this.pos.y > height) {
            this.pos.y = 0;
        }
        this.hasher = {
            x: floor(1 + this.pos.x / lim.rng),
            y: floor(1 + this.pos.y / lim.rng),
        };
    }
}

class System {
    constructor(w, h, n) {
        this.boids = new Array(n).fill(0).map((_) => {
            let v = p5.Vector.random2D();
            v.setMag(sigm(randomGaussian(0, 1)));
            return new Boid(
                createVector(map(v.x, -1, +1, 0, w), map(v.y, -1, +1, 0, h)),
                p5.Vector.random2D(),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                sigm(randomGaussian(0, 1)),
                random(+0, +1)
            );
        });
    }
    draw() {
        for (let index in this.boids) {
            this.boids[index].draw();
        }
    }
    update() {
        push();
        for (let index in this.boids) {
            this.boids[index].eval(this.boids);
        }
        for (let index in this.boids) {
            this.boids[index].update();
        }
        pop();
    }
}
