var gridCanvas = document.querySelector('#webcam-trail');
var gridCtx = gridCanvas.getContext('2d');

var gameCanvas = document.querySelector('#game-container');
var ctx = gameCanvas.getContext('2d');

var gridWidth = 1040;
var gridHeight = 800;
var resolutionX = 15;
var resolutionY = 15;
var cellWidth = gridWidth / resolutionX;
var cellHeight = gridHeight / resolutionY;
var PI = Math.PI;

const TIMESCALE = 1.0;
const GRAVITY = 0.0025;
const mX = 1;
const mXD = mX/2;
const mY = 1;
const mYD = mY * 0.75;   

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
    sensitivity: 0.05,
    threshold: 90,
    debug: true,
    containerClassName: 'diffy-demo',
    sourceDimensions: { w: 130, h: 100 },
    onFrame: /*function (matrix) {}*/ drawGrid
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
let slices;
let timeLeft;

function isOutOfBounds(object) {
    return object.y <= gridHeight;
}

function init() {
    fruits = [];
    slices = [];
    timeLeft = 120;
    ctx.fillStyle = "red";
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
        ctx.beginPath();
        ctx.rect(fruit.x, fruit.y, 50, 50);
        ctx.fill();
        ctx.stroke();
    }

    requestAnimationFrame(update);
}

function timerTick() {
    timeLeft -= 1;
    if(timeLeft <= 0) {
        // Game over
    }
}

function gameOver() {

}

function spawnFruit() {
    const amount = Math.ceil(Math.random() * 3);
    for (let i = 0; i < amount; i++) {
        fruits.unshift(new Fruit(
            Math.random() * gridWidth, gridHeight - 1, 
            Math.random() * mX - mXD , -(mYD + Math.random() * mY), GRAVITY, "", 10
        ));
    }
}



init();

setInterval(timerTick, 1000);
setInterval(spawnFruit, 1250);
requestAnimationFrame(update);