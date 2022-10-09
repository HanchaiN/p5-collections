function mirrorrule(rule) {
  var ruleset = [];
  var rul = rule;
  for (var j = 0; j < 8; j++) {
    ruleset.push(rul % 2);
    rul = Math.floor(rul / 2);
  }
  ruleset.reverse();
  var mirrrul = 0;
  for (var j = 0; j < 8; j++) {
    mirrrul *= 2;
    var z = "000";
    var compid = parseInt(z.concat(j.toString(2)).split("").reverse().slice(0, 3).join(""), 2);
    mirrrul += ruleset[compid];
  }
  return mirrrul;
}

function complementrule(rule) {
  var ruleset = [];
  var rul = rule;
  for (var j = 0; j < 8; j++) {
    ruleset.push(rul % 2);
    rul = Math.floor(rul / 2);
  }
  ruleset.reverse();
  var comprul = 0;
  for (var j = 0; j < 8; j++) {
    comprul *= 2;
    var z = "000";
    var compid = parseInt(z.concat(j.toString(2)).split("").map(function not(n) {
      if (n == "1") {
        return "0";
      } else {
        return "1";
      }
    }).reverse().slice(0, 3).reverse().join(""), 2);
    comprul += 1 - ruleset[compid];
  }
  return comprul;
}

function mirrorcomplementrule(rule) {
  var ruleset = [];
  var rul = rule;
  for (var j = 0; j < 8; j++) {
    ruleset.push(rul % 2);
    rul = Math.floor(rul / 2);
  }
  ruleset.reverse();
  var comprul = 0;
  for (var j = 0; j < 8; j++) {
    comprul *= 2;
    var z = "000";
    var compid = parseInt(z.concat(j.toString(2)).split("").map(function not(n) {
      if (n == "1") {
        return "0";
      } else {
        return "1";
      }
    }).reverse().slice(0, 3).join(""), 2);
    comprul += 1 - ruleset[compid];
  }
  return comprul;
}

function outertotalistic(ot) {
  var ruleset = [];
  var rul = ot;
  for (var j = 0; j < 6; j++) {
    ruleset.push(rul % 2);
    rul = Math.floor(rul / 2);
  }
  ruleset.reverse();
  var ruls = 0;
  for (var j = 0; j < 8; j++) {
    ruls *= 2;
    var z = "000";
    var neighbors = z.concat(j.toString(2)).split("").reverse().slice(0, 3);
    var id = 0;
    if (neighbors[0]==="1") {
      id += 2;
    }
    if (neighbors[1]==="1") {
      id += 1;
    }
    if (neighbors[2]==="1") {
      id += 2;
    }
    ruls += ruleset[id];
  }
  console.log(ruls);
  return ruls;
}
