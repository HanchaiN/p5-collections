// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// Wolfram Cellular Automata

// Hanchai Nonprasart Improvisation

// CA object prototype

function CA(rule,wid,heig,lop,filler) {
  var i;
  this.w = wid;
  this.h = heig;
  this.loop=lop;
  // An array of 0s and 1s
  if(lop){
     this.cells = new Array(this.w);
     }else{
  this.cells = new Array(this.w+2*this.h);
  }
  for (i = 0; i < this.cells.length; i++) {
    this.cells[i] = 0;
  }
   // We arbitrarily start with just the middle cell having a state of "1"
  var fil=filler;
  for (i = 0; i < this.cells.length; i++) {
    if((i>this.h&&i<this.cells.length-this.h)||lop){
    this.cells[i] = fil%2;
    fil=floor(fil/2);
    }
  }
  this.cells.reverse();
  this.generation = 0;
  this.ruleset = [];
  var rul=rule;
  for(var j=0;j<8;j++){
    this.ruleset.push(rul%2);
    rul=floor(rul/2);
  }
  this.ruleset.reverse();
  // The process of creating the new generation
  this.generate = function() {
    // First we create an empty array filled with 0s for the new values
    var nextgen = [];
    for (i = 0; i < this.cells.length; i++) {
      nextgen[i] = 0;
    }
    var left;
    var me;
    var right;
    if(this.loop){
    for (i = 0; i < this.cells.length; i++) {
      left   = this.cells[(i+this.cells.length-1)%(this.cells.length)];   // Left neighbor state
      me     = this.cells[(i+this.cells.length)%(this.cells.length)];     // Current state
      right  = this.cells[(i+this.cells.length+1)%(this.cells.length)];   // Right neighbor state
      nextgen[i] = this.rules(left, me, right,this.ruleset); // Compute next generation state based on ruleset
    }
    }else{
    // For every spot, determine new state by examing current state, and neighbor states
    // Ignore edges that only have one neighor
      for (i = 1; i < this.cells.length-1; i++) {
      left   = this.cells[(i-1)];   // Left neighbor state
      me     = this.cells[(i)];     // Current state
      right  = this.cells[(i+1)];   // Right neighbor state
      nextgen[i] = this.rules(left, me, right,this.ruleset); // Compute next generation state based on ruleset
    }
    }
    // The current generation is the new generation
    this.cells = nextgen;
    this.generation++;
    if(this.generation==this.h){
      var result;
      if(!lop) result=this.cells.slice(this.h,-this.h);
      else result=this.cells;
    }
  };

  // This is the easy part, just draw the cells
  this.display = function() {
  	for (var i = 0; i < this.cells.length; i++) {
      var j=0;
  		if (this.cells[i] == 1) j+=50;
  		else                    j-=50;
        if (this.generation<=this.h) j*=2;
        if (this.generation<=3*this.h) j*=1.5;
        if ((i<this.h||i>this.cells.length-this.h)&&!lop) j*=0.5;
      fill(j+100);
  		noStroke();
  		if(lop) rect(i*width/(this.w), this.generation*height/(this.h*forward), width/(this.w), height/(this.h*forward));
        else rect(i*width/(this.w+2*this.h), this.generation*height/(this.h*forward), width/(this.w+2*this.h), height/(this.h*forward));
  	}
  };
  // Implementing the Wolfram rules
  // Could be improved and made more concise, but here we can explicitly see what is going on for each case
  this.rules = function(a, b, c,rule) {
    if((1-a)*4+(1-b)*2+(1-c)>=0&&(1-a)*4+(1-b)*2+(1-c)<rule.length){
      return this.ruleset[(1-a)*4+(1-b)*2+(1-c)];
    }else{
      return 0;
  }
  };
}
