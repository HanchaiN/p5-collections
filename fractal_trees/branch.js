function Branch(begin, end, type,rule) {
  this.init=rule;
  this.begin = begin;
  this.end = end;
  this.type=type;
  this.finished = false;
  this.size=1;

  this.show = function() {
    stroke(255);
    strokeWeight(this.size);
    line(this.begin.x, this.begin.y, this.end.x, this.end.y);
  }
  this.length = function() {
    var l = p5.Vector.sub(this.end, this.begin);
    return l.mag();
  }
  this.branch = function() {
    var branch=[];
    for(var i=0;i<this.init[this.type].length;i++){
      var dir = p5.Vector.sub(this.end, this.begin);
      dir.rotate(this.init[this.type][i][0]);
      dir.mult(this.init[this.type][i][1]);
      var newEnd = p5.Vector.add(this.end, dir);
      var b = new Branch(this.end, newEnd, this.init[this.type][i][2],this.init);
      branch.push(b);
    }
    return branch;
  }
}
