// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com
// Wolfram Cellular Automata

// Hanchai Nonprasart Improvisation

// Simple demonstration of a Wolfram 1-dimensional cellular automata

var ca;
const forward=1;
const gen=100;
const bit=64;
const size=5;
const loops=true;
var i=0;
var rule=i;

function setup() {
  if(loops) createCanvas(size*(bit), size*gen*forward);
  else createCanvas(size*(bit+2*gen), size*gen*forward);
  background(100);
  ca = new CA(rule,bit,gen,loops,floor(random()*pow(2,bit)));
}

function draw() {
  ca.display();
  if (ca.generation < ca.h*forward) {
    ca.generate();
  }else{
    noLoop();
    mouseClicked();
  }
}
function mouseClicked() {
  i++;
  rule=i;
  ca=new CA(rule,bit,gen,loops,floor(random()*pow(2,bit)));
    background(100);
  loop();
}
