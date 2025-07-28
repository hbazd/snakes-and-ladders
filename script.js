const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state
let players = [
  { id: 1, position: 1, color: "blue" },
  { id: 2, position: 1, color: "red" }
];
let currentPlayerIndex = 0;
let gameOver = false;
const tileSize = 40;

// Snakes and ladders
const snakes = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};
const ladders = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
};

// Responsive canvas sizing
function resizeCanvas() {
  const isMobile = window.innerWidth <= 500;
  canvas.width = isMobile ? 300 : 400;
  canvas.height = isMobile ? 300 : 400;
  drawBoard();
}

// Draw the game board
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const tileCount = 10;
  const currentTileSize = canvas.width / tileCount;
  let number = 1;

  // Draw grid and numbers
  ctx.font = `${currentTileSize / 3}px Arial`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  for (let row = tileCount - 1; row >= 0; row--) {
    for (let col = 0; col < tileCount; col++) {
      const x = (row % 2 === 0) ? col * currentTileSize : (tileCount - 1 - col) * currentTileSize;
      const y = row * currentTileSize;
      ctx.strokeStyle = "#2c3e50";
      ctx.strokeRect(x, y, currentTileSize, currentTileSize);
      ctx.fillStyle = "#34495e";
      ctx.fillText(number, x + 5, y + 5);
      number++;
    }
  }
  drawSnakesAndLadders();
  drawPlayers();
}

// Get tile center for a position
function getTileCenter(position) {
  const tileCount = 10;
  const currentTileSize = canvas.width / tileCount;
  let row = Math.floor((position - 1) / tileCount);
  let col = (position - 1) % tileCount;
  if (row % 2 === 1) col = tileCount - 1 - col;
  const x = col * currentTileSize + currentTileSize / 2;
  const y = (tileCount - 1 - row) * currentTileSize + currentTileSize / 2;
  return { x, y };
}

// Draw snakes and ladders
function drawSnakesAndLadders() {
  const currentTileSize = canvas.width / 10;
  Object.entries(snakes).forEach(([start, end]) => {
    drawArrow(parseInt(start), parseInt(end), "red", currentTileSize);
  });
  Object.entries(ladders).forEach(([start, end]) => {
    drawArrow(parseInt(start), parseInt(end), "green", currentTileSize);
  });
}

// Draw an arrow between two tiles
function drawArrow(start, end, color, tileSize) {
  const startCoord = getTileCenter(start);
  const endCoord = getTileCenter(end);
  ctx.beginPath();
  ctx.moveTo(startCoord.x, startCoord.y);
  ctx.lineTo(endCoord.x, endCoord.y);
  ctx.strokeStyle = color;
  ctx.lineWidth = tileSize / 10;
  ctx.stroke();

  // Draw arrowhead
  const angle = Math.atan2(endCoord.y - startCoord.y, endCoord.x - startCoord.x);
  ctx.beginPath();
  ctx.moveTo(endCoord.x, endCoord.y);
  ctx.lineTo(
    endCoord.x - (tileSize / 4) * Math.cos(angle - Math.PI / 6),
    endCoord.y - (tileSize / 4) * Math.sin(angle - Math.PI / 6)
  );
  ctx.moveTo(endCoord.x, endCoord.y);
  ctx.lineTo(
    endCoord.x - (tileSize / 4) * Math.cos(angle + Math.PI / 6),
    endCoord.y - (tileSize / 4) * Math.sin(angle + Math.PI / 6)
  );
  ctx.stroke();
}

// Draw all players
function drawPlayers() {
  const currentTileSize = canvas.width / 10;
  players.forEach((player, index) => {
    const { x, y } = getTileCenter(player.position);
    ctx.beginPath();
    ctx.arc(x + (index * currentTileSize / 4), y, currentTileSize / 5, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

// Animate player movement
function animateMove(player, newPosition, callback) {
  const steps = 10;
  const startPos = player.position;
  const endPos = newPosition;
  let step = 0;

  function animate() {
    step++;
    const progress = step / steps;
    player.position = Math.round(startPos + (endPos - startPos) * progress);
    drawBoard();
    if (step < steps) {
      requestAnimationFrame(animate);
    } else {
      player.position = endPos;
      callback();
    }
  }
  requestAnimationFrame(animate);
}

// Roll dice and handle game logic
function rollDice() {
  if (gameOver) return;

  const roll = Math.floor(Math.random() * 6) + 1;
  const currentPlayer = players[currentPlayerIndex];
  document.getElementById("diceResult").innerText = `Player ${currentPlayer.id} rolled: ${roll}`;
  document.getElementById("rollDiceBtn").disabled = true;

  let newPosition = currentPlayer.position + roll;
  if (newPosition > 100) newPosition = 100;

  animateMove(currentPlayer, newPosition, () => {
    // Check for snakes or ladders
    if (snakes[newPosition]) {
      document.getElementById("playerStatus").innerText = `Player ${currentPlayer.id} hit a snake! Sliding to ${snakes[newPosition]}.`;
      animateMove(currentPlayer, snakes[newPosition], checkWin);
    } else if (ladders[newPosition]) {
      document.getElementById("playerStatus").innerText = `Player ${currentPlayer.id} climbed a ladder to ${ladders[newPosition]}!`;
      animateMove(currentPlayer, ladders[newPosition], checkWin);
    } else {
      checkWin();
    }
  });
}

// Check for win condition
function checkWin() {
  const currentPlayer = players[currentPlayerIndex];
  if (currentPlayer.position === 100) {
    gameOver = true;
    document.getElementById("winMessage").innerText = `Player ${currentPlayer.id} wins!`;
    document.getElementById("winMessage").classList.remove("hidden");
    document.getElementById("rollDiceBtn").disabled = true;
    document.getElementById("resetGameBtn").disabled = false;
  } else {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    document.getElementById("playerStatus").innerText = `Player ${players[currentPlayerIndex].id}'s turn`;
    document.getElementById("rollDiceBtn").disabled = false;
  }
  drawBoard();
}

// Reset the game
function resetGame() {
  players = [
    { id: 1, position: 1, color: "blue" },
    { id: 2, position: 1, color: "red" }
  ];
  currentPlayerIndex = 0;
  gameOver = false;
  document.getElementById("diceResult").innerText = "";
  document.getElementById("playerStatus").innerText = "Player 1's turn";
  document.getElementById("winMessage").innerText = "";
  document.getElementById("winMessage").classList.add("hidden");
  document.getElementById("rollDiceBtn").disabled = false;
  document.getElementById("resetGameBtn").disabled = true;
  drawBoard();
}

// Initialize
resizeCanvas();
window.addEventListener("resize", resizeCanvas);
document.getElementById("resetGameBtn").disabled = true;
