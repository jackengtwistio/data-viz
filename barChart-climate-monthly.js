function BarChartClimate() {
    this.name = 'Climate Change Monthly (bar chart)';
    this.id = 'bar-chart-climate';
    this.xAxisLabel = 'month';
    this.yAxisLabel = '%'
    this.data;
    this.loaded = false;
    this.minTemperature = 0;
    this.maxTemperature = 0;
    this.animation = false

    this.layout = {
        marginSize: 35,
        leftMargin: 35 * 2,
        rightMargin: width - 35,
        topMargin: 35,
        bottomMargin: height - 35 * 2,
        pad: 5,
        plotWidth: function () {
            return rightMargin - leftMargin;
        },

        plotHeight: function () {
            return bottomMargin - topMargin;
        },
        grid: false,
        numXTickLabels: 12,
        numYTickLabels: 12,
    }
    var rightMargin = this.layout.rightMargin
    var leftMargin = this.layout.leftMargin
    var bottomMargin = this.layout.bottomMargin
    var topMargin = this.layout.topMargin
    var marginSize = this.layout.marginSize
    var barWidth = 0
    var secretButtonExists = false
    var self = this;




    this.preload = function () {
        this.data = loadTable(
            './data/surface-temperature/GLB-monthly.csv', 'csv', 'header',
            function (table) {
                self.loaded = true;
            });
    };


    this.destroy = function () {
        this.yearIndexSlider.remove();
        this.animButton.remove()
    }

    this.setup = function () {
        this.animButton = createButton('animation')
        this.animButton.position(800, 10)
        this.minYear = this.data.getString(0, 'Year');
        this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'Year');
        this.months = this.data.columns.slice(1);
        // Create slider DOM element. with row number as year value
        this.yearIndexSlider = createSlider(0, this.maxYear - this.minYear);
        this.yearIndexSlider.position(400, 10);
        barWidth = (rightMargin - leftMargin) / this.months.length
        for (var i = 0; i < this.months.length; i++) {
            this.minTemperature = min(min(this.data.getColumn(this.months[i])), this.minTemperature);
            this.maxTemperature = max(max(this.data.getColumn(this.months[i])), this.maxTemperature);
        }
    }

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        this.yearIndex = this.yearIndexSlider.value();
        // Handle animation logic
        this.animButton.mousePressed(() => {
            this.animation = !this.animation
            // store values for later subtraction 
            this.animationStartFrameCount = frameCount
            this.lastIndexOfYear = this.yearIndex
        })
        if (this.animation) {
            // yearIndex changes as the frameCount increases
            // subtract startframecount so the animation counts from the same year last time counted
            this.yearIndex = floor((frameCount - this.animationStartFrameCount) / 10 + this.lastIndexOfYear) % (this.maxYear - this.minYear)
            this.yearIndexSlider.elt.value = this.yearIndex
            if (!secretButtonExists) {
                this.createSecretButton()
            }
        }
        if (!this.animation && secretButtonExists) {
            this.secretButton.remove()
            secretButtonExists = false
        }

        // show the year below year slider
        push()
        textSize(32);
        fill(100);
        stroke(0);
        text(`year: ` + this.data.getNum(this.yearIndex, 0), 230, 50);
        strokeWeight(1);
        pop()

        // loop over all the months
        for (var i = 0; i < this.months.length; i++) {
            var current = {
                month: this.months[i],
                value: this.data.getNum(this.yearIndex, this.months[i])
            }
            drawXAxisTickLabel(this.months[i],
                this.layout, this.mapMonthToWidth.bind(this));

            // bar position, leaving space of marginSize on the left and right of x axis
            var x = map(i, 0, this.months.length - 1, leftMargin + marginSize, rightMargin - barWidth - marginSize);
            var y = map(current.value, this.minTemperature, this.maxTemperature, bottomMargin, topMargin);
            // color reflects current temperature value
            var red = map(current.value, this.minTemperature, this.maxTemperature, 0, 255);
            var blue = map(current.value, this.minTemperature, this.maxTemperature, 255, 0);
            var barHeight = bottomMargin - y
            // draw bars
            fill(red, 0, blue)
            // barWidth - 10 to leave space between bars, x+5 to center the bar
            rect(x + 5, y, barWidth - 10, barHeight)

        }
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        drawYAxisTickLabels(this.minTemperature,
            this.maxTemperature,
            this.layout,
            this.mapTempToHeight.bind(this),
            2);

    }

    this.mapMonthToWidth = function (month) {
        // + barWidth / 2 to center the label
        return map(this.months.indexOf(month), 0, this.months.length - 1, leftMargin + marginSize, rightMargin - barWidth - marginSize) + barWidth / 2;
    }
    this.mapTempToHeight = function (temp) {
        return map(temp, this.minTemperature, this.maxTemperature, bottomMargin, topMargin);
    }
    this.createSecretButton = function () {
        this.secretButton = createA('/3d.html', 'secret world entry', '_blank');
        this.secretButton.position(1220, 20);
        this.secretButton.class("mysterious-button")
        secretButtonExists = true
    }

}