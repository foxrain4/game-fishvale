let adjectives = [], features = [], fishTraits = [], fishTypes = [], lootItems = [], scenicDescriptions = [];

const mapContainer = document.getElementById('map');
const sceneDescription = document.getElementById('scene-description');
const areaDescriptionBox = document.getElementById('area-description');
const statsDisplay = document.getElementById('stats');
const inventoryDisplay = document.getElementById('inventory');
const worldMapSVG = document.getElementById('world-map');

let playerStats = {
  gold: 0,
  experience: 0,
  inventory: [],
  discoveredLocations: []
};

let currentLocation = "";
let autoFishingInterval;
let remainingLocations = [];

function generateLocationName() {
  if (remainingLocations.length === 0) return null;
  return remainingLocations.splice(Math.floor(Math.random() * remainingLocations.length), 1)[0];
}

function generateFishName() {
  return fishTraits[Math.floor(Math.random() * fishTraits.length)] + ' ' + fishTypes[Math.floor(Math.random() * fishTypes.length)];
}

function renderMap() {
  mapContainer.innerHTML = '';
  const visibleLocations = Array.from({ length: 5 }, generateLocationName).filter(Boolean);
  if (visibleLocations.length === 0) {
    sceneDescription.textContent = "You've explored all known areas. You've completed your adventure!";
    return;
  }
  visibleLocations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'location';
    div.textContent = loc;
    div.onclick = () => travelTo(loc);
    mapContainer.appendChild(div);
  });
}

function updateMapVisualization() {
  worldMapSVG.innerHTML = '';
  playerStats.discoveredLocations.forEach((loc, i) => {
    const x = 50 + (i % 5) * 100;
    const y = 50 + Math.floor(i / 5) * 100;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 20);
    circle.setAttribute('fill', '#00838f');
    circle.style.cursor = 'pointer';
    circle.onclick = () => travelTo(loc);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', y + 5);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'white');
    label.setAttribute('font-size', '12px');
    label.textContent = loc;

    worldMapSVG.appendChild(circle);
    worldMapSVG.appendChild(label);
  });
}

function travelTo(location) {
  currentLocation = location;
  if (!playerStats.discoveredLocations.includes(location)) {
    playerStats.discoveredLocations.push(location);
    updateMapVisualization();
  }
  sceneDescription.textContent = `Exploring ${location}...`;
  setTimeout(() => {
    const isFishingSpot = Math.random() < 0.5;
    const scenery = scenicDescriptions[Math.floor(Math.random() * scenicDescriptions.length)];
    areaDescriptionBox.textContent = `Location: ${location}\n${scenery}`;

    if (isFishingSpot) {
      startAutoFishing();
    } else {
      sceneDescription.textContent = `You've arrived at ${location}. ${scenery}`;
      stopAutoFishing();
    }
    renderMap();
  }, 1500);
}

function startFishing() {
  const caught = generateFishName();
  let baseGold = Math.floor(Math.random() * 10) + 1;
  let baseXP = Math.floor(Math.random() * 5) + 1;

  let bonusGold = 0;
  let bonusXP = 0;

  playerStats.inventory.forEach(item => {
    if (item.includes("Coin") || item.includes("Scale")) {
      bonusGold += Math.floor(1 + playerStats.experience / 50);
    }
    if (item.includes("Rod") || item.includes("Hook")) {
      bonusXP += Math.floor(1 + playerStats.experience / 50);
    }
  });

  const earnedGold = baseGold + bonusGold;
  const earnedXP = baseXP + bonusXP;

  playerStats.gold += earnedGold;
  playerStats.experience += earnedXP;

  sceneDescription.textContent = `You caught a ${caught}! (+${earnedGold} gold, +${earnedXP} XP)`;

  sceneDescription.classList.remove('fish-caught-animation', 'loot-found-animation');
  void sceneDescription.offsetWidth;
  sceneDescription.classList.add('fish-caught-animation');

  if (Math.random() < 0.5 && playerStats.inventory.length < 6) {
    let loot = lootItems[Math.floor(Math.random() * lootItems.length)];
    if (loot.includes("Rod") || loot.includes("Hook")) {
      loot = loot + " (Bonus)";
    }
    playerStats.inventory.push(loot);

    sceneDescription.classList.remove('fish-caught-animation', 'loot-found-animation');
    void sceneDescription.offsetWidth;
    sceneDescription.classList.add('loot-found-animation');
  }

  updateStats();
  saveGame();
}

