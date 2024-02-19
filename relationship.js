function LinearRegression() {
    this.x = [];
    this.y = [];
    this.x_sum = 0;
    this.y_sum = 0;
    this.x_sq_sum = 0;
    this.y_sq_sum = 0;
    this.xy_sum = 0;
    this.n = 0;
    this.m = 0;
    this.b = 0;
    this.r = 0;
    this.r_sq = 0;
    this.r_sq_adj = 0;
    this.s = 0;
    this.s_sq = 0;
    this.s_yx = 0
    this.s_yx_sq = 0;
    this.layout = {
        leftMargin: 100,
        rightMargin: 100,
        topMargin: 100,
        bottomMargin: 100,
        marginSize: 50,
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
    this.loaded = false;
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            './data/surface-temperature/GLB-monthly.csv', 'csv', 'header',
            function (table) {
                self.loaded = true;
            });
    };
    this.setup() = function () {
        this.minYear = this.data.getString(0, 'Year');
        this.maxYear = this.data.getNum(this.data.getRowCount() - 1, 'Year');
        this.months = this.data.columns.slice(1);
        barWidth = (rightMargin - leftMargin) / this.months.length
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
        this.x = this.data.getColumn(this.months[this.year]);
        this.y = this.data.getColumn('Year');
        this.n = this.x.length;
        for (var i = 0; i < this.n; i++) {
            this.x_sum += this.x[i];
            this.y_sum += this.y[i];
            this.x_sq_sum += this.x[i] * this.x[i];
            this.y_sq_sum += this.y[i] * this.y[i];
            this.xy_sum += this.x[i] * this.y[i];
        }
        this.m = (this.n * this.xy_sum - this.x_sum * this.y_sum) / (this.n * this.x_sq_sum - this.x_sum * this.x_sum);
        this.b = (this.y_sum - this.m * this.x_sum) / this.n;
        this.r = (this.n * this.xy_sum - this.x_sum * this.y_sum) / (sqrt(this.n * this.x_sq_sum - this.x_sum * this.x_sum) * sqrt(this.n * this.y_sq_sum - this.y_sum * this.y_sum));
        this.r_sq = this.r * this.r;
        this.r_sq_adj = 1 - (1 - this.r_sq) * (this.n - 1) / (this.n - 2);
        this.s = sqrt((this.y_sq_sum - this.y_sum * this.y_sum / this.n) / (this.n - 1));
        this.s_sq = this.s * this.s;
        this.s_yx = this.s * sqrt(1 - this.r_sq);
        this.s_yx_sq = this.s_yx * this.s_yx;
        this.layout.leftMargin = 100;
        this.layout.rightMargin = 100;
        this.layout.topMargin = 100;
        this.layout.bottomMargin = 100;
        this.layout.marginSize = 50;
        this.layout.plotWidth = function () {
            return rightMargin - leftMargin;
        };
        this.layout.plotHeight = function () {
            return bottomMargin - topMargin;
        };
        this.layout.grid = false;
        this.layout.numXTickLabels = 12;
        this.layout.numYTickLabels = 12;
        var rightMargin = this.layout.rightMargin
        var leftMargin = this.layout.leftMargin

    }