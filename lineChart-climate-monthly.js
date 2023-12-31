function ClimateChangeMonthly() {
    this.name = 'Climate Change Monthly';
    this.id = 'climate-change-monthly';
    // label x y axes, but an empty label for y is enough
    this.xAxisLabel = 'month';
    this.yAxisLabel = ''
    this.data = null;
    this.loaded = false;
    this.minTemperature = Infinity;
    this.maxTemperature = -Infinity;
    this.select1edYear = null;

    this.layout = {
        marginSize: 35,
        leftMargin: 35 * 2,
        rightMargin: width - 35,
        topMargin: 35,
        bottomMargin: height - 35 * 2,
        pad: 5,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },
        grid: true,
        numXTickLabels: 12,
        numYTickLabels: 12,
    }

    this.preload = function () {
        var self = this;
        this.data = loadTable(
            './data/surface-temperature/GLB-monthly.csv', 'csv', 'header',
            function (table) {
                self.loaded = true;
            });
    };

    this.setup = function () {
        this.year = this.data.getColumn('Year')
        // create two DOM elements for user to select1 the year and compare the two line generated.
        this.select1 = createSelect();
        this.select2 = createSelect();
        for (var i = 0; i < this.year.length; i++) {
            this.select1.option(this.year[i]);
            this.select2.option(this.year[i]);
        }
        this.select1.position(1530, 50);
        this.select2.position(1530, 50);
        // set color and default value to distinguish the two
        this.select1.style('color', 'blue')
        this.select2.style('color', 'red')
        this.select2.value(2000)

        this.minYear = this.data.getString(0, 'Year');
        this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'Year');
        this.months = this.data.columns.slice(1);
        for (var i = 0; i < this.months.length; i++) {
            this.minTemperature = min(min(this.data.getColumn(this.months[i])), this.minTemperature);
            this.maxTemperature = max(max(this.data.getColumn(this.months[i])), this.maxTemperature);
        }

    }

    this.destroy = function () {
        this.select1.remove();
        this.select2.remove();
    };

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }
        // get the year select1ed by user
        var yearSelected1 = this.select1.value();
        var yearSelected2 = this.select2.value();
        // track current and previous month in the loop
        var previousMonth1 = null;
        var currentMonth1 = null;
        var previousMonth2 = null;
        var currentMonth2 = null;
        // loop over all the months
        for (var i = 0; i < this.months.length; i++) {
            currentMonth1 = {
                month: this.months[i],
                value: this.data.getNum(yearSelected1 - this.minYear, this.months[i])
            }
            currentMonth2 = {
                month: this.months[i],
                value: this.data.getNum(yearSelected2 - this.minYear, this.months[i])
            }
            drawXAxisTickLabel(this.months[i],
                this.layout, this.mapMonthToWidth.bind(this));
            currentMonth1.x = map(i, 0, this.months.length - 1, this.layout.leftMargin, this.layout.rightMargin);
            currentMonth1.y = map(currentMonth1.value, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin);
            currentMonth2.x = map(i, 0, this.months.length - 1, this.layout.leftMargin, this.layout.rightMargin);
            currentMonth2.y = map(currentMonth2.value, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin);
            // var barHeight = this.layout.bottomMargin - y
            stroke(0);
            if (previousMonth1 != null) {
                stroke(0, 0, 251)
                line(previousMonth1.x, previousMonth1.y, currentMonth1.x, currentMonth1.y);
            }
            if (previousMonth2 != null) {
                stroke(251, 0, 0)
                line(previousMonth2.x, previousMonth2.y, currentMonth2.x, currentMonth2.y);
            }
            rect(currentMonth1.x + 2, currentMonth1.y - 2, 4, 4)
            rect(currentMonth2.x + 2, currentMonth2.y - 2, 4, 4)
            previousMonth1 = currentMonth1;
            previousMonth2 = currentMonth2;
        }
        // the select1 element appears at right side of the line on the chart
        this.select1.position(1530, previousMonth1.y - 10);
        this.select2.position(1530, previousMonth2.y - 10);


        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        drawYAxisTickLabels(this.minTemperature,
            this.maxTemperature,
            this.layout,
            this.mapTempToHeight.bind(this),
            2);
        drawAxis(this.layout);

    }

    this.mapMonthToWidth = function (month) {
        return map(this.months.indexOf(month), 0, this.months.length - 1, this.layout.leftMargin, this.layout.rightMargin);
    }
    this.mapTempToHeight = function (temp) {
        return map(temp, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin);
    }

}