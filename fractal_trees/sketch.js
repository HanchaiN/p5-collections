// Coding Rainbow
// Daniel Shiffman
// http://patreon.com/codingtrain
// Code for: https://youtu.be/fcdNSZ9IzJM

// Hanchai Nonprasart Improvisation

var tree = [];
var leaves = [];
var branch = [];

var count = 0;
const strokemultillier=0.5;

var alpha,beta1,beta2

function setup() {
  alpha=createSlider(-1,1,0,0);
  beta1=createSlider(-1,1,0,0);
  beta2=createSlider(-1,1,0,0);
  createCanvas(500, 500);
  setting();
}
function setting(){
  tree = [];
  leaves = [];
  branch = [];
  count = 0;
  var a = createVector(width / 2, height/2);
  var b = createVector(width / 2, height/2 - 100);
  var root = new Branch(a, b, 0, [
    [
      [alpha.value()*PI, 0.67, 1]
    ],
    [
      [beta1.value()*PI, 0.67, 0],
      [beta2.value()*PI, 0.67, 1]
    ]
  ]);

  tree[0] = root;
  branch=[[]];
}
function increase() {
  for (var i = tree.length - 1; i >= 0; i--) {
    if (!tree[i].finished) {
      var branches = tree[i].branch();
      for (var j = 0; j < branches.length; j++) {
        tree.push(branches[j]);
        branch[i].push(tree.length-1);
        branch.push([]);
      }
    }
    var sum=0;
    for(var j=0;j<branch[i].length;j++){
      sum+=tree[branch[i][j]].size;
    }
    tree[i].size=sum*strokemultillier;
    tree[i].finished = true;
  }
  count++;

  if (tree[tree.length - 1].length <= 1) {
    for (var i = 0; i < tree.length; i++) {
      if (!tree[i].finished) {
        var leaf = tree[i].end.copy();
        leaves.push(leaf);
      }
    }
    return false;
  }
  return true;
}

function keyPressed() {
  if(keyCode-65==18){
    setting();
  }else{
    increase();
  }
}

function draw() {
  background(51);
  for (var i = 0; i < tree.length; i++) {
    tree[i].show();
  }

  for (var i = 0; i < leaves.length; i++) {
    fill(255, 0, 100, 100);
    noStroke();
    ellipse(leaves[i].x, leaves[i].y, 8, 8);
    leaves[i].y += random(0, 2);
  }

}
