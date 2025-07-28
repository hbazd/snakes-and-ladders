const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let position = 1;

const snakes = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};

const ladders = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
};

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const tileSize = 40;
  let number = 1;
  for (let row = 9; row >= 0; row--) {
    for (let col = 0; col < 10; col++) {
      const x = (row % 2 === 0) ? col * tileSize : (9 - col) * tileSize;
      const y = row * tileSize;
      ctx.strokeRect(x, y, tileSize, tileSize);
      ctx.fillText(number, x + 5, y + 15);
      number++;
    }
  }
  drawSnakesAndLadders();
  drawPlayer();
}

function getTileCenter(position) {
  const tileSize = 40;
  let row = Math.floor((position - 1) / 10);
  let col = (position - 1) % 10;
  if (row % 2 === 1) col = 9 - col;
  const x = col * tileSize + tileSize / 2;
  const y = (9 - row) * tileSize + tileSize / 2;
  return { x, y };
}

function drawArrow(start, end, color) {
  const startCoord = getTileCenter(start);
  const endCoord = getTileCenter(end);
  ctx.beginPath();
  ctx.moveTo(startCoord.x, startCoord.y);
  ctx.lineTo(endCoord.x, endCoord.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawSnakesAndLadders() {
  Object.entries(snakes).forEach(([start, end]) => {
    drawArrow(parseInt(start), parseInt(end), "red");
  });
  Object.entries(ladders).forEach(([start, end]) => {
    drawArrow(parseInt(start), parseInt(end), "green");
  });
}

function drawPlayer() {
  const { x, y } = getTileCenter(position);
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "blue";
  ctx.fill();
}

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  document.getElementById("diceResult").innerText = "You rolled: " + roll;
  position += roll;
  if (position > 100) position = 100;

  // Check for snakes or ladders
  if (snakes[position]) {
    position = snakes[position];
  } else if (ladders[position]) {
    position = ladders[position];
  }

  drawBoard();
}

drawBoard();
