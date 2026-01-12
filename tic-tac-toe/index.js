let origBoard;
let huPlayer = 'X';
let aiPlayer = 'O';
const winCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const cells = document.querySelectorAll('.cell');
const modal = document.getElementById('startModal');
const endgameDisplay = document.getElementById('endgame');

// Fungsi memulai game
function startGame(choice) {
  modal.style.display = "none";
  endgameDisplay.style.display = "none";
  
  huPlayer = choice;
  aiPlayer = choice === 'X' ? 'O' : 'X';
  
  origBoard = Array.from(Array(9).keys());
  
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
    cells[i].addEventListener('click', turnClick, false);
  }
  
  // Jika AI adalah 'X', AI jalan duluan
  if (aiPlayer === 'X') {
    turn(bestSpot(), aiPlayer);
  }
}

function turnClick(square) {
  if (typeof origBoard[square.target.dataset.index] == 'number') {
    turn(square.target.dataset.index, huPlayer);
    if (!checkWin(origBoard, huPlayer) && !checkTie()) {
      // Giliran komputer
      turn(bestSpot(), aiPlayer);
    }
  }
}

function turn(squareId, player) {
  origBoard[squareId] = player;
  document.querySelector(`[data-index='${squareId}']`).innerText = player;
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
}

function checkWin(board, player) {
  let plays = board.reduce((a, e, i) => 
    (e === player) ? a.concat(i) : a, []);
  let gameWon = null;
  for (let [index, win] of winCombos.entries()) {
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      gameWon = {index: index, player: player};
      break;
    }
  }
  return gameWon;
}

function gameOver(gameWon) {
  for (let index of winCombos[gameWon.index]) {
    document.querySelector(`[data-index='${index}']`).style.backgroundColor = 
      gameWon.player == huPlayer ? "green" : "red";
  }
  for (let i = 0; i < cells.length; i++) {
    cells[i].removeEventListener('click', turnClick, false);
  }
  declareWinner(gameWon.player == huPlayer ? "Kamu Menang!" : "Kamu Kalah.");
}

function declareWinner(who) {
  document.querySelector(".endgame .text").innerText = who;
  document.querySelector(".endgame").style.display = "flex";
  
  // Reset otomatis setelah 1.5 detik (sesuai user story)
  setTimeout(() => {
     modal.style.display = "flex"; // Kembali ke menu pilih
  }, 1500);
}

function checkTie() {
  if (emptySquares().length == 0) {
    for (let i = 0; i < cells.length; i++) {
      cells[i].style.backgroundColor = "orange";
      cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner("Seri!");
    return true;
  }
  return false;
}

function emptySquares() {
  return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
  return minimax(origBoard, aiPlayer).index;
}

function minimax(newBoard, player) {
  let availSpots = emptySquares();

  if (checkWin(newBoard, huPlayer)) {
    return {score: -10};
  } else if (checkWin(newBoard, aiPlayer)) {
    return {score: 10};
  } else if (availSpots.length === 0) {
    return {score: 0};
  }
  
  let moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    let move = {};
    move.index = newBoard[availSpots[i]];
    newBoard[availSpots[i]] = player;

    if (player == aiPlayer) {
      let result = minimax(newBoard, huPlayer);
      move.score = result.score;
    } else {
      let result = minimax(newBoard, aiPlayer);
      move.score = result.score;
    }

    newBoard[availSpots[i]] = move.index;
    moves.push(move);
  }

  let bestMove;
  if (player === aiPlayer) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}
