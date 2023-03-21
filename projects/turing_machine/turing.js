// {
//   states: State[]
//   symbols: Symbol[]
//   null_symbol: Symbol
//   operation_table: {[state: State]: {[symbol: Symbol]: {state: State, symbol: Symbol, direction: "R"|"L"|"N"}}}
//   initial_state: State
// }
export class TuringMachine {
  constructor(rule) {
    if (
      rule.states.length == 0 ||
      rule.symbols.length == 0 ||
      !rule.symbols.includes(rule.null_symbol) ||
      !rule.states.includes(rule.initial_state)
    ) {
      this.error();
      return false;
    }
    this.rule = rule;
  }
  init(inp) {
    this.pointer = 0;
    this.state = this.rule.initial_state;
    if (
      !inp.every(function (symbol) {
        return this.rule.symbols.include(symbol);
      })
    ) {
      this.error();
      return false;
    }
    this.tape = inp;
    this.tape.push(this.rule.null_symbol);
  }
  read(index) {
    while (index < 0) {
      this.tape = [].concat(new Array(this.tape.length).fill(0).map(_ => this.rule.null_symbol), this.tape);
      this.pointer += this.tape.length;
      index += this.tape.length;
    }
    while (index >= this.tape.length) {
      this.tape = [].concat(this.tape, new Array(this.tape.length).fill(0).map(_ => this.rule.null_symbol));
    }
    return this.tape[index];
  }
  calculate() {
    let ins = this.rule.operation_table[this.state]?.[this.read(this.pointer)];
    if (!ins) {
      console.log("HALTED");
      return false;
    }
    if (
      !this.rule.states.includes(ins.state) ||
      !this.rule.symbols.includes(ins.symbol) ||
      !["L", "R", "N"].includes(ins.direction)
    ) {
      this.error();
      return false;
    }
    this.tape[this.pointer] = ins.symbol;
    switch (ins.direction) {
      case "R":
        this.pointer--;
        break;
      case "L":
        this.pointer++;
        break;
      case "N":
        break;
    }
    this.state = ins.state;
    return true;
  }
  error() {
    console.error("ERROR");
  }
}