function startAutoFishing() {
  stopAutoFishing();
  startFishing();
  autoFishingInterval = setInterval(startFishing, 5000);
}

function stopAutoFishing() {
  if (autoFishingInterval) {
    clearInterval(autoFishingInterval);
    autoFishingInterval = null;
  }
}

function updateStats() {
  statsDisplay.innerHTML = `
    <strong>Stats</strong><br>
    Gold: ${playerStats.gold}<br>
    Experience: ${playerStats.experience}
  `;

  let inventoryHTML = '<strong>Inventory</strong><br>';
  for (let i = 0; i < 6; i++) {
    if (playerStats.inventory[i]) {
      let bonus = "";
      if (playerStats.inventory[i].includes("Coin") || playerStats.inventory[i].includes("Scale")) {
        bonus = `(+${Math.floor(1 + playerStats.experience / 100)} gold)`;
      }
      if (playerStats.inventory[i].includes("Rod") || playerStats.inventory[i].includes("Hook")) {
        bonus = `(+${Math.floor(1 + playerStats.experience / 100)} XP)`;
      }
      inventoryHTML += `<div>${playerStats.inventory[i]} ${bonus} <button onclick="deleteItem(${i})">Sell</button></div>`;
    } else {
      inventoryHTML += `<div>Empty Slot</div>`;
    }
  }
  inventoryDisplay.innerHTML = inventoryHTML;
}

function deleteItem(index) {
  const item = playerStats.inventory[index];
  let goldEarned = 0;

  if (item.includes("Coin")) goldEarned = 10;
  else if (item.includes("Scale")) goldEarned = 15;
  else if (item.includes("Rod")) goldEarned = 20;
  else if (item.includes("Hook")) goldEarned = 25;
  else if (item.includes("Pendant")) goldEarned = 50;
  else if (item.includes("Compass")) goldEarned = 5;
  else if (item.includes("Cap")) goldEarned = 3;
  else if (item.includes("Bait")) goldEarned = 7;
  else if (item.includes("Note")) goldEarned = 2;

  goldEarned = Math.max(goldEarned, 1);

  playerStats.gold += goldEarned;
  playerStats.inventory.splice(index, 1);
  updateStats();
  saveGame();
}

function saveGame() {
  localStorage.setItem('fishvaleSave', JSON.stringify(playerStats));
}

function loadGame() {
  const save = localStorage.getItem('fishvaleSave');
  if (save) {
    playerStats = JSON.parse(save);
  }
  updateStats();
  updateMapVisualization();
}

function resetGame() {
  localStorage.removeItem('fishvaleSave');
  playerStats = { gold: 0, experience: 0, inventory: [], discoveredLocations: [] };
  updateStats();
  renderMap();
  updateMapVisualization();
  sceneDescription.textContent = 'Starting a new adventure...';
  areaDescriptionBox.textContent = '';
  stopAutoFishing();
}

fetch('game-data.json')
  .then(res => res.json())
  .then(data => {
    adjectives = data.adjectives;
    features = data.features;
    fishTraits = data.fishTraits;
    fishTypes = data.fishTypes;
    lootItems = data.lootItems;
    scenicDescriptions = data.scenicDescriptions;

    // Build list of all possible unique location names once
    remainingLocations = adjectives.flatMap(adj => features.map(feat => `${adj} ${feat}`));

    loadGame();
    renderMap();
  })
  .catch(err => {
    console.error("Failed to load game data:", err);
    sceneDescription.textContent = "Error loading game data.";
  });
