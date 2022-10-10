// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>

class Draggable {
    constructor(x, y, r, Ox, Oy, R) {
        this.dragging = false; // Is the object being dragged?
        this.rollover = false; // Is the mouse over the ellipse?
        this.x = x;
        this.y = y;
        this.r = r;
        this.offsetX = 0;
        this.offsetY = 0;
        this.Ox = Ox;
        this.Oy = Oy;
        this.R = R;
    }

    over() {
        // Is mouse over object
        if (mouseX > this.x - this.r && mouseX < this.x + this.r && mouseY > this.y - this.r && mouseY < this.y + this.r) {
            this.rollover = true;
        } else {
            this.rollover = false;
        }
    }

    update() {
        // Adjust location if being dragged
        if (this.dragging) {
            this.x = mouseX + this.offsetX;
            this.y = mouseY + this.offsetY;
            var vec = new p5.Vector(this.x - this.Ox, this.y - this.Oy);
            if (vec.mag() > this.R) {
                vec.setMag(this.R);
            }
            this.x = vec.x + this.Ox;
            this.y = vec.y + this.Oy;
        }
    }
    setOffset(Ox, Oy, r) {
        this.x = ((this.x - this.Ox) / this.R) * r + Ox;
        this.y = - ((- this.y + this.Oy) / this.R) * r + Oy;
        this.Ox = Ox;
        this.Oy = Oy;
        this.R = r;
    }

    show() {
        strokeWeight(10);
        // Different fill based on state
        if (this.dragging) {
            stroke(50);
        } else if (this.rollover) {
            stroke(100);
        } else {
            stroke(175, 200);
        }
        point(this.x, this.y);
    }

    pressed() {
        // Did I click on the rectangle?
        if (mouseX > this.x - this.r && mouseX < this.x + this.r && mouseY > this.y - this.r && mouseY < this.y + this.r) {
            this.dragging = true;
            // If so, keep track of relative location of click to corner of rectangle
            this.offsetX = this.x - mouseX;
            this.offsetY = this.y - mouseY;
        }
    }

    released() {
        // Quit dragging
        this.dragging = false;
    }
}