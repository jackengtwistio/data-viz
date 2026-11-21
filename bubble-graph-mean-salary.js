function MeanPayByJobNumber() {
    this.name = 'Mean Salary by Job Population';
    this.id = 'mean-salary-job-population';
    this.new = true;
    this.bubbles = [];
    this.title = 'Mean Salary by Job Population';
    this.layout = {
        // Locations of margin positions. Left and bottom have double margin
        // size due to axis and tick labels.
        leftMargin: 20,
        rightMargin: width - 20,
        topMargin: 140,
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
        // Reset or empty thethis.bubbles array.
        this.bubbles.length = 0;
        this.sizeSlider.remove()
        this.greenColorSlider.remove()
        this.sizeSliderExplainDiv.remove()
        this.colorExplainDiv.remove()
        this.bubbles = [];
    };

    this.setup = function () {
        if (!this.loaded) {
            return;
        }

        // put all useful data into this.data object
        this.dataObj = {}
        for (var i = 1; i < this.data.getRowCount(); i++) {
            let amount = this.data.getNum(i, 'Mean')
            let jobNum = this.data.getNum(i, 'Number of jobs (thousand)')
            this.dataObj[this.data.getString(i, 'Description')] = {
                'salary amount': amount,
                'Number of jobs': jobNum
            }
        }
        this.salaryAmounts = Object.values(this.dataObj).map(e => e['salary amount']);
        this.jobNums = Object.values(this.dataObj).map(e => e['Number of jobs']);
        this.jobs = Object.keys(this.dataObj)
        // find the min and max of this.data for bubble color
        this.maxSalary = max(this.salaryAmounts)
        this.minSalary = min(this.salaryAmounts)
        // find the min and max of jobNums for bubble size
        this.minJobNum = min(this.jobNums)
        this.maxJobNum = max(this.jobNums)

        // (from helper-function.js) create sliders for user to adjust the size and color of thethis.bubbles
        createSizeColorSliders(this, this.minSalary, this.maxSalary)
        for (var i = 0; i < this.jobs.length; i++) {
            this.bubbles.push(new Bubble(this.jobs[i], this.dataObj[this.jobs[i]], this.layout));
            this.bubbles[i].setSize(this.jobNums[i], this.minJobNum, this.maxJobNum);
            this.bubbles[i].setColor(this.bubbles[i].data['salary amount'], this.minSalary, this.maxSalary);
        }
    };

    this.draw = function () {
        if (this.sizeSlider.value() != this.bubbleSizeSliderVal) {
            this.bubbleSizeSliderValue = this.sizeSlider.value()
            for (var i = 0; i < this.jobs.length; i++) {
                this.bubbles[i].setSize(this.jobNums[i], this.minJobNum, this.maxJobNum, this.bubbleSizeSliderValue);
            }
        }
        if (this.greenColorSlider.value() != this.greenColorSliderVal) {
            this.greenColorSliderValue = this.greenColorSlider.value()
            for (var i = 0; i < this.jobs.length; i++) {
                this.bubbles[i].setColor(this.salaryAmounts[i], this.minSalary, this.maxSalary, this.greenColorSliderValue);
            }
        }
        // update the color of the colorExplainDiv
        this.colorExplainDiv.style('background', `linear-gradient(to right, rgb(0, ${this.greenColorSliderValue}, 255), rgb(255, ${this.greenColorSliderValue}, 0))`);
        for (var i = 0; i < this.bubbles.length; i++) {
            this.bubbles[i].update(this.bubbles);
            this.bubbles[i].draw();
        }
    }
}