export class Grid {
    constructor(init, d, r) {
        // assume x:(x,y);
        // assume s:(b,w);
        // q~(x,R)->(s)
        // q(x,t) = grid[x]
        this.grid = init;
        // d~(s,s)
        // D[k][k]...[k] = diff[k]
        this.diff = d;
        // R~[(s)->(s)]
        // R(x) = reac[x]
        this.reac = r;
    }
    calc(dt) {
        // Changes -> diffused + reacted
        // (dq(x)/dt)(t) = D*sum(d^2(q(t))/dx_i^2)(x) + R(q(x,t));
        // dy/dx = (x+d) - (x-d) / 2d
        // d2y/dx2 = (x+d+d)-(x+d-d)/2d - (x-d+d)-(x-d-d)/2d /2d
        // d2y/dx2 = (x+d+d)-2(x)+(x-d-d) /4dd
        // q' = q + dt (D[i]*sum(q(x++)-2q(x)+q(x--))/4dd + R(q));
        // q' = q + dt (D[i]*sum(q(x++)-2q(x)+q(x--)) + R(q));
        let grid = [];

        grid.push(this.grid[0]);
        grid.push(this.grid[1]);
        // x_0
        for (let i = 2; i < this.grid.length - 2; i += 1) {
            grid.push([]);
            grid[i].push(this.grid[i][0]);
            grid[i].push(this.grid[i][1]);
            // x_1
            for (let j = 2; j < this.grid[i].length - 2; j += 1) {
                grid[i].push([]);
                let react = this.reac(this.grid[i][j]);
                // s
                for (let k = 0; k < this.grid[i][j].length; k += 1) {
                    // let lamb =
                    //   // X
                    //   (this.grid[i + 2][j][k] +
                    //   this.grid[i - 2][j][k] -
                    //   2 * this.grid[i][j][k]) +
                    //   // Y
                    //   (this.grid[i][j + 2][k] +
                    //   this.grid[i][j - 2][k] -
                    //   2 * this.grid[i][j][k]);
                    let lamb = 0;
                    lamb += this.grid[i][j][k] * -3;
                    lamb += this.grid[i - 1][j][k] * 0.5;
                    lamb += this.grid[i + 1][j][k] * 0.5;
                    lamb += this.grid[i][j + 1][k] * 0.5;
                    lamb += this.grid[i][j - 1][k] * 0.5;
                    lamb += this.grid[i - 1][j - 1][k] * 0.25;
                    lamb += this.grid[i + 1][j - 1][k] * 0.25;
                    lamb += this.grid[i + 1][j + 1][k] * 0.25;
                    lamb += this.grid[i - 1][j + 1][k] * 0.25;
                    lamb /= 3;
                    let constrain = (v, min, max) => Math.min(max, Math.max(min, v));
                    grid[i][j].push(
                        constrain(this.grid[i][j][k] + dt * (this.diff[k] * lamb + react[k]), 0, 1)
                    );
                }
            }
            grid[i].push(this.grid[i][this.grid[i].length - 2]);
            grid[i].push(this.grid[i][this.grid[i].length - 1]);
        }
        grid.push(this.grid[this.grid.length - 2]);
        grid.push(this.grid[this.grid.length - 1]);
        this.grid = grid;
        return;
    }
}
