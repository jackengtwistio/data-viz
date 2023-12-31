for (var i = 1; i < this.data.getRowCount(); i++) {
    var current = {
        // Convert strings to numbers.
        'id': i,
        'description': this.data.getString(i, 'Description'),
        'numJobs': this.data.getNum(i, 'Number of jobs (thousand)'),
        'meanHourlyPay': this.data.getNum(i, 'Mean')
    };
    minHourlyPay = min(minHourlyPay, current.meanHourlyPay);
    maxHourlyPay = max(maxHourlyPay, current.meanHourlyPay);
    minJobNum = min(minJobNum, current.numJobs);
    maxJobNum = max(maxJobNum, current.numJobs);
    bubbles.push(new Bubble(current.description, this.layout));
}