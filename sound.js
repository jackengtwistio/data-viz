function Sound() {
    var self = this
    this.name = 'Climate Chnge Monthly';
    this.id = 'climate-chage-monthly';
    this.xAxisLabel = 'Month';
    this.yAxisLabel = 'Temperature (°C)';
    this.data = null;
    this.loaded = false;
    this.minTemperature = Infinity;
    this.maxTemperature = -Infinity;
    this.selectedYear = null;
    const marginSize = 35;
    this.layout = {
        marginSize: marginSize,
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize,
        topMargin: marginSize,
        bottomMargin: height - marginSize * 2,
        pad: 5,
        get plotWidth() {
            return this.rightMargin - this.leftMargin;
        },
        get plotHeight() {
            return this.bottomMargin - this.topMargin;
        },
        grid: false,
        numXTickLabels: 12,
        numYTickLabels: 12,
    };

    this.preload = function () {
        this.data = loadTable(
            './data/surface-temperature/GLB-monthly.csv', 'csv', 'header',
            () => this.loaded = true);
    };


    this.setup = function () {
        if (!this.data) return;

        this.year = this.data.getColumn('Year');
        this.select = createSelect();
        this.select.position(1589, 50);
        this.year.forEach(year => this.select.option(year));

        // Event listener for when a new year is selected
        this.select.changed(() => {
            this.selectedYear = this.select.value();
            this.updateGraph();  // Call a function to update the graph
        });

        this.selectedYear = this.year[0];
        this.updateGraph();  // Initial graph update
    };


    this.destroy = function () {
        if (this.select) this.select.remove();
    };

    this.draw = function () {
        if (!this.loaded || !this.data) {
            console.log('Data not yet loaded');
            return;
        }

        let previous = null;
        this.months.forEach((month, i) => {
            const value = Number(this.data.getString(this.selectedYear - this.minYear, month));
            const x = map(i, 0, this.months.length - 1, this.layout.leftMargin, this.layout.rightMargin);
            const y = map(value, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin);

            if (previous) {
                stroke(0);
                line(previous.x, previous.y, x, y);
            }

            fill(255, 0, 0); // Set color for the points
            ellipse(x, y, 4, 4); // Draw points

            previous = { x, y };
        });

        this.select.position(1589, previous.y - 10);
        drawAxis(this.layout);
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        drawYAxisTickLabels(this.minTemperature, this.maxTemperature, this.layout, temp => map(temp, this.minTemperature, this.maxTemperature, this.layout.bottomMargin, this.layout.topMargin));
    };
    this.updateGraph = function () {
        // Logic to update min and max temperatures based on selected year
        this.minTemperature = Infinity;
        this.maxTemperature = -Infinity;

        this.months.forEach(month => {
            const value = parseFloat(this.data.getString(this.selectedYear - this.minYear, month));
            if (!isNaN(value)) {
                this.minTemperature = Math.min(this.minTemperature, value);
                this.maxTemperature = Math.max(this.maxTemperature, value);
            }
        });

        clear();  // Clear the previous drawing
        this.draw();  // Redraw with the new data
    };

}
