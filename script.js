const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state
let players = [];
let currentPlayerIndex = 0;
let gameOver = false;
let isGameStarted = false;

// Snakes and ladders
const snakes = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};
const ladders = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
};

// Responsive canvas sizing
function resizeCanvas() {
  console.log("Resizing canvas...");
  const isMobile = window.innerWidth <= 500;
  canvas.width = isMobile ? 300 : 400;
  canvas.height = isMobile ? 300 : 400;
  if (isGameStarted) {
    console.log("Drawing board after resize...");
    drawBoard();
  }
}

// Draw the game board
function drawBoard() {
  if (!ctx) {
    console.error("Canvas context not available!");
    return;
  }
  console.log("Drawing board...");
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
    drawSnakeOrLadder(parseInt(start), parseInt(end), "snake", currentTileSize);
  });
  Object.entries(ladders).forEach(([start, end]) => {
    drawSnakeOrLadder(parseInt(start), parseInt(end), "ladder", currentTileSize);
  });
}

// Draw a snake (wavy line with head and scales) or ladder (parallel lines with rungs)
function drawSnakeOrLadder(start, end, type, tileSize) {
  const startCoord = getTileCenter(start);
  const endCoord = getTileCenter(end);
  ctx.strokeStyle = type === "snake" ? "red" : "green";
  ctx.lineWidth = tileSize / 10;

  if (type === "snake") {
    // Draw wavy snake path with scale-like dashes
    ctx.beginPath();
    ctx.setLineDash([tileSize / 8, tileSize / 8]); // Dash pattern for scales
    ctx.moveTo(startCoord.x, startCoord.y);
    const dx = endCoord.x - startCoord.x;
    const dy = endCoord.y - startCoord.y;
    const segments = 5;
    const waveAmplitude = tileSize / 2;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const prevT = (i - 1) / segments;
      const x = startCoord.x + dx * t;
      const y = startCoord.y + dy * t + waveAmplitude * Math.sin(t * Math.PI * 2);
      const controlX = startCoord.x + dx * prevT;
      const controlY = startCoord.y + dy * prevT + waveAmplitude * Math.sin(prevT * Math.PI * 2);
      ctx.quadraticCurveTo(controlX, controlY, x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash pattern

    // Draw snake head (triangle with eyes)
    const angle = Math.atan2(endCoord.y - startCoord.x, endCoord.x - startCoord.x);
    ctx.beginPath();
    ctx.moveTo(endCoord.x, endCoord.y);
    ctx.lineTo(
      endCoord.x - (tileSize / 3) * Math.cos(angle - Math.PI / 6),
      endCoord.y - (tileSize / 3) * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endCoord.x - (tileSize / 3) * Math.cos(angle + Math.PI / 6),
      endCoord.y - (tileSize / 3) * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();

    // Draw eyes
    const eyeOffset = tileSize / 8;
    ctx.beginPath();
    ctx.arc(
      endCoord.x - (tileSize / 4) * Math.cos(angle - Math.PI / 6),
      endCoord.y - (tileSize / 4) * Math.sin(angle - Math.PI / 6),
      tileSize / 20,
      0,
      Math.PI * 2
    );
    ctx.arc(
      endCoord.x - (tileSize / 4) * Math.cos(angle + Math.PI / 6),
      endCoord.y - (tileSize / 4) * Math.sin(angle + Math.PI / 6),
      tileSize / 20,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "white";
    ctx.fill();
  } else {
    // Draw ladder with two parallel lines and rungs
    const offset = tileSize / 8; // Distance between parallel lines
    const dx = endCoord.x - startCoord.x;
    const dy = endCoord.y - startCoord.y;
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;
    const offsetX = offset * Math.cos(perpAngle);
    const offsetY = offset * Math.sin(perpAngle);

    // Draw two parallel lines with shadow effect
    ctx.beginPath();
    ctx.moveTo(startCoord.x + offsetX, startCoord.y + offsetY);
    ctx.lineTo(endCoord.x + offsetX, endCoord.y + offsetY);
    ctx.strokeStyle = "green";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startCoord.x - offsetX, startCoord.y - offsetY);
    ctx.lineTo(endCoord.x - offsetX, endCoord.y - offsetY);
    ctx.strokeStyle = "#004d00"; // Darker green for shadow effect
    ctx.stroke();

    // Draw rungs (5 evenly spaced, thicker for wooden effect)
    const rungCount = 5;
    ctx.strokeStyle = "green";
    ctx.lineWidth = tileSize / 15;
    for (let i = 1; i < rungCount; i++) {
      const t = i / rungCount;
      const rungX = startCoord.x + dx * t;
      const rungY = startCoord.y + dy * t;
      ctx.beginPath();
      ctx.moveTo(rungX + offsetX, rungY + offsetY);
      ctx.lineTo(rungX - offsetX, rungY - offsetY);
      ctx.stroke();
    }

    // Draw arrowhead at the end (upward)
    const angleEnd = Math.atan2(endCoord.y - startCoord.y, endCoord.x - startCoord.x);
    ctx.beginPath();
    ctx.moveTo(endCoord.x, endCoord.y);
    ctx.lineTo(
      endCoord.x - (tileSize / 4) * Math.cos(angleEnd - Math.PI / 6),
      endCoord.y - (tileSize / 4) * Math.sin(angleEnd - Math.PI / 6)
    );
    ctx.lineTo(
      endCoord.x - (tileSize / 4) * Math.cos(angleEnd + Math.PI / 6),
      endCoord.y - (tileSize / 4) * Math.sin(angleEnd + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = "green";
    ctx.fill();
  }
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

// Draw dice face
function drawDiceFace(number, x, y, size) {
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#2c3e50";
  ctx.lineWidth = 2;
  ctx.fillRect(x, y, size, size);
  ctx.strokeRect(x, y, size, size);

  const dotSize = size / 10;
  const offset = size / 4;
  ctx.fillStyle = "#2c3e50";

  const positions = [
    [], // 0 (not used)
    [[0.5, 0.5]], // 1
    [[0.25, 0.25], [0.75, 0.75]], // 2
    [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]], // 3
    [[0.25, 0.25], [0.25, 0.75], [0.75, 0.25], [0.75, 0.75]], // 4
    [[0.25, 0.25], [0.25, 0.75], [0.5, 0.5], [0.75, 0.25], [0.75, 0.75]], // 5
    [[0.25, 0.25], [0.25, 0.5], [0.25, 0.75], [0.75, 0.25], [0.75, 0.5], [0.75, 0.75]] // 6
  ];

  positions[number].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x + dx * size, y + dy * size, dotSize, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Animate dice roll
function animateDiceRoll(finalNumber, callback) {
  const currentTileSize = canvas.width / 10;
  const diceSize = canvas.width / 4;
  const x = canvas.width / 2 - diceSize / 2;
  const y = canvas.height / 2 - diceSize / 2;
  let frame = 0;
  const totalFrames = 20; // ~1 second at 20fps

  function animate() {
    drawBoard(); // Redraw board to clear previous dice
    const randomFace = Math.floor(Math.random() * 6) + 1;
    drawDiceFace(randomFace, x, y, diceSize);
    frame++;
    if (frame < totalFrames) {
      setTimeout(() => requestAnimationFrame(animate), 50);
    } else {
      drawBoard();
      drawDiceFace(finalNumber, x, y, diceSize);
      setTimeout(() => {
        drawBoard();
        callback();
      }, 500); // Show final face for 0.5s before clearing
    }
  }
  requestAnimationFrame(animate);
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
  if (gameOver || !isGameStarted) {
    console.log("Roll dice blocked: gameOver =", gameOver, "isGameStarted =", isGameStarted);
    return;
  }

  const roll = Math.floor(Math.random() * 6) + 1;
  const currentPlayer = players[currentPlayerIndex];
  document.getElementById("diceResult").innerText = `Player ${currentPlayer.id} rolled: ${roll}`;
  document.getElementById("rollDiceBtn").disabled = true;

  animateDiceRoll(roll, () => {
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
  });
}
