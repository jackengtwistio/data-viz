var mockData = `Mock Data,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec
1907,-0.41,-0.51,-0.27,-0.38,-0.46,-0.43,-0.36,-0.34,-0.32,-0.23,-0.47,-0.47
1908,-0.43,-0.3,-0.53,-0.45,-0.4,-0.4,-0.39,-0.46,-0.35,-0.44,-0.49,-0.48
1909,-0.68,-0.46,-0.5,-0.59,-0.55,-0.52,-0.94,-0.3,-0.34,-0.36,-0.3,-0.54
1910,-0.44,-0.43,-0.5,-0.39,-0.34,-0.37,-0.34,-0.35,-0.35,-0.38,-0.53,-0.66
1911,-0.63,-0.57,-0.59,-0.53,-0.51,-0.47,-0.41,-0.41,-0.37,-0.22,-0.17,-0.21
1912,-0.25,-0.11,-0.34,-0.19,-0.21,-0.25,0.43,-0.54,-0.51,-0.56,-0.37,-0.42
1913,-0.41,-0.42,-0.42,-0.39,-0.46,-0.48,-0.36,-0.33,-0.35,-0.33,-0.18,-0.02
1914,0.05,-0.1,-0.21,-0.28,-0.22,-0.26,-0.24,-0.13,-0.12,-0.03,-0.17,-0.07
1915,-0.16,0,-0.08,0.07,-0.06,-0.2,-0.09,0.19,-0.16,-0.24,-0.11,-0.15`

