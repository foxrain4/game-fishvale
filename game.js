// game.js

let adjectives = [], features = [], fishTraits = [], fishTypes = [], lootItems = [], scenicDescriptions = [];

const mapContainer = document.getElementById('map');
const sceneDescription = document.getElementById('scene-description');
const areaDescriptionBox = document.getElementById('area-description');
const statsDisplay = document.getElementById('stats');
const inventoryDisplay = document.getElementById('inventory');

let playerStats = {
  gold: 0,
  experience: 0,
  inventory: []
};

let currentLocation = "";
let autoFishingInterval;

function generateLocationName() {
  return adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + features[Math.floor(Math.random() * features.length)];
}

function generateFishName() {
  return fishTraits[Math.floor(Math.random() * fishTraits.length)] + ' ' + fishTypes[Math.floor(Math.random() * fishTypes.length)];
}

function renderMap() {
  mapContainer.innerHTML = '';
  const visibleLocations = Array.from({ length: 5 }, generateLocationName);
  visibleLocations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'location';
    div.textContent = loc;
    div.onclick = () => travelTo(loc);
    mapContainer.appendChild(div);
  });
}

function travelTo(location) {
  currentLocation = location;
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

  // Calculate bonuses based on inventory items
  playerStats.inventory.forEach(item => {
    if (item.includes("Coin") || item.includes("Scale")) {
      bonusGold += Math.floor(1 + playerStats.experience / 100);  // Increment bonus gold
    }
    if (item.includes("Rod") || item.includes("Hook")) {
      bonusXP += Math.floor(1 + playerStats.experience / 100);  // Increment bonus XP
    }
  });

  // Final calculations for earned gold and XP
  const earnedGold = baseGold + bonusGold;
  const earnedXP = baseXP + bonusXP;

  playerStats.gold += earnedGold;
  playerStats.experience += earnedXP;

  sceneDescription.textContent = `You caught a ${caught}! (+${earnedGold} gold, +${earnedXP} XP)`;

  // Apply fishing animation for visual feedback
  sceneDescription.classList.remove('fish-caught-animation', 'loot-found-animation');
  void sceneDescription.offsetWidth;  // Trigger reflow to reset animation
  sceneDescription.classList.add('fish-caught-animation');

  // Random loot chance (20% chance to find an item if there is space in the inventory)
  if (Math.random() < 0.2 && playerStats.inventory.length < 6) {
    const loot = lootItems[Math.floor(Math.random() * lootItems.length)];
    playerStats.inventory.push(loot);

    // Apply loot-found animation for feedback
    sceneDescription.classList.remove('fish-caught-animation', 'loot-found-animation');
    void sceneDescription.offsetWidth;
    sceneDescription.classList.add('loot-found-animation');
  }

  // Update stats on the screen and save the game state
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
      inventoryHTML += `<div>${playerStats.inventory[i]} ${bonus} <button onclick="deleteItem(${i})">X</button></div>`;
    } else {
      inventoryHTML += `<div>Empty Slot</div>`;
    }
  }
  inventoryDisplay.innerHTML = inventoryHTML;
}

function deleteItem(index) {
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
}

function resetGame() {
  localStorage.removeItem('fishvaleSave');
  playerStats = { gold: 0, experience: 0, inventory: [] };
  updateStats();
  renderMap();
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

    loadGame();
    renderMap();
  })
  .catch(err => {
    console.error("Failed to load game data:", err);
    sceneDescription.textContent = "Error loading game data.";
  });
