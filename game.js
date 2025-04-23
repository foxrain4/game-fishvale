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
let lastTravelId = 0;

function generateLocationName() {
  return adjectives[Math.floor(Math.random() * adjectives.length)] + ' ' + features[Math.floor(Math.random() * features.length)];
}

function generateFishName() {
  return fishTraits[Math.floor(Math.random() * fishTraits.length)] + ' ' + fishTypes[Math.floor(Math.random() * fishTypes.length)];
}

function travelTo(location) {
  const currentTravelId = ++lastTravelId;
  currentLocation = location;
  sceneDescription.textContent = `Exploring ${location}...`;

  setTimeout(() => {
    if (currentTravelId !== lastTravelId) return; // Cancel outdated travel

    const isFishingSpot = Math.random() < 0.5;
    const scenery = scenicDescriptions[Math.floor(Math.random() * scenicDescriptions.length)];
    areaDescriptionBox.textContent = `Location: ${location}\n${scenery}`;

    if (isFishingSpot) {
      startAutoFishing();
    } else {
      sceneDescription.textContent = `You've arrived at ${location}. ${scenery}`;
      stopAutoFishing();
    }

    addExploredLocation(location);
    updateSVGMap();
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
  stopAutoFishing(); // Ensure fishing isn't running on load
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
    generateAllLocations();
    renderMap();
    updateSVGMap();
  })
  .catch(err => {
    console.error("Failed to load game data:", err);
    sceneDescription.textContent = "Error loading game data.";
  });
