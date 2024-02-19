function setup() {
    createCanvas(800, 600, WEBGL);
}

let bubbles = [];

function setup() {
    createCanvas(800, 600, WEBGL);

    // Create bubbles
    for (let i = 0; i < 20; i++) {
        bubbles.push({
            x: random(-width / 2, width / 2),
            y: random(-height / 2, height / 2),
            z: random(-200, 200),
            size: random(20, 80),
            color: [random(100, 255), random(100, 255), random(100, 255), random(100, 200)]
        });
    }
}

function draw() {
    background(0);

    // Optional: Rotate the scene for a dynamic view
    rotateY(frameCount * 0.01);

    // Draw bubbles
    for (let bubble of bubbles) {
        push();
        translate(bubble.x, bubble.y, bubble.z);
        noStroke();
        fill(bubble.color[0], bubble.color[1], bubble.color[2], bubble.color[3]);
        sphere(bubble.size);
        pop();
    }
}