let data;
let loaded = false;
let minTemperature = 0;
let maxTemperature = 0;
let minYear, maxYear;
let months = [];
let barWidth, spaceBetweenYears;

function preload() {
    data = loadTable('./data/surface-temperature/GLB-monthly.csv', 'csv', 'header', () => {
        loaded = true;
    });
}

function setup() {
    alert("welcome to 3D bar chart for visulizing climate changes");

    canvasContainer = select('#canvas');
    var canvas = createCanvas(1900, 1200, WEBGL);
    pg = createGraphics(200, 200);
    canvas.parent('canvas');
    if (!loaded) {
        console.log("Data not yet loaded");
        return;
    }
    countYears = data.getRowCount()
    spaceBetweenYears = 5
    minYear = data.getString(0, 'Year');
    maxYear = data.getNum(countYears - 1, 'Year');
    months = data.columns.slice(1);
    barWidth = 20;
    halfLengthYears = countYears * spaceBetweenYears / 2

    for (let i = 0; i < months.length; i++) {
        for (let row = 0; row < data.getRowCount(); row++) {
            let temp = data.getNum(row, months[i]);
            minTemperature = min(temp, minTemperature);
            maxTemperature = max(temp, maxTemperature);
        }
    }
}

function draw() {
    background(255);

    rotateX(-QUARTER_PI);
    // rotateY(QUARTER_PI);
    // rotateX();
    console.log(mouseX)
    rotateY(frameCount * 0.02);
    // Draw text onto the graphics buffer
    pg.background(76, 175, 80);
    pg.textSize(70);
    pg.fill(255);

    // a flag on a stick indicates the min year
    line(0, height / 2, -halfLengthYears, 0, -height / 2, -halfLengthYears);
    push()
    pg.text('1880', 20, 100);
    texture(pg);
    translate(0, -400, -halfLengthYears)
    box(50);
    pop()


    // a flag on a stick indicates the max years
    line(0, height / 2, 2 * halfLengthYears, 0, -height / 2, 2 * halfLengthYears);
    push();
    pg.text('2018', 20, 100);
    texture(pg);
    translate(0, -400, halfLengthYears); // Make sure this matches the end of the stick
    box(50);
    pop();

    push()
    translate(0, 0, -halfLengthYears)
    for (let yearIndex = 0; yearIndex < countYears; yearIndex++) {
        for (let monthIndex = 0; monthIndex < months.length; monthIndex++) {
            let value = data.getNum(yearIndex, months[monthIndex]);

            let x = map(monthIndex, 0, months.length - 1, -width / 8, width / 8);
            let y = -map(value, minTemperature, maxTemperature, 0, height / 4);
            let zLength = -yearIndex * spaceBetweenYears;
            let z = map(yearIndex, 0, -countYears, 0, zLength);
            push();
            translate(x, y / 2, z);
            let barHeight = abs(y);
            let red = map(value, minTemperature, maxTemperature, 0, 255)
            let green = map(value, minTemperature, maxTemperature, 255, 0)
            let blue = map(value, minTemperature, maxTemperature, 255, 0)
            fill(red, green, blue);
            box(barWidth, barHeight, 2);
            pop();
        }

    }
    pop()
    // Draw Axes
    drawAxes();

}


function drawAxes() {
    stroke(0);
    strokeWeight(2);

    // X-axis
    line(-width / 2, 0, 0, width / 2, 0, 0);

    // Y-axis
    line(0, height / 2, 0, 0, -height / 2, 0);

    // Z-axis
    line(0, 0, -500, 0, 0, 500); // Adjust length as needed
}