function UserLineChart() {
    this.name = 'your line chart';
    this.id = 'user-line-chart';
    this.xAxisLabel = 'X-axis';
    this.yAxisLabel = 'y-axis'
    this.loaded = false;
    this.minY = Infinity;
    this.maxY = -Infinity;
    this.data = null
    this.badInput = false

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
        self.data = this.StringToTable(mockData);

        self.loaded = true;
    };

    this.setup = function () {
        var self = this;
        if (!this.loaded) {
            return;
        }
        // create input box for user to input data
        this.userInput = createElement('textarea');
        this.userInput.value(mockData);
        this.userInput.size(min(1500, window.innerWidth), 500);
        this.userInput.position(100, 1000);
        // Create a button for sending userInput value to self.data
        var sendButton = createButton('Send Data');
        sendButton.position(100, 950); // Position above the textarea for visibility
        sendButton.mousePressed(function () {
            self.data = self.StringToTable(self.userInput.value());
            // Re-initialize or update the chart with the new data
            self.initializeChart();
        });
        var pInstruction = createP('Text from your uploaded file will appear in the text box below. You can edit the data directly in the text box. By clicking the button on the left, the graph will be updated with the edited data. However, if your data does not follow the format of the mock data, the graph may not work as expected.')
        pInstruction.position(250, 870);
        pInstruction.style('max-width', '700px');



        // create file input for user to upload a file
        this.userFile = createFileInput(function (file) {
            if (file.type === 'text') {
                self.data = self.StringToTable(file.data);
                // update the textarea with the new data from uploaded file
                self.userInput.value(file.data);
                self.data = self.StringToTable(self.userInput.value());
                // Re-initialize or update the chart with the new data
                self.initializeChart();
                self.loaded = true;
            } else {
                this.badInput = true;
                console.error('Not a text file.');
            }
        })
        this.userFile.position(400, 10);
        self.initializeChart();
    }

    this.destroy = function () {
        if (!this.loaded) {
            // make sure this.select1 and this.select2 are created before removing them
            return;
        }
        this.select1.remove();
        this.select2.remove();
    };

    this.draw = function () {
        if (!this.loaded) {
            return;
        }
        if (this.badInput) {
            var pWarning = createP();
            pWarning.html('Invalid input. Please make sure your data follows the format of the mock data.')
            pWarning.style('color', 'red');
            pWarning.position(500, 30);
        }
        // get the year select1ed by user, default to the first and last year in the data
        this.drawTwoLines();
        this.drawAxisLabels()
    }

    this.drawAxisLabels = function () {
        this.maxYpointsToHeight = function (y) {
            return map(y, this.minY, this.maxY, this.layout.bottomMargin, this.layout.topMargin);
        }
        drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
        drawYAxisTickLabels(this.minY,
            this.maxY,
            this.layout,
            this.maxYpointsToHeight.bind(this),
            2);
        drawAxis(this.layout);
    }


    this.drawTwoLines = function () {
        // get the row index of the selected year
        var row1 = this.data.getColumn(0).findIndex((elem) => elem === this.select1.value());
        var row2 = this.data.getColumn(0).findIndex((elem) => elem === this.select2.value());
        var previousPoint1 = null;
        var previousPoint2 = null;

        // Assuming 'this.columns' starts from index 1 to skip the 'Year' column
        for (var i = 0; i < this.columns.length; i++) {
            var columnName = this.columns[i];
            var x = map(i, 0, this.columns.length - 1, this.layout.leftMargin, this.layout.rightMargin);
            var value1 = parseFloat(this.data.getString(row1, columnName));
            var y1 = map(value1, this.minY, this.maxY, this.layout.bottomMargin, this.layout.topMargin);

            var value2 = parseFloat(this.data.getString(row2, columnName));
            var y2 = map(value2, this.minY, this.maxY, this.layout.bottomMargin, this.layout.topMargin);

            // Draw axis label for the current x position
            drawXAxisTickLabel(columnName, this.layout, () => x);

            // Draw lines between the current and previous points
            stroke(0);
            if (previousPoint1 !== null) {
                stroke(0, 0, 251); // Blue for row1
                line(previousPoint1.x, previousPoint1.y, x, y1);
            }
            if (previousPoint2 !== null) {
                stroke(251, 0, 0); // Red for row2
                line(previousPoint2.x, previousPoint2.y, x, y2);
            }

            // Draw data points
            fill(0, 0, 251); // Blue for row1
            rect(x + 2, y1 - 2, 4, 4);
            fill(251, 0, 0); // Red for row2
            rect(x + 2, y2 - 2, 4, 4);
            // Update previous points
            previousPoint1 = { x: x, y: y1 };
            previousPoint2 = { x: x, y: y2 };

            // update the select1 element position
            this.select1.position(1530, previousPoint1.y - 10);
            this.select2.position(1530, previousPoint2.y - 10);
        }
    }

    this.initializeChart = function () {
        this.firstElemFirstCol = this.data.getString(0, 0);
        this.lastElemFirstCol = this.data.getString(this.data.getRowCount() - 1, 0);
        this.columns = this.data.columns.slice(1);

        for (var i = 1; i <= this.columns.length; i++) {
            var currentMin = min(this.data.getColumn(this.data.columns[i]))
            var currentMax = max(this.data.getColumn(this.data.columns[i]))
            //Min and max always choose NaN over numbers so we need to check for that if currentMin and currentMax are valid numbers
            if (currentMax >= -Infinity && currentMin >= -Infinity) {
                this.minY = min(currentMin, this.minY)
                this.maxY = max(currentMax, this.maxY)
            }
        }
        this.firstColumn = this.data.getColumn(0)
        // remove the previous select1 and select2 element if they exist to avoid creating multiple elements
        if (this.select1) { this.select1.remove(); }
        if (this.select2) { this.select2.remove(); }
        // create two DOM elements for user to select1 the year and compare the two line generated.
        this.select1 = createSelect();
        this.select2 = createSelect();
        for (var i = 0; i < this.firstColumn.length; i++) {
            this.select1.option(this.firstColumn[i]);
            this.select2.option(this.firstColumn[i]);
        }
        this.select1.position(1530, 50);
        this.select2.position(1530, 50);
        // set color and default value to distinguish the two
        this.select1.style('color', 'blue')
        this.select2.style('color', 'red')
        this.select1.value(this.firstElemFirstCol)
        this.select2.value(this.lastElemFirstCol)
    }

    //mimick p5js loadTable function and return a table object with all the properties and methods needed in this program
    this.StringToTable = function (inputString) {
        var self = this;
        // Split the input string by newline to get rows and initialize tableOje
        var stringRows = inputString.trim().split('\n').map(function (item) { return item.trim(); });
        var rows = stringRows.slice(1).map(function (row) {
            return row.split(',').map(function (item) {
                return item.trim();
            });
        })
        console.log('rows', rows)
        var columns = stringRows[0].split(',').map(function (item) { return item.trim(); });
        // mimic p5js table object
        var tableOje = {
            rows: rows,
            columns: columns,
            getColumn: function (col) {
                if (typeof col === 'string') {
                    var colNum = this.columns.indexOf(col);
                } else if (typeof col === 'number') {
                    var colNum = col;
                } else {
                    self.badInput = true;
                    console.error('Column name or index not found');
                    return "";
                }
                return this.rows.map(function (row, i) {

                    return row[colNum];
                })
            },

            getString: function (rowNum, col) {
                if (typeof col === 'string') {
                    var colNum = this.columns.indexOf(col);
                } else if (typeof col === 'number') {
                    var colNum = col;
                } else {
                    self.badInput = true;
                    console.error('Column name or index not found');
                    return "";
                }
                if (rowNum < 0 || rowNum >= this.rows.length || colNum === -1 || !this.rows[rowNum][colNum]) {
                    self.badInput = true;
                    console.error("Row or column not found");
                    return "";
                }
                return this.rows[rowNum][colNum].toString();
            },

            getRowCount: function () {
                return this.rows.length;
            },
        };

        return tableOje;
    }
}
