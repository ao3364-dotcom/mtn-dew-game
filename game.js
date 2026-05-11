const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game state
let gameRunning = false;
let campaignMode = false;
let currentLevel = 1;

// Difficulty scaling
let enemyHP = 2;
let enemySpeed = 1.2;
let bossHP = 40;
let bossSpeed = 1;

// Sprites
const playerImg = new Image();
playerImg.src = "playerSprite.png";

const enemyImg = new Image();
enemyImg.src = "enemySprite.png";

const bossImg = new Image();
bossImg.src = "bossSprite.png";

// Player
const player = {
  x: canvas.width/2,
  y: canvas.height/2,
  size: 40,
  speed: 4,
  damage: 1
};

let keys = {};
let enemies = [];
let bullets = [];
let killCount = 0;
let bossAlive = false;

// Names
const enemyNames = [
  "Cola Blaster", "Fizz King", "Dr. Bepis",
  "Root Rage", "Cherry Chaos", "Vanilla Vandal"
];

const bossNames = [
  "Mountain Thunder", "Citrus Drop", "Hill Lightning",
  "Peak Storm", "Summit Surge"
];

// Input
document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

canvas.addEventListener("click", e => {
  if (!gameRunning) return;
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  bullets.push({ x: player.x, y: player.y, angle, speed: 8 });
});

// Start Campaign
function startCampaign() {
  document.getElementById("titleScreen").style.display = "none";
  gameRunning = true;
  campaignMode = true;
  currentLevel = 1;
  startLevel(currentLevel);
}

// Start a level
function startLevel(level) {
  enemies = [];
  bossAlive = false;

  enemyHP = 2 + level;
  enemySpeed = 1.2 + level * 0.1;

  bossHP = 40 + level * 20;
  bossSpeed = 1 + level * 0.05;

  spawnEnemies();
}

// Movement
function movePlayer() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;
}

// Enemy spawning
function spawnEnemies() {
  if (!gameRunning || bossAlive) return;

  const count = Math.floor(Math.random() * 4) + 2;

  for (let i = 0; i < count; i++) {
    enemies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 35,
      speed: enemySpeed,
      hp: enemyHP,
      name: enemyNames[Math.floor(Math.random()*enemyNames.length)]
    });
  }
}

// Boss spawning
function spawnBoss() {
  bossAlive = true;

  enemies.push({
    x: canvas.width/2,
    y: 50,
    size: 70,
    speed: bossSpeed,
    hp: bossHP,
    name: bossNames[(currentLevel - 1) % bossNames.length],
    boss: true
  });
}

// Movement logic
function moveEnemies() {
  enemies.forEach(e => {
    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    e.x += Math.cos(angle) * e.speed;
    e.y += Math.sin(angle) * e.speed;
  });
}

function moveBullets() {
  bullets.forEach(b => {
    b.x += Math.cos(b.angle) * b.speed;
    b.y += Math.sin(b.angle) * b.speed;
  });
}

// Collision
function checkCollisions() {
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      const dist = Math.hypot(b.x - e.x, b.y - e.y);
      if (dist < e.size) {
        e.hp -= player.damage;
        bullets.splice(bi, 1);

        if (e.hp <= 0) {
          enemies.splice(ei, 1);
          killCount++;

          if (e.boss) {
            bossAlive = false;
            currentLevel++;
            setTimeout(() => startLevel(currentLevel), 1500);
          }

          if (killCount % 20 === 0) showUpgradeMenu();
        }
      }
    });
  });
}

// Drawing
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (!gameRunning) return;

  ctx.drawImage(playerImg, player.x - player.size/2, player.y - player.size/2, player.size, player.size);

  enemies.forEach(e => {
    const img = e.boss ? bossImg : enemyImg;
    ctx.drawImage(img, e.x - e.size/2, e.y - e.size/2, e.size, e.size);

    ctx.fillStyle = "yellow";
    ctx.font = "14px sans-serif";
    ctx.fillText(e.name, e.x - 20, e.y - e.size);
  });

  bullets.forEach(b => {
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI*2);
    ctx.fill();
  });

  ctx.fillStyle = "lime";
  ctx.font = "20px sans-serif";
  ctx.fillText(`Kills: ${killCount}`, 20, 30);
  ctx.fillText(`Level: ${currentLevel}`, 20, 60);
}

// Upgrades
function showUpgradeMenu() {
  const box = document.getElementById("upgradeBox");
  box.style.display = "block";
  box.innerHTML = `
    <div><b>Choose an Upgrade:</b></div>
    <button onclick="upgrade('damage')">Extra Fizz (Damage +1)</button>
    <button onclick="upgrade('speed')">Sugar Rush (Speed +1)</button>
    <button onclick="upgrade('firerate')">Carbonation Burst (Faster Shots)</button>
    <button onclick="upgrade('hp')">Aluminum Reinforcement (More HP)</button>
  `;
}

function upgrade(type) {
  const box = document.getElementById("upgradeBox");
  box.style.display = "none";

  if (type === "damage") player.damage++;
  if (type === "speed") player.speed++;
  if (type === "firerate") bullets.forEach(b => b.speed += 1);
  if (type === "hp") player.size += 5;
}

// Game loop
setInterval(spawnEnemies, 2000);

function gameLoop() {
  if (gameRunning) {
    movePlayer();
    moveEnemies();
    moveBullets();
    checkCollisions();

    if (!bossAlive && enemies.length === 0) spawnBoss();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
