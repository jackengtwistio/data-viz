var data;
var loaded = false;
var minTemperature = 0;
var maxTemperature = 0;
var minYear, maxYear;
var months = [];
var barWidth, distBetweenYears;
var lastX, lastY;
var rotX = -0.3; // Initial rotation around X-axis
var rotY = -2.45; // Initial rotation around Y-axis
var mouseDragging = false
// p5js defined functions for mouse events
function mouseDragged() {
    mouseDragging = true
}
// if mouseDragged is not defined, use touchMoved
function touchMoved() {
    mouseDragging = true
}
function mouseReleased() {
    mouseDragging = false
}

function preload() {
    data = loadTable('./data/surface-temperature/GLB-monthly.csv', 'csv', 'header', () => {
        loaded = true;
    });
}

function setup() {

    canvasContainer = select('#canvas');
    var canvas = createCanvas(1900, 1200, WEBGL);

    countYears = data.getRowCount()
    distBetweenYears = 5
    barWidth = 20;
    barDepth = 2
    barsDepth = countYears * distBetweenYears
    barsWidth = barWidth + width / 4
    minYear = data.getString(0, 'Year');
    maxYear = data.getNum(countYears - 1, 'Year');
    months = data.columns.slice(1);

    // Create graphics for X and Y axes
    pgX = createGraphics(barsDepth, 20);
    pgY = createGraphics(barsWidth, 20);

    // Populate graphics for X-axis
    pgX.fill(0);
    pgX.textSize(16);
    pgX.text('2018', 2, 18);
    // text in the middle
    pgX.text('<------Year------>', barsDepth / 2 - 70, 18)
    pgX.text('1880', barsDepth - 40, 18);

    // Populate graphics for Y-axis
    pgY.fill(0);
    pgY.textSize(16);
    pgY.text('Jan', 2, 18);
    // text in the middle
    pgY.text('<------Month------>', barsWidth / 2 - 70, 18);
    pgY.text('Dec', barsWidth - 40, 18);
    canvas.parent('canvas');

    if (!loaded) {
        return;
    }
    for (var i = 0; i < months.length; i++) {
        for (var row = 0; row < data.getRowCount(); row++) {
            var temp = data.getNum(row, months[i]);
            minTemperature = min(temp, minTemperature);
            maxTemperature = max(temp, maxTemperature);
        }
    }
}

function draw() {
    background(255);
    // If the mouse is being dragged, update the rotation angles
    if (mouseDragging) {
        if (lastX !== null && lastY !== null) {
            // Update rotation angles based on mouse movement
            rotY += (mouseX - lastX) * 0.005;
            rotX -= (mouseY - lastY) * 0.005;
        }
        // Update lastX and lastY for the next frame
        lastX = mouseX;
        lastY = mouseY;
    } else {
        // Reset lastX and lastY when not dragging
        lastX = null;
        lastY = null;
    }
    rotateX(rotX);
    rotateY(rotY)

    push();
    // X-axis label
    translate(barsWidth / 2, 25, 0);
    // Align with the X-axis
    rotateY(HALF_PI);
    texture(pgX);
    plane(barsDepth, 20);
    pop();

    push();
    // Y-axis label
    translate(0, 25, -barsDepth / 2);
    rotateY(PI);
    texture(pgY);
    plane(barsWidth, 20);
    pop();

    push()
    // Draw bars
    // Translate to the center of the canvas
    translate(0, 0, -countYears * distBetweenYears / 2)
    for (var yearIndex = 0; yearIndex < countYears; yearIndex++) {
        z = map(yearIndex, 0, -countYears, 0, -countYears * distBetweenYears);


        for (var monthIndex = 0; monthIndex < months.length; monthIndex++) {
            var value = data.getNum(yearIndex, months[monthIndex]);
            var x = map(monthIndex, 0, months.length - 1, width / 8, -width / 8);
            var y = -map(value, minTemperature, maxTemperature, 0, height / 4);

            push();
            translate(x, y / 2, z);
            var barHeight = abs(y);
            var red = map(value, minTemperature, maxTemperature, 0, 255)
            var green = map(value, minTemperature, maxTemperature, 255, 0)
            var blue = map(value, minTemperature, maxTemperature, 255, 0)
            fill(red, green, blue);
            box(barWidth, barHeight, barDepth);
            pop();
        }

    }
    pop()
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
    line(0, 0, -500, 0, 0, 500);
}


