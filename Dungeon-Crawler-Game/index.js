const canvas = document.getElementById('dungeon');
const ctx = canvas.getContext('2d');

// Konfigurasi Game
const TILE_SIZE = 40;
const MAP_SIZE = 40; // 40x40 tiles
const VIEW_RADIUS = 3; // Fog of War radius

const TILES = { WALL: 0, FLOOR: 1, PLAYER: 2, ENEMY: 3, HEALTH: 4, WEAPON: 5, BOSS: 6 };
const WEAPONS = [
  { name: "Stick", dmg: 5 }, { name: "Rusty Knife", dmg: 12 },
  { name: "Iron Sword", dmg: 22 }, { name: "Dragon Slayer", dmg: 40 }
];

let player = { x: 0, y: 0, hp: 100, lvl: 1, xp: 0, weaponIdx: 0, visible: [] };
let map = [];
let entities = []; // Musuh, item, dll.

// 1. Generate Peta (Random Simple Dungeon)
function initGame() {
  // Isi semua dengan tembok
  map = Array(MAP_SIZE).fill().map(() => Array(MAP_SIZE).fill(TILES.WALL));
  
  // Buat jalan acak (Drunken Walk algorithm)
  let cx = 20, cy = 20;
  for(let i=0; i<600; i++) {
    map[cy][cx] = TILES.FLOOR;
    let dir = Math.floor(Math.random() * 4);
    if(dir === 0 && cy > 1) cy--;
    else if(dir === 1 && cy < MAP_SIZE-2) cy++;
    else if(dir === 2 && cx > 1) cx--;
    else if(dir === 3 && cx < MAP_SIZE-2) cx++;
  }

  // Tempatkan Player
  placeEntity(TILES.PLAYER);
  // Tempatkan Items & Enemies
  for(let i=0; i<8; i++) placeEntity(TILES.ENEMY);
  for(let i=0; i<5; i++) placeEntity(TILES.HEALTH);
  for(let i=1; i<4; i++) placeEntity(TILES.WEAPON, i);
  placeEntity(TILES.BOSS);
  
  updateStats();
  draw();
}

function placeEntity(type, extra = null) {
  let x, y;
  do {
    x = Math.floor(Math.random() * MAP_SIZE);
    y = Math.floor(Math.random() * MAP_SIZE);
  } while (map[y][x] !== TILES.FLOOR);
  
  if(type === TILES.PLAYER) { player.x = x; player.y = y; }
  else entities.push({ x, y, type, extra, hp: (type === TILES.BOSS ? 200 : 30) });
}

// 2. Logic Pergerakan & Combat
window.addEventListener('keydown', e => {
  let dx = 0, dy = 0;
  if(e.key === 'ArrowUp') dy = -1;
  if(e.key === 'ArrowDown') dy = 1;
  if(e.key === 'ArrowLeft') dx = -1;
  if(e.key === 'ArrowRight') dx = 1;

  if(dx !== 0 || dy !== 0) movePlayer(dx, dy);
});

function movePlayer(dx, dy) {
  let nx = player.x + dx;
  let ny = player.y + dy;

  if(map[ny][nx] === TILES.WALL) return;

  const entityIdx = entities.findIndex(e => e.x === nx && e.y === ny);
  if(entityIdx !== -1) {
    handleInteractions(entityIdx);
  } else {
    player.x = nx;
    player.y = ny;
  }
  draw();
}

function handleInteractions(idx) {
  const e = entities[idx];
  if(e.type === TILES.HEALTH) {
    player.hp += 25;
    entities.splice(idx, 1);
    log("Mendapat Medkit! +25 HP");
  } else if(e.type === TILES.WEAPON) {
    player.weaponIdx = e.extra;
    entities.splice(idx, 1);
    log("Mendapat Senjata: " + WEAPONS[player.weaponIdx].name);
  } else if(e.type === TILES.ENEMY || e.type === TILES.BOSS) {
    // Combat
    let pDmg = Math.floor(Math.random() * WEAPONS[player.weaponIdx].dmg) + (player.lvl * 5);
    let eDmg = Math.floor(Math.random() * (e.type === TILES.BOSS ? 30 : 10));
    
    e.hp -= pDmg;
    player.hp -= eDmg;
    
    if(e.hp <= 0) {
      if(e.type === TILES.BOSS) alert("SELAMAT! Anda mengalahkan BOSS dan menang!");
      entities.splice(idx, 1);
      player.xp += 20;
      if(player.xp >= player.lvl * 50) { player.lvl++; log("Level Up!"); }
    }
  }
  
  if(player.hp <= 0) {
    alert("Game Over! Mencoba lagi...");
    location.reload();
  }
  updateStats();
}

// 3. Rendering & Fog of War
function draw() {
  ctx.clearRect(0,0, canvas.width, canvas.height);
  
  // Offset agar player selalu di tengah kanvas
  let offX = canvas.width/2 - player.x * TILE_SIZE;
  let offY = canvas.height/2 - player.y * TILE_SIZE;

  for(let y=0; y<MAP_SIZE; y++) {
    for(let x=0; x<MAP_SIZE; x++) {
      let dist = Math.sqrt((x-player.x)**2 + (y-player.y)**2);
      if(dist > VIEW_RADIUS) continue; // Fog of War

      ctx.fillStyle = map[y][x] === TILES.WALL ? "#333" : "#777";
      ctx.fillRect(x*TILE_SIZE + offX, y*TILE_SIZE + offY, TILE_SIZE-1, TILE_SIZE-1);
    }
  }

  // Draw Entities
  entities.forEach(e => {
    let dist = Math.sqrt((e.x-player.x)**2 + (e.y-player.y)**2);
    if(dist > VIEW_RADIUS) return;

    if(e.type === TILES.ENEMY) ctx.fillStyle = "red";
    else if(e.type === TILES.HEALTH) ctx.fillStyle = "green";
    else if(e.type === TILES.WEAPON) ctx.fillStyle = "orange";
    else if(e.type === TILES.BOSS) ctx.fillStyle = "purple";
    ctx.fillRect(e.x*TILE_SIZE + offX, e.y*TILE_SIZE + offY, TILE_SIZE-1, TILE_SIZE-1);
  });

  // Draw Player
  ctx.fillStyle = "blue";
  ctx.fillRect(player.x*TILE_SIZE + offX, player.y*TILE_SIZE + offY, TILE_SIZE-1, TILE_SIZE-1);
}

function updateStats() {
  document.getElementById('hp').innerText = player.hp;
  document.getElementById('weapon').innerText = WEAPONS[player.weaponIdx].name;
  document.getElementById('lvl').innerText = player.lvl;
  document.getElementById('xp').innerText = player.xp;
}

function log(m) { document.getElementById('msg').innerText = m; }

initGame();
