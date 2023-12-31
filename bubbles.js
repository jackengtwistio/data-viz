var bubbles = [];

function MeanPayByJobNumber() {
    this.name = 'Mean Salary by Job Population';
    this.id = 'mean-salary-job-population';
    this.title = 'Mean Salary by Job Population';
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: 20,
        rightMargin: width - 20,
        topMargin: 20,
        bottomMargin: height - 20,
    };
    var self = this;
    this.loaded = false;

    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        this.data = loadTable(
            './data/pay-gap/occupation-hourly-pay.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.loaded = true;
            });
    };

    this.destroy = function () {
        // Reset or empty the bubbles array.
        bubbles.length = 0;
    };

    this.setup = function () {
        // Font defaults.
        textSize(26);
        if (!this.loaded) {
            return;
        }

        // put all useful data into salaries object
        const salaries = {}
        for (var i = 1; i < this.data.getRowCount(); i++) {
            let amount = this.data.getNum(i, 'Mean')
            let jobNum = this.data.getNum(i, 'Number of jobs (thousand)')
            salaries[this.data.getString(i, 'Description')] = {
                'salary amount': amount,
                'Number of jobs': jobNum
            }
        }
        let salaryAmounts = Object.values(salaries).map(insideObj => insideObj['salary amount']);
        let jobNums = Object.values(salaries).map(insideObj => insideObj['Number of jobs']);
        let jobs = Object.keys(salaries)
        // find the min and max of salaries for bubble color
        let maxSalary = max(salaryAmounts)
        let minSalary = min(salaryAmounts)
        // find the min and max of jobNums for bubble size
        let minJobNum = min(jobNums)
        let maxJobNum = max(jobNums)

        for (var i = 0; i < jobs.length; i++) {
            bubbles.push(new Bubble(jobs[i], salaries[jobs[i]], this.layout));
            bubbles[i].setSize(jobNums[i], minJobNum, maxJobNum);
            bubbles[i].setColor(bubbles[i].data['salary amount'], minSalary, maxSalary);
        }
    };

    this.draw = function () {
        for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }
    }
}

function PayGapByJobNumber() {
    this.name = 'Pay Gap by Job Population';
    this.id = 'pay-gap-job-population';
    this.title = 'Pay Gap by Job Population';
    this.destroy = function () {
        bubbles.length = 0;
    }
    this.femaleLoaded = false;
    this.maleLoaded = false;
    // Layout object to store all common plot layout parameters and
    // methods.
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: 20,
        rightMargin: width - 20,
        topMargin: 20,
        bottomMargin: height - 20,
    };
    var self = this;

    // Property to represent whether data has been loaded.


    // Preload the data. This function is called automatically by the
    // gallery when a visualisation is added.
    this.preload = function () {
        this.femaleData = loadTable(
            './data/pay-gap/hourly-pay-female.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.femaleLoaded = true;
            });
        this.maleData = loadTable(
            './data/pay-gap/hourly-pay-male.csv', 'csv', 'header',
            // Callback function to set the value
            // this.loaded to true.
            function (table) {
                self.maleLoaded = true;
            });

    };

    this.setup = function () {
        // Font defaults.
        textSize(24);
        if (!this.femaleLoaded && this.maleLoaded) {
            return;
        }

        // put all useful data into payGap object
        const payGap = {}
        for (var i = 1; i < this.maleData.getRowCount(); i++) {
            let amount = this.maleData.getNum(i, 'Mean') - this.femaleData.getNum(i, 'Mean')
            let jobNum = this.maleData.getNum(i, 'Number of jobs (thousand)') + this.femaleData.getNum(i, 'Number of jobs (thousand)')
            payGap[this.femaleData.getString(i, 'Description')] = {
                'pay gap amount': amount,
                'Number of jobs': jobNum
            }
        }
        let payGapAmounts = Object.values(payGap).map(insideObj => insideObj['pay gap amount']);
        let jobNums = Object.values(payGap).map(insideObj => insideObj['Number of jobs']);
        let jobs = Object.keys(payGap)
        // ensures that paygap of 0 is the middle point of the color scale
        let maxSalaryGap = max(payGapAmounts)
        let minSalaryGap = min(-maxSalaryGap, min(payGapAmounts))
        maxSalaryGap = max(maxSalaryGap, -minSalaryGap)
        // find the min and max of jobNums for bubble size
        let minJobNum = min(jobNums)
        let maxJobNum = max(jobNums)

        for (var i = 0; i < jobs.length; i++) {
            bubbles.push(new Bubble(jobs[i], payGap[jobs[i]], this.layout));
            bubbles[i].setSize(jobNums[i], minJobNum, maxJobNum);
            bubbles[i].setColor(payGapAmounts[i], minSalaryGap, maxSalaryGap);
        }
    };



    this.draw = function () {
        for (var i = 0; i < bubbles.length; i++) {
            bubbles[i].update(bubbles);
            bubbles[i].draw();
        }
    }
}


function Bubble(_name, _data, _layout) {
    // console.log('bubble data', this.data, this.name)
    this.name = _name;
    this.data = _data;
    this.layout = _layout;
    this.minSize = 5;
    this.maxSize = 200;
    this.target_size = 0;
    this.size = this.minSize
    this.red = 0
    this.blue = 0
    this.displayedName = _name;
    this.mouseOvering = false;
    this.textLength = textWidth(this.displayedName);
    this.direction = createVector(0, 0);
    this.pos = createVector(random(this.layout.leftMargin + this.textLength), random(this.layout.topMargin + this.textLength))

    this.draw = function () {
        push();
        textAlign(CENTER);
        noStroke();
        fill(this.red, 0, this.blue);
        ellipse(this.pos.x, this.pos.y, this.size);
        // \\\\\\
        let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
        if (d < this.size / 2) {
            this.mouseOvering = true;
        } else {
            this.mouseOvering = false;
        }
        if (this.mouseOvering) {
            // display name and detect text length for adjusting the constrain
            this.displayedName = this.name
            fill(200); // White background for the label
            noStroke();
            rect(0, 0, this.layout.rightMargin, this.layout.topMargin + 40); // Rounded rectangle for label
            textSize(26);
            fill(0); // Black text
            stroke(255)
            strokeWeight(2);
            textAlign(CENTER, CENTER);
            console.log(this.data)
            console.log(this.name)
            text(this.displayedName, this.layout.leftMargin + 20 + this.textLength / 2, this.layout.topMargin + 13);
        } else {
            this.displayedName = ''
        }
    }

    this.update = function (_bubbles) {
        this.direction.set(0, 0);
        // move away from other bubbles
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

    this.setSize = function (value, min, max) {
        this.target_size = map(value, min, max, 5, 200)
    }
    this.setColor = function (value, min, max) {
        this.blue = map(value, min, max, 0, 255)
        this.red = map(value, min, max, 255, 0)
    }
}