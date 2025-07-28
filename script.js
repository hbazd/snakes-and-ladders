const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let position = 1;

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
  drawPlayer();
}

function drawPlayer() {
  const tileSize = 40;
  let row = Math.floor((position - 1) / 10);
  let col = (position - 1) % 10;
  if (row % 2 === 1) col = 9 - col;
  const x = col * tileSize + tileSize / 2;
  const y = (9 - row) * tileSize + tileSize / 2;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();
}

function rollDice() {
  const roll = Math.floor(Math.random() * 6) + 1;
  document.getElementById("diceResult").innerText = "You rolled: " + roll;
  position += roll;
  if (position > 100) position = 100;
  drawBoard();
}

drawBoard();
