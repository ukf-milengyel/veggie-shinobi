var gridCanvas = document.querySelector('#game-container');

var gridCtx = gridCanvas.getContext('2d');
var gridWidth = 1040;
var gridHeight = 800;
var resolutionX = 15;
var resolutionY = 15;
var cellWidth = gridWidth / resolutionX;
var cellHeight = gridHeight / resolutionY;
var PI = Math.PI;

var radius = 0;

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
    
        // Changing the source of video to current stream.
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
        });
    })
    .catch(alert);