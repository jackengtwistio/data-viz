


function Bubble(_name, _data, _layout) {
    this.name = _name;
    this.data = _data;
    this.layout = _layout;
    this.minSize = 5;
    this.maxSize = 200;
    this.target_size = 0;
    this.size = this.minSize
    this.red = 0
    this.blue = 0
    this.green = 0
    this.displayedName = _name;
    this.textLength = textWidth(this.displayedName);
    this.direction = createVector(0, 0);
    this.pos = createVector(200, 200)
    this.draggedOne = false

    this.draw = function () {
        push();
        textAlign(CENTER);
        noStroke();
        fill(this.red, this.green, this.blue);
        ellipse(this.pos.x, this.pos.y, this.size);
        pop();
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if (d < this.size / 2) {
            this.mouseOvering = true;
            // detect if no other bubble is being dragged, variables from helper-functions.js
            if (mouseDragging && !OneBubbleDragging) {
                this.draggedOne = true
                OneBubbleDragging = true
            }
            // update this bubble pos if it is being dragged
            if (mouseDragging && this.draggedOne && OneBubbleDragging) {
                this.pos.x = mouseX
                this.pos.y = mouseY
            }
            // when mouse is released, update the draggedOne and OneBubbleDragging
            if (!mouseDragging && this.draggedOne) {
                this.draggedOne = false
                OneBubbleDragging = false
            }
        } else {
            this.mouseOvering = false;
        }
        if (this.mouseOvering) {
            // display name and detect text length for adjusting the constrain
            this.displayedName = this.name
            push()
            fill(200); // White background for the label
            noStroke();
            rect(0, 0, this.layout.rightMargin, this.layout.topMargin + 40); // Rounded rectangle for label
            textSize(26);
            fill(0); // Black text
            stroke(255)
            strokeWeight(2);
            textAlign(CENTER, CENTER);
            text(this.displayedName, this.layout.leftMargin + 20 + this.textLength, this.layout.topMargin + 13);
            pop()
        } else {
            this.displayedName = ''
        }
    }

    this.update = function (_bubbles) {
        // bubble remain still when mouse is dragging for easy size comparison betweenthis.bubbles
        if (mouseDragging) {
            return
        }
        this.direction.set(0, 0);
        // move away from otherthis.bubbles
        for (var i = 0; i < _bubbles.length; i++) {
            if (_bubbles[i].name != this.name) {
                var v = p5.Vector.sub(this.pos, _bubbles[i].pos);
                var d = v.mag();
                if (d < this.size / 2 + _bubbles[i].size / 2 + 20) {
                    if (d > 0) {
                        this.direction.add(v)
                    }
                    else {
                        this.direction.add(p5.Vector.random2D());
                    }
                }
            }
        }
        this.direction.normalize();
        this.direction.mult(3);
        this.pos.add(this.direction);

        // constrain the position to the canvas
        var constrainX = constrain(this.pos.x, this.layout.leftMargin + this.size / 2, this.layout.rightMargin - this.size / 2);
        if (this.pos.x < constrainX) {
            this.pos.x += 3
        } else if (this.pos.x > constrainX) {
            this.pos.x--
        }
        var constrainY = constrain(this.pos.y, this.layout.topMargin + this.size / 2 + 45, this.layout.bottomMargin - this.size / 2);
        if (this.pos.y < constrainY) {
            this.pos.y += 3
        } else if (this.pos.y > constrainY) {
            this.pos.y--
        }

        // update size gradually
        if (this.size < this.target_size) {
            this.size += 1;
        }
        else if (this.size > this.target_size) {
            this.size -= 1;
        }

    }


    this.setSize = function (value, min, max, size) {

        this.target_size = map(value, min, max, 20 - size, 200 + 10 * size)
    }
    this.setColor = function (value, min, max, green) {
        this.blue = map(value, min, max, 0, 255)
        this.red = map(value, min, max, 255, 0)
        this.green = green
    }
}
