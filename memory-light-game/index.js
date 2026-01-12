const sounds = [
  new Audio('https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-1.mp3'),
  new Audio('https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-2.mp3'),
  new Audio('https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-3.mp3'),
  new Audio('https://cdn.freecodecamp.org/curriculum/take-home-projects/memory-light-game/sound-4.mp3')
];

let gameData = {
  power: false,
  strict: false,
  sequence: [],
  playerSequence: [],
  count: 0,
  lock: true
};

function togglePower() {
  gameData.power = document.getElementById('power-check').checked;
  const screen = document.getElementById('count-screen');
  screen.innerText = gameData.power ? "--" : "";
  if (!gameData.power) resetGameState();
}

function toggleStrict() {
  if (!gameData.power) return;
  gameData.strict = !gameData.strict;
  document.getElementById('strict-led').classList.toggle('strict-active');
}

function startGame() {
  if (!gameData.power) return;
  resetGameState();
  addToSequence();
}

function resetGameState() {
  gameData.sequence = [];
  gameData.playerSequence = [];
  gameData.count = 0;
}

function addToSequence() {
  gameData.count++;
  document.getElementById('count-screen').innerText = gameData.count;
  gameData.sequence.push(Math.floor(Math.random() * 4));
  playSequence();
}

function playSequence() {
  gameData.lock = true;
  let i = 0;
  const interval = setInterval(() => {
    lightUp(gameData.sequence[i]);
    i++;
    if (i >= gameData.sequence.length) {
      clearInterval(interval);
      gameData.lock = false;
    }
  }, 800);
}

function lightUp(id) {
  const pad = document.getElementById(id);
  pad.classList.add('active');
  sounds[id].currentTime = 0;
  sounds[id].play();
  setTimeout(() => pad.classList.remove('active'), 400);
}

function playerClick(id) {
  if (!gameData.power || gameData.lock) return;
  
  lightUp(id);
  gameData.playerSequence.push(id);
  
  const currentStep = gameData.playerSequence.length - 1;
  
  if (gameData.playerSequence[currentStep] !== gameData.sequence[currentStep]) {
    handleError();
    return;
  }
  
  if (gameData.playerSequence.length === gameData.sequence.length) {
    if (gameData.count === 20) {
      alert("Selamat! Anda Menang!");
      startGame();
    } else {
      gameData.playerSequence = [];
      gameData.lock = true;
      setTimeout(addToSequence, 1000);
    }
  }
}

function handleError() {
  const screen = document.getElementById('count-screen');
  screen.innerText = "!!";
  gameData.lock = true;
  
  if (gameData.strict) {
    setTimeout(startGame, 1000);
  } else {
    gameData.playerSequence = [];
    setTimeout(() => {
      screen.innerText = gameData.count;
      playSequence();
    }, 1000);
  }
}
