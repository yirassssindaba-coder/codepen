// --- Konfigurasi Game ---
const CANVAS_SIZE = 600;
const CELL_SIZE = 10; // Ukuran sel dalam pixel
const COLS = CANVAS_SIZE / CELL_SIZE;
const ROWS = CANVAS_SIZE / CELL_SIZE;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const randomBtn = document.getElementById('random-btn');
const generationCountSpan = document.getElementById('generation-count');

let gameInterval = null;
let currentGeneration = 0;
let grid = createEmptyGrid();

// Warna
const LIVE_COLOR = '#4CAF50';
const DEAD_COLOR = '#333';

// --- Fungsi Grid ---
function createEmptyGrid() {
  return Array(ROWS).fill(null)
    .map(() => Array(COLS).fill(0));
}

function randomizeGrid() {
  grid = createEmptyGrid();
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      grid[row][col] = Math.random() > 0.7 ? 1 : 0; // 30% chance to be alive
    }
  }
}

// --- Fungsi Rendering ---
function drawGrid() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      ctx.beginPath();
      ctx.rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.fillStyle = grid[row][col] ? LIVE_COLOR : DEAD_COLOR;
      ctx.fill();
      // Optional: Add grid lines if needed
      // ctx.strokeStyle = '#555';
      // ctx.stroke();
    }
  }
}

// --- Logika Game of Life ---
function updateGeneration() {
  const nextGrid = createEmptyGrid();

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const liveNeighbors = countLiveNeighbors(row, col);
      const isAlive = grid[row][col] === 1;

      if (isAlive) {
        // Aturan 1 & 3: Underpopulation (<2) or Overpopulation (>3)
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          nextGrid[row][col] = 0; // Dies
        } else {
          nextGrid[row][col] = 1; // Lives on
        }
      } else {
        // Aturan 4: Reproduction (exactly 3 neighbors)
        if (liveNeighbors === 3) {
          nextGrid[row][col] = 1; // Becomes alive
        }
      }
    }
  }
  
  grid = nextGrid;
  currentGeneration++;
  generationCountSpan.innerText = currentGeneration;
  drawGrid();
}

function countLiveNeighbors(row, col) {
  let count = 0;
  // Check all 8 neighbors
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      // Handle wrapping edges (toroidal array)
      const neighborRow = (row + i + ROWS) % ROWS;
      const neighborCol = (col + j + COLS) % COLS;

      count += grid[neighborRow][neighborCol];
    }
  }
  return count;
}

// --- Kontrol UI ---
function startGame() {
  if (!gameInterval) {
    gameInterval = setInterval(updateGeneration, 100); // Update every 100ms
    startBtn.disabled = true;
  }
}

function stopGame() {
  clearInterval(gameInterval);
  gameInterval = null;
  startBtn.disabled = false;
}

function clearBoard() {
  stopGame();
  grid = createEmptyGrid();
  currentGeneration = 0;
  generationCountSpan.innerText = currentGeneration;
  drawGrid();
}

function handleRandomize() {
  stopGame();
  randomizeGrid();
  currentGeneration = 0;
  generationCountSpan.innerText = currentGeneration;
  drawGrid();
}

// User Story: Set up the board by clicking cells
canvas.addEventListener('click', (event) => {
    if (gameInterval) return; // Prevent clicking while running
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        grid[row][col] = grid[row][col] ? 0 : 1; // Toggle state
        drawGrid();
    }
});

// --- Inisialisasi ---
startBtn.addEventListener('click', startGame);
stopBtn.addEventListener('click', stopGame);
clearBtn.addEventListener('click', clearBoard);
randomBtn.addEventListener('click', handleRandomize);

// User Story: Randomly generate a board and start playing on arrival
handleRandomize();
startGame();
