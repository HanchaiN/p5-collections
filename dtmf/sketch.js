let oscl,osch;
const oscl_f = [697, 770, 852, 941];
const osch_f = [1209, 1336, 1477, 1633];
const keypad = [
  ["1", "2", "3", "a"],
  ["4", "5", "6", "b"],
  ["7", "8", "9", "c"],
  ["*", "0", "#", "d"],
]

function setup(){
  createCanvas(100,100)
  oscl=new p5.Oscillator('sine');
  osch=new p5.Oscillator('sine');
  oscl.amp(0, 0);
  osch.amp(0, 0);
}
function draw(){
  background(255);
}

function keyPressed(){
  oscl.start();
  osch.start();
  let indl, indh;
  for(indl = 0; indl < keypad.length; indl++) {
    for(indh = 0; indh < keypad[indl].length; indh++) {
      if (key === keypad[indl][indh]) {
        break;
      }
    }
    if (indh < keypad[indl].length) {
      break;
    }
  }
  if(indl < keypad.length) {
    oscl.freq(oscl_f[indl], 0);
    oscl.amp(1, 0.1);
    osch.freq(osch_f[indh], 0);
    osch.amp(1, 0.1);
  oscl.amp(0, 0.1);
  osch.amp(0, 0.1);
  }
}
