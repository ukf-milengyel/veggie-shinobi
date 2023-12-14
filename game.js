let gridCanvas = document.querySelector('#webcam-trail');
let gridCtx = gridCanvas.getContext('2d');

let gameCanvas = document.querySelector('#game-container');
let ctx = gameCanvas.getContext('2d');

let permissionsCheck = 0;

let gridWidth = 800;
let gridHeight = 600;
let resolutionX = 15;
let resolutionY = 15;
let cellWidth = gridWidth / resolutionX;
let cellHeight = gridHeight / resolutionY;
let PI = Math.PI;
let lives = 3;

let score = 0;

let running = false;

const TIMESCALE = 1.0;
const GRAVITY = 0.0025;
const maxXSpeed = 0.5;
const minYSpeed = 1;
const maxYSpeed = 1.75;

const time = 60;

const minFruitSize = 30;
const maxFruitSize = 100;

const sensitivity = 255 * 0.9;        // values lower than this count as a slice
//const sensitivity = 254;        // values lower than this count as a slice

const imageTypes = ["baklazan", "mrkva", "paradajka", "tekvica", "uhorka", "banan", "slivka", "bomba"];
const bombIndex = 7;    // just use oop man :)
const images = {};

var radius = 0;

let previousTimestamp;        // delta calculation

// intervals
let fruitSpawnInterval, timerTickInterval;

var sliceSound = new Audio('sounds/slice.mp3');
var bombSound = new Audio('sounds/hp_loss.mp3');

function checkPerms(increment) {
    permissionsCheck += increment;
    if (permissionsCheck >= 1) {
        // camera permissions are allowed, start countdown
        menuTimer(5);
    }
}

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
    sensitivity: 0.5,
    threshold: 90,
    //debug: true,
    //containerClassName: 'diffy-demo',
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
        checkPerms(1);
    })
    .catch(alert);


let fruits = [];
let gameObjects = [];
let timeLeft = 0;

function isOutOfBounds(object) {
    return object.y <= gridHeight;
}

function init() {
    document.getElementById('blanket').style.visibility = "hidden";
    fruits = [];
    gameObjects = [];
    timeLeft = time;
    ctx.fillStyle = "red";
    running = true;

    timerTickInterval = setInterval(timerTick, 1000);
    fruitSpawnInterval = setInterval(spawnFruit, 1250);
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
                        //console.log("Hit! " + i);
                        destroyFruit(i);
                    }
                }
            }
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

    gameObjects = gameObjects.filter(function (fruit) {
        return isOutOfBounds(fruit);
    });

    ctx.clearRect(0,0,gridWidth,gridHeight);
    for (fruit of fruits) {
        fruit.update(delta);
        ctx.drawImage(images[fruit.image][0], fruit.x, fruit.y, fruit.size, fruit.size);
    }

    for (o of gameObjects) {
        o.update(delta);
        ctx.drawImage(images[o.image][o.imageIndex], o.x, o.y, o.size, o.size);
    }

    checkLives()

    if(!running) return;
    requestAnimationFrame(update);
}

function timerTick() {
    if(timeLeft > 0) {
        timeLeft -= 1;
        document.getElementById("time-display").innerText = timeLeft;
    } else {
        gameOver();
    }
}

function checkLives() {
    switch (lives){
        case 2: document.getElementById("h3").style.visibility = "hidden";
                break;
        case 1: document.getElementById("h2").style.visibility = "hidden";
                break;
        case 0: gameOver();
        
    }
}

function gameOver() {
    // clear objects
    fruits = [];
    gameObjects = [];

    // clear intervals
    running = false;
    clearInterval(fruitSpawnInterval);
    clearInterval(timerTickInterval);

    // show game over screen
    document.getElementById("game-over-score").innerHTML = "Score: " + score;
    document.getElementById("main-container").style.visibility="hidden";
    document.getElementById("game-over").style.visibility="visible";
}

function destroyFruit(index) {
    const fruit = fruits[index];
    score += fruit.score;
    sliceSound.play();
    if (fruit.image === bombIndex) {
        lives--;
        bombSound.play();
        document.getElementById("hurt-overlay").style.animation = "hurt-animation 1s";
    }
    // i love javascript =DDD totally not hacky
    setTimeout(() => {
        document.getElementById("hurt-overlay").style.animation = "";
    }, 1000)
    document.getElementById("score-display").classList.add("score-display-anim");
    document.getElementById("score-display").innerText = score;
    gameObjects.unshift(new PhysicsObject(
        fruit.x , fruit.y, 
        fruit.xSpeed + rng(-0.5, 0.5) , fruit.ySpeed + rng(-0.2, 0.2), GRAVITY, fruit.image, fruit.size, fruit.sizeChange, 1
    ));
    gameObjects.unshift(new PhysicsObject(
        fruit.x , fruit.y, 
        fruit.xSpeed + rng(-0.5, 0.5) , fruit.ySpeed + rng(-0.2, 0.2), GRAVITY, fruit.image, fruit.size, fruit.sizeChange, 2
    ));

    // spawn gibs
    for (let i = 0; i < 10; i++) {
        gameObjects.unshift(new PhysicsObject(
            fruit.x , fruit.y, 
            fruit.xSpeed + rng(-1.0, 1.0) , fruit.ySpeed + rng(-0.5, 0.5), GRAVITY, fruit.image, rng(10, 20), rng(-0.05, 0.2), 3
        ));
    }
    
    fruits.splice(index, 1);
}

function spawnFruit() {
    const amount = Math.ceil(rng(0, 3));

    // randomly spawn a bomb if there is only one fruit on the screen
    if(amount === 1) {
        //spawn bomb with a chance
        if (Math.random() < 0.5) {
            fruits.unshift(new Fruit(
                rng(gridWidth*0.25, gridWidth*0.75) , gridHeight - 1, 
                rng(-maxXSpeed, maxXSpeed) , -rng(minYSpeed, maxYSpeed), GRAVITY, 
                bombIndex, rng(minFruitSize, maxFruitSize), rng(0, 0.2),
                0
            ));
            return;
        }
    }

    for (let i = 0; i < amount; i++) {
        const fruitType = Math.floor(Math.random()*(imageTypes.length - 1));
        fruits.unshift(new Fruit(
            rng(gridWidth*0.25, gridWidth*0.75) , gridHeight - 1, 
            rng(-maxXSpeed, maxXSpeed) , -rng(minYSpeed, maxYSpeed), GRAVITY, 
            fruitType, rng(minFruitSize, maxFruitSize), rng(0, 0.2),
            7 * fruitType  // todo: random score?
        ));
    }
}

function loadImages() {
    for (imageType in imageTypes) {
        images[imageType] = [];
        for (let i = 0; i <= 3; i++) {
            const img = document.createElement("img");
            img.src = "./images/" + imageTypes[imageType] + i + ".png";
            images[imageType][i] = img;
        }
    }
}

function rng(min, max) {
    return Math.random() * (max - min) + min;
}

function menuTimer(time) {
    countdownText = document.getElementById('countdown');
    let timer = setInterval(function() {
        countdownText.textContent = time;
        time -= 1;

        if (time < 0) {
            clearInterval(timer);
            countdownText.textContent = "0";
            init();
        }
    }, 1000);   
}

function redirectAndRefresh() {
    window.location.href = 'index.html';
    location.reload();
}

loadImages();