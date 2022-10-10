class bf {
    constructor(str) {
        this.ram = new Array(30000).fill(null).map((_) => new Array(8).fill(false));
        this.ptr = 0;
        this.prog = str;
        this.pptr = -1;
        this.stack = [];
    }

    eval(val = null) {
        this.pptr += 1;
        if (typeof this.prog[this.pptr] === 'undefined')
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
                return this.inp();
            default:
        }
    }

    opt() {
        return this.ram[this.ptr].reduceRight((acc, curr) => (acc << 1) | curr, 0);
    }
    inp(val) {
        this.ram[this.ptr] = this.ram[this.ptr].map(
            (_, ind) => (val & (0b1 << ind)) >> ind === 0b1
        );
    }
    inc() {
        this.inp(this.opt() + 1);
    }
    dec() {
        this.inp(this.opt() - 1);
    }
    nxt() {
        this.ptr += 1;
        this.ptr %= 30000;
    }
    pre() {
        this.ptr -= 1;
        this.ptr %= 30000;
    }
    lin() {
        this.stack.push(this.pptr);
    }
    lot() {
        this.pptr = this.stack.pop();
        if (this.opt() !== 0) {
            this.lin();
        }
    }
}

let sys = new bf(
    "++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++."
);

function setup() {
    createCanvas(480, 500);
}

function draw() {
    background(0);
    let c_on = color(0, 192, 0);
    let c_off = color(0, 48, 0);
    let c_ptr_on = color(192, 0, 0);
    let c_ptr_off = color(48, 0, 0);
    for (let x = 0; x < 60; x += 1) {
        for (let y = 0; y < 500; y += 1) {
            let index = y * 50 + x;
            for (let b = 0; b < 8; b += 1) {
                let c =
                    sys.ptr === index
                        ? sys.ram[index][b]
                            ? c_ptr_on
                            : c_ptr_off
                        : sys.ram[index][b]
                            ? c_on
                            : c_off;
                set(x * 8 + b, y, c);
            }
        }
    }
    updatePixels();
    let res = sys.eval(0);
    if (res === "halt") noLoop();
    if (res) print(res);
}
