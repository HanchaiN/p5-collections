export class BrainfuckEngine {
    constructor(str) {
        this.ram = new Array(30000).fill(null).map((_) => new Array(8).fill(false));
        this.ptr = 0;
        this.prog = str;
        this.pptr = -1;
        this.stack = [];
    }

    eval(val = null) {
        this.pptr += 1;
        if (typeof this.prog[this.pptr] === "undefined")
            return "HALTED"
        switch (this.prog[this.pptr]) {
            case "+":
                return this.inc();
            case "-":
                return this.dec();
            case ">":
                return this.nxt();
            case "<":
                return this.pre();
            case "[":
                return this.lin();
            case "]":
                return this.lot();
            case ".":
                return this.opt();
            case ",":
                return this.inp(val);
            default:
                return null;
        }
    }

    opt() {
        return this.ram[this.ptr].reduceRight((acc, curr) => (acc << 1) | curr, 0);
    }
    inp(val) {
        this.ram[this.ptr] = this.ram[this.ptr].map(
            (_, ind) => (val & (0b1 << ind)) >> ind === 0b1
        );
        return null;
    }
    inc() {
        this.inp(this.opt() + 1);
        return null;
    }
    dec() {
        this.inp(this.opt() - 1);
        return null;
    }
    nxt() {
        this.ptr += 1;
        this.ptr += this.ram.length;
        this.ptr %= this.ram.length;
        return null;
    }
    pre() {
        this.ptr -= 1;
        this.ptr += this.ram.length;
        this.ptr %= this.ram.length;
        return null;
    }
    lin() {
        this.stack.push(this.pptr);
        return null;
    }
    lot() {
        this.pptr = this.stack.pop();
        if (this.opt() !== 0) {
            this.lin();
        }
        return null;
    }
}