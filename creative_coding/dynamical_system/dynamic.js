import { Vector } from "../utils/math.js";

export class State {
    static options = {
        rk: {
            a: [
                [],
                [1 / 2],
                [0, 1 / 2],
                [0, 0, 1],
            ],
            b: [1 / 6, 1 / 3, 1 / 3, 1 / 6],
            c: [0, 1 / 2, 1 / 2, 1], // a.map(_ => _.reduce((acc, curr) => acc + curr, 0))
        }
    };
    constructor(state) {
        this._state = [Vector.copy(state)];
    }
    get dim() {
        return this._state[0].dim;
    }
    get order() {
        return 1;
    }
    get state() {
        return this._state.map(v => Vector.copy(v));
    }
    update(func, t, dt) {
        // Runge-Kutta methods
        const k = [];
        const delta = Vector.zero(this.dim);
        State.options.rk.b.forEach((bi, i) => {
            const state_ = Vector.copy(this.state[0]);
            k.forEach((kj, j) => {
                if (State.options.rk.a[i][j] !== 0)
                    state_.add(Vector.copy(kj).mult(State.options.rk.a[i][j] * dt));
            });
            const ki = func(t + State.options.rk.c[i] * dt, [state_]);
            k.push(ki);
            delta.add(Vector.copy(ki).mult(bi));
        })
        this._state[0].add(delta.mult(dt));
    }
}

export class HigherOrderState extends State {
    constructor(...state) {
        super(state[0]);
        if (state.length === 0 || state.some(v => v.dim !== state[0].dim))
            throw new Error();
        this._state = state.map(v => Vector.copy(v));
    }
    get dim() {
        return this._state[0].dim;
    }
    get order() {
        return this._state.length;
    }
    set order(order) {
        if (order > this.order)
            this._state.push(...new Array(order - this.order).fill(0).map(_ => Vector.zero(this.dim)));
        else
            this._state = this._state.slice(0, order + 1);
    }
    update(func, t, dt) {
        // Euler methods
        const der = func(t, this.state);
        this._state.forEach((v, i) => {
            if (i === this.order - 1)
                v.add(Vector.copy(der).mult(dt));
            else
                v.add(this.getAt(i + 1).mult(dt));
        });
    }
}