// Game Constants
const JOBS = [
    { id: 'scrapper', name: 'Alley Scrapper', pay: 50, healthCost: 10, happinessCost: 5, req: 0 },
    { id: 'courier', name: 'Neon Courier', pay: 120, healthCost: 5, happinessCost: 10, req: 500 },
    { id: 'hacker', name: 'Data Miner', pay: 300, healthCost: 2, happinessCost: 20, req: 2000 }
];

const NPCS = [
    { id: 'nova', name: 'Nova', archetype: 'Street Doc', affinity: 0, status: 'Stranger' },
    { id: 'jax', name: 'Jax', archetype: 'Nightclub DJ', affinity: 0, status: 'Stranger' },
    { id: 'echo', name: 'Echo', archetype: 'Cyborg Artist', affinity: 0, status: 'Stranger' }
];

// Game State
let gameState = {
    name: "",
    gender: "",
    day: 1,
    money: 1000,
    health: 100,
    happiness: 100,
    currentJob: null,
    socialLinks: JSON.parse(JSON.stringify(NPCS))
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active-screen'));
    document.getElementById(screenId).classList.add('active-screen');
}

function setGender(g) {
    gameState.gender = g;
    document.querySelectorAll('.gender-btn').forEach(btn => {
        const btnText = btn.innerText.toUpperCase();
        const targetText = g.toUpperCase().substring(0,3);
        btn.style.borderColor = btnText.includes(targetText) ? '#00f2ff' : '#374151';
        btn.style.color = btnText.includes(targetText) ? '#00f2ff' : 'white';
    });
}

function logAction(text) {
    const log = document.getElementById('action-log');
    if (!log) return;
    const entry = document.createElement('div');
    entry.innerText = `> ${text}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function showMessage(text) {
    const box = document.getElementById('message-box');
    if (!box) return;
    box.innerText = text;
    box.classList.remove('hidden');
    setTimeout(() => box.classList.add('hidden'), 3000);
}

function startGame() {
    const nameInput = document.getElementById('input-name').value.trim();
    if (!nameInput) return showMessage("Please enter a name.");
    if (!gameState.gender) return showMessage("Please select a gender.");

    gameState.name = nameInput;
    // Ensure social links are fresh for a new game
    gameState.socialLinks = JSON.parse(JSON.stringify(NPCS));
    
    refreshUI();
    showScreen('screen-game');
    logAction(`Citizen ${gameState.name} registered. Biological profile: ${gameState.gender}.`);
}

// --- Core Mechanics ---

function work(jobId) {
    const job = JOBS.find(j => j.id === jobId);
    if (gameState.health < job.healthCost) return showMessage("Too exhausted to work!");
    
    gameState.money += job.pay;
    gameState.health -= job.healthCost;
    gameState.happiness -= job.happinessCost;
    gameState.day++;
    
    logAction(`Worked as ${job.name}. Earned ${job.pay} credits. Day ${gameState.day} starts.`);
    refreshUI();
}

function interact(npcId) {
    const npc = gameState.socialLinks.find(n => n.id === npcId);
    if (!npc) return;
    if (gameState.money < 50) return showMessage("Need 50 credits to hang out.");
    
    gameState.money -= 50;
    npc.affinity += 10;
    
    if (npc.affinity >= 100) npc.status = "In Love";
    else if (npc.affinity >= 50) npc.status = "Close Friend";
    else if (npc.affinity >= 20) npc.status = "Acquaintance";

    logAction(`Spent time with ${npc.name}. Relationship improved to: ${npc.status}.`);
    refreshUI();
}

function refreshUI() {
    // Stats
    const nameEl = document.getElementById('display-name');
    const genderEl = document.getElementById('display-gender');
    const moneyEl = document.getElementById('display-money');
    const dayEl = document.getElementById('display-day');
    
    if (nameEl) nameEl.innerText = gameState.name || "---";
    if (genderEl) genderEl.innerText = gameState.gender || "";
    if (moneyEl) moneyEl.innerText = (gameState.money || 0).toLocaleString();
    if (dayEl) dayEl.innerText = gameState.day || 1;
    
    // Health Bars
    const hVal = document.getElementById('val-health');
    const hBar = document.getElementById('bar-health');
    const sVal = document.getElementById('val-happiness');
    const sBar = document.getElementById('bar-happiness');

    if (hVal) hVal.innerText = `${Math.max(0, gameState.health)}%`;
    if (hBar) hBar.style.width = `${Math.max(0, gameState.health)}%`;
    if (sVal) sVal.innerText = `${Math.max(0, gameState.happiness)}%`;
    if (sBar) sBar.style.width = `${Math.max(0, gameState.happiness)}%`;

    // Render Jobs
    const jobList = document.getElementById('job-list');
    if (jobList) {
        jobList.innerHTML = JOBS.map(job => `
            <div class="flex justify-between items-center p-2 border border-gray-700 rounded hover:bg-cyan-900/20 transition-all">
                <div>
                    <div class="font-bold text-sm">${job.name}</div>
                    <div class="text-[10px] text-gray-500 uppercase">Pay: ${job.pay} | Health: -${job.healthCost}</div>
                </div>
                <button onclick="work('${job.id}')" 
                    class="px-3 py-1 text-xs border border-cyan-600 rounded hover:bg-cyan-600 hover:text-black">
                    WORK
                </button>
            </div>
        `).join('');
    }

    // Render Social
    const socialList = document.getElementById('social-list');
    if (socialList && gameState.socialLinks) {
        socialList.innerHTML = gameState.socialLinks.map(npc => `
            <div class="flex justify-between items-center bg-gray-900/30 p-3 rounded">
                <div>
                    <div class="font-bold text-pink-400">${npc.name} <span class="text-[10px] text-gray-500">[${npc.archetype}]</span></div>
                    <div class="text-[10px] uppercase text-gray-400">Bond: ${npc.affinity}% | Status: ${npc.status}</div>
                </div>
                <button onclick="interact('${npc.id}')" 
                    class="px-3 py-1 text-xs border border-pink-600 text-pink-500 rounded hover:bg-pink-600 hover:text-white">
                    INTERACT (50₵)
                </button>
            </div>
        `).join('');
    }
}

// --- Save/Load Logic ---
function triggerFileLoad() {
    const input = document.getElementById('file-input');
    if (input) input.click();
}

function loadSaveFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const loadedState = JSON.parse(e.target.result);
            if (loadedState.name && loadedState.gender) {
                gameState = loadedState;
                // Patch missing social links for legacy saves
                if (!gameState.socialLinks) {
                    gameState.socialLinks = JSON.parse(JSON.stringify(NPCS));
                }
                refreshUI();
                showScreen('screen-game');
                showMessage("Save file loaded successfully.");
            } else {
                throw new Error("Invalid save format");
            }
        } catch (err) {
            showMessage("Error: Corrupted save file.");
        }
    };
    reader.readAsText(file);
}

function exportSave() {
    const dataStr = JSON.stringify(gameState, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `neon_life_save_${(gameState.name || 'unnamed').toLowerCase()}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showMessage("Save exported to your PC.");
}
