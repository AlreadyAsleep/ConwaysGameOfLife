//init canvas
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

//Set canvas to fill div
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

//Settings
var refreshRate = 1 / 10;      //seconds
var autoUpdateOn = false;      //update every refresh rate?
var colorSettings = {
  liveColor: '#00ff00',
  deadColor: '#000000'
};
var cellSize = 10;             //pixels

//Engine Variables
var drawQueue = [];
var updateQueue = [];
var states = {
  dead: 0, alive: 1
}
var width = Math.floor(canvas.width / cellSize);
var height = Math.floor(canvas.height / cellSize);
var cellStatus = new Array(width).fill(0).map(x => new Array(height).fill(0));
var refreshTimer = null;

function plotInitialGeneration() {
  for (let currentX = 0; currentX < width; currentX++) {
    for (let currentY = 0; currentY < height; currentY++) {
      //fill canvas with random cells
      let randHit = Math.floor(Math.random() * 1000) % 13 == 0;
      let state = randHit ? states.alive : states.dead;
      updateQueue.push({ x: currentX, y: currentY, state: state });
    }
  }
  updateStates();
  drawCanvas();
}

function plotNextGeneration() {
  //Draw our cells based on the rules of the game
  for (let currentX = 0; currentX < width; currentX++) {
    for (let currentY = 0; currentY < height; currentY++) {
      //get status of cell
      let state = getCurrentState(currentX, currentY);
      let count = getAdjacentCount(currentX, currentY);

      //Any live cell with two or three live neighbours survives
      if ((count !== 2 && count !== 3) && state === states.alive) {
        updateQueue.push({ x: currentX, y: currentY, state: states.dead });
      }
      //Any dead cell with three live neighbours becomes a live cell
      if (count === 3 && state === states.dead) {
        updateQueue.push({ x: currentX, y: currentY, state: states.alive });
      }
    }
  }
  updateStates();
  drawCanvas();
}

function drawCanvas(){
  for(let i = 0; i < width; i++){
    for(let j = 0; j < height; j++){
      drawSquare(i * cellSize, j * cellSize, cellSize, cellStatus[i][j] == 1 ? colorSettings.liveColor : colorSettings.deadColor);
    }
  }
  
}

function updateStates() {
  while (updateQueue.length > 0) {
    let queueItem = updateQueue.pop();
    cellStatus[queueItem.x][queueItem.y] = queueItem.state;
  }
}

function getCurrentState(x, y) {
  return x >= 0 && y >= 0 && x < cellStatus.length && y < cellStatus[x].length ? cellStatus[x][y] : 0;
}

function getAdjacentCount(x, y) {
  let count = 0;
  for (let i = x - 1; i <= (x + 1); i++) {
    for (let j = y - 1; j <= (y + 1); j++) {
      if (!(i === x && j === y)) {
        count += getCurrentState(i, j);
      }
    }
  }
  return count;
}

function drawSquare(x, y, size, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, x + size, y + size);
}

function autoUpdate() {
  autoUpdateOn = !autoUpdateOn;
  if(autoUpdateOn){
    refreshTimer = setInterval(plotNextGeneration, refreshRate * 1000);
  }
  else{
    clearInterval(refreshTimer);
  }
  document.getElementById('play-button').classList.toggle('fa-pause');
  document.getElementById('play-button').classList.toggle('fa-play');
}
plotInitialGeneration();
