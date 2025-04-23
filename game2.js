// game2.js - Persistent Map and Travel Logic

let exploredLocations = [];
let availableLocations = [];
let lastTravelId = 0; // Prevent race condition in travel
const mapSVG = document.getElementById('map-svg');

// Load explored locations from save (if any)
function loadExploredLocations() {
  const saved = localStorage.getItem('exploredLocations');
  if (saved) {
    exploredLocations = JSON.parse(saved);
  }
}

// Save explored locations to localStorage
function saveExploredLocations() {
  localStorage.setItem('exploredLocations', JSON.stringify(exploredLocations));
}

// Update the SVG map with all explored locations
function updateSVGMap() {
  mapSVG.innerHTML = '';
  exploredLocations.forEach((loc, i) => {
    const x = 60 + (i % 4) * 150;
    const y = 60 + Math.floor(i / 4) * 80;

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 25);
    circle.setAttribute("fill", "#00838f");
    circle.setAttribute("stroke", "#004d40");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("cursor", "pointer");
    circle.addEventListener("click", () => enhancedTravelTo(loc));

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 5);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "#ffffff");
    text.setAttribute("font-size", "12");
    text.textContent = loc;

    mapSVG.appendChild(circle);
    mapSVG.appendChild(text);
  });
}

// Enhanced travelTo to handle persistent world
function enhancedTravelTo(location) {
  const currentTravelId = ++lastTravelId;
  currentLocation = location;
  sceneDescription.textContent = `Traveling to ${location}...`;

  setTimeout(() => {
    if (currentTravelId !== lastTravelId) return; // Cancel outdated travel

    const isFishingSpot = Math.random() < 0.5;
    const scenery = scenicDescriptions[Math.floor(Math.random() * scenicDescriptions.length)];
    areaDescriptionBox.textContent = `Location: ${location}\n${scenery}`;

    if (!exploredLocations.includes(location)) {
      exploredLocations.push(location);
      saveExploredLocations();
      updateSVGMap();
      removeLocationFromAvailable(location);
    }

    if (isFishingSpot) {
      startAutoFishing();
    } else {
      sceneDescription.textContent = `You've arrived at ${location}. ${scenery}`;
      stopAutoFishing();
    }

    renderLocationButtons();
  }, 1500);
}

// Remove explored location from available list
function removeLocationFromAvailable(location) {
  const [adj, feat] = location.split(' ');
  adjectives = adjectives.filter(a => a !== adj);
  features = features.filter(f => f !== feat);
}

// Render available location buttons (finite)
function renderLocationButtons() {
  mapContainer.innerHTML = '';

  if (adjectives.length === 0 || features.length === 0) {
    sceneDescription.textContent = "You've explored all known areas!";
    return;
  }

  const visibleLocations = [];
  for (let i = 0; i < 5; i++) {
    const loc = generateLocationName();
    if (!exploredLocations.includes(loc)) visibleLocations.push(loc);
  }

  visibleLocations.forEach(loc => {
    const div = document.createElement('div');
    div.className = 'location';
    div.textContent = loc;
    div.onclick = () => enhancedTravelTo(loc);
    mapContainer.appendChild(div);
  });
}

// Override original travelTo
window.travelTo = enhancedTravelTo;

// On game start, load and render SVG map
loadExploredLocations();
updateSVGMap();
