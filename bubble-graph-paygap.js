function PayGapByJobNumber() {
    this.name = 'Pay Gap by Job Population';
    this.id = 'pay-gap-job-population';
    this.new = true;
    this.title = 'Pay Gap by Job Population';
    this.bubbles = [];
    this.data = {};
    this.destroy = function () {
        this.bubbles.length = 0;
        this.sizeSlider.remove()
        this.greenColorSlider.remove()
        this.sizeSliderExplainDiv.remove()
        this.colorExplainDiv.remove()
        this.bubbles = [];
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
        topMargin: 140,
        bottomMargin: height - 20,
    };
    var self = this;


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
            function (table) {
                self.maleLoaded = true;
            });

    };

    this.setup = function () {
        if (!this.femaleLoaded && this.maleLoaded) {
            return;
        }

        // put all useful data into this.data object
        this.data = {}
        for (var i = 1; i < this.maleData.getRowCount(); i++) {
            let amount = this.maleData.getNum(i, 'Mean') - this.femaleData.getNum(i, 'Mean')
            let jobNum = this.maleData.getNum(i, 'Number of jobs (thousand)') + this.femaleData.getNum(i, 'Number of jobs (thousand)')
            this.data[this.femaleData.getString(i, 'Description')] = {
                'pay gap amount': amount,
                'Number of jobs': jobNum
            }
        }
        this.payGaps = Object.values(this.data).map(e => e['pay gap amount']);
        this.jobNums = Object.values(this.data).map(e => e['Number of jobs']);
        this.jobs = Object.keys(this.data)
        // ensures that this.data of 0 is the middle point of the color scale
        this.maxSalaryGap = max(this.payGaps)
        this.minSalaryGap = min(-this.maxSalaryGap, min(this.payGaps))
        this.maxSalaryGap = max(this.maxSalaryGap, -this.minSalaryGap)
        // find the min and max of jobNums for bubble size
        this.minJobNum = min(this.jobNums)
        this.maxJobNum = max(this.jobNums)

        // (from helper-function.js) create sliders for user to adjust the size and color of thethis.bubbles
        createSizeColorSliders(this, this.minSalaryGap, this.maxSalaryGap)
        for (var i = 0; i < this.jobs.length; i++) {
            this.bubbles.push(new Bubble(this.jobs[i], this.data[this.jobs[i]], this.layout));
            this.bubbles[i].setSize(this.jobNums[i], this.minJobNum, this.maxJobNum, this.bubbleSizeSliderValue);
            this.bubbles[i].setColor(this.payGaps[i], this.minSalaryGap, this.maxSalaryGap, this.greenColorSliderValue);
        }
    };



    this.draw = function () {
        // update the size and color of thethis.bubbles when the slider value changes
        if (this.sizeSlider.value() != this.bubbleSizeSliderVal) {
            this.bubbleSizeSliderValue = this.sizeSlider.value()
            for (var i = 0; i < this.jobs.length; i++) {
                this.bubbles[i].setSize(this.jobNums[i], this.minJobNum, this.maxJobNum, this.bubbleSizeSliderValue);
            }
        }
        if (this.greenColorSlider.value() != this.greenColorSliderVal) {
            this.greenColorSliderValue = this.greenColorSlider.value()
            for (var i = 0; i < this.jobs.length; i++) {
                this.bubbles[i].setColor(this.payGaps[i], this.minSalaryGap, this.maxSalaryGap, this.greenColorSliderValue);
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