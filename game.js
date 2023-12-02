let gridCanvas = document.querySelector('#webcam-trail');
let gridCtx = gridCanvas.getContext('2d');

let gameCanvas = document.querySelector('#game-container');
let ctx = gameCanvas.getContext('2d');

let gridWidth = 800;
let gridHeight = 600;
let resolutionX = 15;
let resolutionY = 15;
let cellWidth = gridWidth / resolutionX;
let cellHeight = gridHeight / resolutionY;
let PI = Math.PI;

let score = 0;

const TIMESCALE = 1.0;
const GRAVITY = 0.0025;
const maxXSpeed = 0.5;
const minYSpeed = 1;
const maxYSpeed = 1.5;

const fruitSize = 60;
const fruitCenter = fruitSize / 2;
const sensitivity = 255 * 0.9;        // values lower than this count as a slice

const imageTypes = ["baklazan", "mrkva", "paradajka", "tekvica", "uhorka"];
const images = {};

var radius = 0;



let previousTimestamp;        // delta calculation

function drawGrid(matrix) {
  gridCtx.clearRect(0,0,gridWidth, gridHeight);
  matrix.forEach(function (row, rowIdx) {
    row.forEach(function (column, colIdx) {
      radius = 10;
      gridCtx.beginPath();
      //gridCtx.fillStyle = 'rgba(255, 255, 255, '+ (255-column)/255 +')';
      gridCtx.fillStyle = 'rgba(255, 255, 255, '+ (255-column)/255 +')';
      gridCtx.arc(rowIdx * cellWidth, colIdx * cellHeight, radius, 0, 2 * PI, false);
      gridCtx.fill();
      gridCtx.closePath();
    });
  });
}

const diffy = Diffy.create({
    resolution: { x: resolutionX, y: resolutionY },
    sensitivity: 0.25,
    threshold: 80,
    debug: true,
    containerClassName: 'diffy-demo',
    sourceDimensions: { w: 130, h: 100 },
    onFrame: /*function (matrix) {}*/ collisionCheck
  });

let video = document.getElementById("vid");
let mediaDevices = navigator.mediaDevices;
mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
    })
    .catch(alert);


let fruits;
let objects;
let timeLeft;

function isOutOfBounds(object) {
    return object.y <= gridHeight;
}

function init() {
    fruits = [];
    objects = [];
    timeLeft = 120;
    ctx.fillStyle = "red";

    setInterval(timerTick, 1000);
    setInterval(spawnFruit, 1250);
    requestAnimationFrame(update);
}

function collisionCheck(matrix) {
    drawGrid(matrix);

    matrix.forEach(function (row, rowIdx) {
        row.forEach(function (column, colIdx) {
            if(column < sensitivity) {
                for (let i = fruits.length - 1; i >= 0; i--) {
                    cx = rowIdx * cellWidth
                    cy = colIdx * cellHeight;
                    const f = fruits[i];
                    if(
                        f.x >= cx && 
                        f.y >= cy && 
                        f.x <= cx + cellWidth &&
                        f.y <= cy + cellHeight
                    ) {
                        console.log("Hit! " + i);
                        destroyFruit(i);
                    }
                }
            }
          radius = 10;
          gridCtx.beginPath();
          //gridCtx.fillStyle = 'rgba(255, 255, 255, '+ (255-column)/255 +')';
          gridCtx.fillStyle = 'rgba(255, 255, 255, '+ (255-column)/255 +')';
          gridCtx.arc(rowIdx * cellWidth, colIdx * cellHeight, radius, 0, 2 * PI, false);
          gridCtx.fill();
          gridCtx.closePath();
        });
      });
}

function update(timeStamp) {
    // ---- delta calculation
    if (previousTimestamp === undefined) {
        previousTimestamp = timeStamp;
    }
    const delta = (timeStamp - previousTimestamp) * TIMESCALE;
    previousTimestamp = timeStamp;
    // ----

    fruits = fruits.filter(function (fruit) {
        return isOutOfBounds(fruit);
    });

    ctx.clearRect(0,0,gridWidth,gridHeight);
    for (fruit of fruits) {
        fruit.update(delta);
        const img = fruit.image
        ctx.drawImage(images[fruit.image][0], fruit.x, fruit.y, fruitSize, fruitSize);
    }

    requestAnimationFrame(update);
}

function timerTick() {
    if(timeLeft > -1) {
        timeLeft -= 1;
        document.getElementById("time-display").innerText = timeLeft;
    } else {
        // todo: clear intervals
        gameOver();
    }
}

function gameOver() {

}

function destroyFruit(index) {
    const fruit = fruits[index];
    score += fruit.score;
    document.getElementById("score-display").innerText = score;
    fruits.splice(index, 1);
}

function spawnFruit() {
    const amount = rng(1, 3);
    for (let i = 0; i < amount; i++) {
        fruits.unshift(new Fruit(
            rng(gridWidth*0.25, gridWidth*0.75) , gridHeight - 1, 
            rng(-maxXSpeed, maxXSpeed) , -rng(minYSpeed, maxYSpeed), GRAVITY, Math.floor(Math.random()*imageTypes.length), 10
        ));
    }
}

function loadImages() {
    for (imageType in imageTypes) {
        images[imageType] = [];
        for (let i = 0; i < 3; i++) {
            const img = document.createElement("img");
            img.src = "./images/" + imageTypes[imageType] + i + ".png";
            images[imageType][i] = img;
        }
    }
}

function rng(min, max) {
    return Math.random() * (max - min) + min;
}

loadImages();
setTimeout(init, 1000); // call to start the game