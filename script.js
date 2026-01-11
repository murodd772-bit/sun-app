// --- 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM ---
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

function showMessage(text) {
    alert(text);
}

// БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ ADSGRAM
let AdController = null;
function initAds() {
    try {
        if (window.Adsgram) {
            AdController = window.Adsgram.init({ blockId: "20812" });
        }
    } catch (e) {
        console.error("Adsgram init error:", e);
    }
}
initAds();

const userTelegramID = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";
const botUsername = "sun_app_bot"; 

// --- 2. ДАННЫЕ ПРИЛОЖЕНИЯ ---
let balance = parseFloat(localStorage.getItem('sun_app_balance')) || 10.0;
let lastUpdateTime = parseInt(localStorage.getItem('sun_app_last_time')) || Date.now();
let completedTasks = JSON.parse(localStorage.getItem('sun_tasks_done')) || [];
const COMMISSION = 0.10; // 10% только для игр
const MY_RANK = 4203;

// --- 3. ЛОГИКА МАЙНИНГА ---
function getRatingBonus(rank) {
    if (rank === 1) return 0.005; 
    if (rank === 2) return 0.004; 
    if (rank === 3) return 0.003; 
    if (rank >= 4 && rank <= 8) return 0.002;
    if (rank >= 9 && rank <= 15) return 0.001;
    return 0;
}

function getCurrentRate() {
    const baseRate = 0.01; 
    const rankBonus = getRatingBonus(MY_RANK); 
    return Math.min(baseRate + rankBonus, 0.025);
}

function calculateGrowth() {
    let now = Date.now();
    let passed = now - lastUpdateTime;
    if (passed > 0) {
        let rate = getCurrentRate();
        balance += (balance * rate) * (passed / 86400000);
        lastUpdateTime = now;
        updateDisplay();
    }
}

function updateDisplay() {
    const mainBal = document.getElementById('main-balance');
    const footerBal = document.getElementById('my-footer-balance');
    const speedB = document.getElementById('speed-badge');

    if(mainBal) mainBal.textContent = balance.toFixed(9);
    if(footerBal) footerBal.textContent = balance.toFixed(2);
    if(speedB) speedB.textContent = `+${(getCurrentRate() * 100).toFixed(2)}% в день`;

    localStorage.setItem('sun_app_balance', balance);
    localStorage.setItem('sun_app_last_time', lastUpdateTime);
}

// --- 4. НАВИГАЦИЯ ---
function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    // Если нажали на кнопку в меню, подсвечиваем её
    if(el) {
        el.classList.add('active');
    } else {
        // Если перешли программно (например, в историю), ищем кнопку вручную
        // Это предотвратит ошибку если el не передан
    }

    if(id === 'wallet') renderRating();
}

// --- 5. ИГРЫ (С КОМИССИЕЙ 10%) ---
function playCoinFlip() {
    if (balance < 0.1) return showMessage("Минимум 0.1 TON");
    balance -= 0.1;
    let win = Math.random() > 0.5;
    if (win) {
        let prize = 0.2 * (1 - COMMISSION); 
        balance += prize;
        showMessage(`Победа! Зачислено ${prize.toFixed(2)} TON (Комиссия 10%)`);
    } else {
        showMessage("Проигрыш!");
    }
    updateDisplay();
}

let heroActive = false;
let heroTime = 300;
let heroBank = 0;
let heroInt;
let lastPl = "bot";

function joinHeroGame() {
    if (balance < 0.1) return showMessage("Нужно 0.1 TON");
    balance -= 0.1;
    if (!heroActive) {
        heroActive = true;
        heroBank = 0.2;
        lastPl = "me";
        document.getElementById('hero-timer').style.display = 'block';
        document.getElementById('hero-bank').style.display = 'block';
        heroInt = setInterval(() => {
            heroTime--;
            if (heroTime <= 0) {
                clearInterval(heroInt);
                if (lastPl === "me") {
                    let finalPrize = heroBank * (1 - COMMISSION);
                    balance += finalPrize;
                    showMessage(`Вы выиграли ${finalPrize.toFixed(2)} TON (Комиссия 10%)`);
                }
                heroActive = false;
                heroTime = 300;
                document.getElementById('hero-timer').style.display = 'none';
                document.getElementById('hero-bank').style.display = 'none';
            }
            updateHeroUI();
        }, 1000);
    } else {
        heroBank += 0.1;
        heroTime += 15;
        lastPl = "me";
    }
    updateDisplay();
}

function updateHeroUI() {
    let m = Math.floor(heroTime / 60), s = heroTime % 60;
    const timerEl = document.getElementById('hero-timer');
    const bankEl = document.getElementById('hero-bank');
    const statusEl = document.getElementById('hero-status');
    
    if(timerEl) timerEl.textContent = `${m}:${s<10?'0'+s:s}`;
    if(bankEl) bankEl.textContent = `Банк: ${heroBank.toFixed(2)} TON`;
    if(statusEl) statusEl.textContent = lastPl === "me" ? "Лидер: Вы" : "Лидер: Соперник";
}

// --- 6. РЕЙТИНГ ---
function renderRating() {
    const container = document.getElementById('rating-list-container');
    if(!container) return;
    container.innerHTML = `
        <div class="rating-card top-1"><div class="rank-badge">👑</div> SARDOR <div class="user-score">1357.45 TON</div></div>
        <div class="rating-card top-2"><div class="rank-badge">🥈</div> Alexis <div class="user-score">1005.29 TON</div></div>
        <div class="rating-card top-3"><div class="rank-badge">🥉</div> Player_777 <div class="user-score">850.00 TON</div></div>
    `;
}

// --- 7. РЕКЛАМА И ЗАДАНИЯ ---
async function watchAd() {
    if (AdController) {
        AdController.show().then(() => {
            balance += 0.05;
            updateDisplay();
            showMessage("Награда 0.05 TON зачислена!");
        }).catch(() => showMessage("Реклама пока недоступна"));
    } else {
        // Для теста если нет Adsgram
        balance += 0.05;
        updateDisplay();
        showMessage("Тестовая награда 0.05 TON!");
    }
}

// --- 8. МОДАЛКИ И КОПИРОВАНИЕ ---
function openModal(id) { 
    const modal = document.getElementById(id);
    if(modal) modal.style.display = 'flex'; 
}
function closeModal() { 
    document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); 
}

function copyLink() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    navigator.clipboard.writeText(fullLink).then(() => showMessage("Ссылка скопирована!"));
}

function shareInvite() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=Майни TON со мной!`;
    tg.openTelegramLink(url);
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    const linkField = document.getElementById('ref-link-text');
    if (linkField) linkField.textContent = `https://t.me/${botUsername}?start=${userTelegramID}`;
    
    updateDisplay();
    setInterval(calculateGrowth, 1000); 
});
