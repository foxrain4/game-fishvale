// game.js

const adjectives = ["Silent", "Golden", "Twilight", "Foggy", "Crimson", "Misty", "Sunset", "Hidden", "Windy", "Lush"];
const features = ["Cove", "Lagoon", "Creek", "Bay", "Marsh", "River", "Pier", "Glen", "Fjord", "Terrace"];
const fishTraits = ["Golden", "Spotted", "Glowing", "Shadow", "Amber", "Silver", "Velvet", "Dusky", "Wander", "Fire"];
const fishTypes = ["Trout", "Koi", "Snapper", "Minnow", "Perch", "Bass", "Cod", "Ray", "Catfish", "Eel"];
const lootItems = ["Old Cap", "Silver Hook", "Lucky Coin", "Magic Bait", "Rusty Compass", "Ruby Scale", "Bottle Note", "Fishing Rod", "Ancient Pendant"];
const scenicDescriptions = [
  "You pause to admire the golden hues dancing on the water's surface.",
  "A gentle breeze rustles the reeds, filling you with calm.",
  "You feel small, yet peaceful among the towering cliffs.",
  "The sound of trickling water soothes your soul.",
  "You breathe in the earthy aroma of moss-covered stones."
];

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

  // Loot bonuses scale with experience
  let bonusGold = 0;
  let bonusXP = 0;
  playerStats.inventory.forEach(item => {
    if (item.includes("Coin") || item.includes("Scale")) {
      bonusGold += Math.floor(1 + playerStats.experience / 100);
    }
    if (item.includes("Rod") || item.includes("Hook")) {
      bonusXP += Math.floor(1 + playerStats.experience / 100);
    }
  });

  const earnedGold = baseGold + bonusGold;
  const earnedXP = baseXP + bonusXP;

  playerStats.gold += earnedGold;
  playerStats.experience += earnedXP;

  sceneDescription.textContent = `You caught a ${caught}! (+${earnedGold} gold, +${earnedXP} XP)`;

  if (Math.random() < 0.2 && playerStats.inventory.length < 6) {
    const loot = lootItems[Math.floor(Math.random() * lootItems.length)];
    playerStats.inventory.push(loot);
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

loadGame();
renderMap();
