function Test() {
    this.name = 'Test';
    this.id = 'Test';
    this.xAxisLabel = 'month';
    this.yAxisLabel = '%'
    this.data;
    this.loaded = false;
    this.minTemperature = 0;
    this.maxTemperature = 0;

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

    this.preload = function () {
        var self = this;
        this.data = loadTable(
            './data/surface-temperature/GLB-monthly.csv', 'csv', 'header',
            function (table) {
                self.loaded = true;
            });
    };

    this.setup = function () {
        this.minYear = this.data.getString(0, 'Year');
        this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'Year');
        this.months = this.data.columns.slice(1);
        for (var i = 0; i < this.months.length; i++) {
            this.minTemperature = min(min(this.data.getColumn(this.months[i])), this.minTemperature);
            this.maxTemperature = max(max(this.data.getColumn(this.months[i])), this.maxTemperature);
        }
        this.year = 1
    }

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }


        // loop over all the months
        for (var i = 0; i < this.months.length; i++) {
            var current = {
                month: this.months[i],
                value: this.data.getNum(this.year, this.months[i])
            }
            drawXAxisTickLabel(this.months[i],
                this.layout, this.mapMonthToWidth.bind(this));
            var x = map(i, 0, this.months.length - 1, leftMargin, rightMargin);
            var y = map(current.value, this.minTemperature, this.maxTemperature, bottomMargin, topMargin);
            var barHeight = bottomMargin - y
            var barWidth = (rightMargin - leftMargin) / this.months.length
            // bars
            rect(x, y, barWidth, barHeight)

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
        return map(this.months.indexOf(month), 0, this.months.length - 1, leftMargin, rightMargin);
    }
    this.mapTempToHeight = function (temp) {
        return map(temp, this.minTemperature, this.maxTemperature, bottomMargin, topMargin);
    }

}