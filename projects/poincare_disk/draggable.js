import { Vector } from "../utils/math.js";
export class Draggable {
    static p;
    get p() { return this.constructor.p; };
    constructor(r) {
        this.dragging = false; // Is the object being dragged?
        this.rollover = false; // Is the mouse over the ellipse?
        this.x = 0;
        this.y = 0;
        this.r = r;
        this.offsetX = 0;
        this.offsetY = 0;
        this.Ox = 0;
        this.Oy = 0;
        this.R = 0;
    }

    over() {
        // Is mouse over object
        if (this.p.mouseX > this.x - this.r && this.p.mouseX < this.x + this.r && this.p.mouseY > this.y - this.r && this.p.mouseY < this.y + this.r) {
            this.rollover = true;
        } else {
            this.rollover = false;
        }
    }

    update() {
        // Adjust location if being dragged
        if (this.dragging) {
            this.x = this.p.mouseX + this.offsetX;
            this.y = this.p.mouseY + this.offsetY;
            let vec = new Vector(this.x - this.Ox, this.y - this.Oy);
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
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    show() {
        this.p.strokeWeight(10);
        // Different fill based on state
        if (this.dragging) {
            this.p.stroke(50);
        } else if (this.rollover) {
            this.p.stroke(100);
        } else {
            this.p.stroke(175, 200);
        }
        this.p.point(this.x, this.y);
    }

    pressed() {
        // Did I click on the rectangle?
        if (this.p.mouseX > this.x - this.r && this.p.mouseX < this.x + this.r && this.p.mouseY > this.y - this.r && this.p.mouseY < this.y + this.r) {
            this.dragging = true;
            // If so, keep track of relative location of click to corner of rectangle
            this.offsetX = this.x - this.p.mouseX;
            this.offsetY = this.y - this.p.mouseY;
        }
    }

    released() {
        // Quit dragging
        this.dragging = false;
    }
}