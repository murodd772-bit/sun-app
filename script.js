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
let transactions = JSON.parse(localStorage.getItem('sun_app_history')) || [];
let friends = JSON.parse(localStorage.getItem('sun_app_friends_list')) || [];
let completedTasks = JSON.parse(localStorage.getItem('sun_tasks_done')) || [];

// Настройки рейтинга и бонусов
const MY_RANK = 4203; // Ваш статический ранг для примера

function getRatingBonus(rank) {
    if (rank === 1) return 0.005;  // +0.5%
    if (rank === 2) return 0.004;  // +0.4%
    if (rank === 3) return 0.003;  // +0.3%
    if (rank >= 4 && rank <= 8) return 0.002; // +0.2%
    if (rank >= 9 && rank <= 15) return 0.001; // +0.1%
    return 0;
}

// --- 3. ЛОГИКА МАЙНИНГА ---
function getCurrentRate() {
    const baseRate = 0.01; // 1% база
    const friendBonus = friends.length * 0.001;
    const rankBonus = getRatingBonus(MY_RANK); 
    
    let totalRate = baseRate + friendBonus + rankBonus;
    return Math.min(totalRate, 0.025); // Ограничим макс. доходность 2.5%
}

function calculateGrowth() {
    let now = Date.now();
    let passed = now - lastUpdateTime;
    
    if (passed > 0) {
        let rate = getCurrentRate();
        let myEarn = (balance * rate) * (passed / 86400000);
        
        balance += myEarn;
        lastUpdateTime = now;
        updateDisplay();
    }
}

function updateDisplay() {
    const mainBal = document.getElementById('main-balance');
    const wallBal = document.getElementById('wallet-balance-val'); // Для кошелька
    const footerBal = document.getElementById('my-footer-balance'); // Для липкой панели в топе
    const speedB = document.getElementById('speed-badge');
    const myBonusBadge = document.getElementById('my-bonus-val');

    if(mainBal) mainBal.textContent = balance.toFixed(9);
    if(wallBal) wallBal.textContent = balance.toFixed(4) + " TON";
    if(footerBal) footerBal.textContent = balance.toFixed(2);
    
    if(speedB) {
        speedB.textContent = `+${(getCurrentRate() * 100).toFixed(2)}% в день`;
    }
    
    if(myBonusBadge) {
        const bonus = getRatingBonus(MY_RANK) * 100;
        myBonusBadge.textContent = `+${bonus.toFixed(1)}%`;
    }

    // Сохранение
    localStorage.setItem('sun_app_balance', balance);
    localStorage.setItem('sun_app_last_time', lastUpdateTime);
}

// --- 4. РЕЙТИНГ (ТОП-15) ---
function renderRating() {
    const container = document.getElementById('rating-list-container');
    if(!container) return;

    let html = '';
    // Генерируем 50 ботов для примера
    for (let i = 1; i <= 50; i++) {
        const bonusVal = getRatingBonus(i);
        const bonusHtml = bonusVal > 0 ? `<span class="bonus-badge">+${(bonusVal*100).toFixed(1)}% Bonus</span>` : '';
        
        let rankClass = '';
        let icon = i;
        if(i === 1) { rankClass = 'top-1'; icon = '👑'; }
        else if(i === 2) { rankClass = 'top-2'; icon = '🥈'; }
        else if(i === 3) { rankClass = 'top-3'; icon = '🥉'; }

        html += `
            <div class="rating-card ${rankClass}">
                <div class="rank-icon">${icon}</div>
                <div class="user-avatar-small"><img src="https://via.placeholder.com/35" alt=""></div>
                <div class="user-name-box">Player_${i * 123}</div>
                <div class="user-points-box">
                    ${bonusHtml}
                    <div class="points-val">${(1000/i).toFixed(2)} TON</div>
                </div>
            </div>`;
    }
    container.innerHTML = html;
}

// --- 5. НАВИГАЦИЯ ---
function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    if(el) el.classList.add('active');

    // Если открыли вкладку рейтинга - рендерим его
    if(id === 'wallet') {
        renderRating();
    }
}

// --- 6. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (Задания, Рефка, Модалки) ---

async function watchAd() {
    if (!AdController) initAds();
    if (!AdController) {
        showMessage("Загрузка рекламы...");
        return;
    }
    AdController.show().then(() => {
        balance += 0.05;
        updateDisplay();
        showMessage("Бонус +0.05 TON зачислен!");
    }).catch(() => showMessage("Реклама недоступна"));
}

function doTask(taskId, link, reward) {
    if (completedTasks.includes(taskId)) return showMessage("Уже выполнено!");
    if (link !== "#") tg.openTelegramLink(link);
    
    if (confirm("Вы выполнили задание?")) {
        balance += reward;
        completedTasks.push(taskId);
        localStorage.setItem('sun_tasks_done', JSON.stringify(completedTasks));
        updateDisplay();
    }
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

function openModal(id) { document.getElementById(id + 'Modal').style.display = 'flex'; }
function closeModal() { document.querySelectorAll('.overlay').forEach(e => e.style.display = 'none'); }

// --- ИНИЦИАЛИЗАЦИЯ ---
function init() {
    const linkField = document.getElementById('ref-link-text');
    if (linkField) linkField.textContent = `https://t.me/${botUsername}?start=${userTelegramID}`;
    
    updateDisplay();
    setInterval(calculateGrowth, 1000); // Обновляем раз в секунду для плавности
}

document.addEventListener('DOMContentLoaded', init);

let balance = parseFloat(localStorage.getItem('sun_balance')) || 5.0;
let lastUpdate = Date.now();
const COMMISSION = 0.10; // 10% только для игр

function updateDisplay() {
    document.getElementById('main-balance').textContent = balance.toFixed(9);
    document.getElementById('my-footer-balance').textContent = balance.toFixed(2);
    localStorage.setItem('sun_balance', balance);
}

// Майнинг
setInterval(() => {
    let now = Date.now();
    balance += (balance * 0.01) * ((now - lastUpdate) / 86400000);
    lastUpdate = now;
    updateDisplay();
}, 1000);

function showTab(id, el) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(el) el.classList.add('active');
    if(id === 'wallet') renderRating();
}

// --- ИГРА: COIN FLIP (С КОМИССИЕЙ) ---
function playCoinFlip() {
    if (balance < 0.1) return alert("Минимум 0.1 TON");
    balance -= 0.1;
    let win = Math.random() > 0.5;
    if (win) {
        let prize = 0.2 * (1 - COMMISSION); // 0.18 TON
        balance += prize;
        alert(`Победа! Зачислено ${prize.toFixed(2)} TON (Комиссия 10%)`);
    } else {
        alert("Проигрыш!");
    }
    updateDisplay();
}

// --- ИГРА: ПОСЛЕДНИЙ ГЕРОЙ (С КОМИССИЕЙ) ---
let heroActive = false;
let heroTime = 300;
let heroBank = 0;
let heroInt;
let lastPl = "bot";

function joinHeroGame() {
    if (balance < 0.1) return alert("Нужно 0.1 TON");
    balance -= 0.1;
    if (!heroActive) {
        heroBank = 0.2; 
        heroActive = true;
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
                    alert(`Вы выиграли ${finalPrize.toFixed(2)} TON (Комиссия 10%)`);
                }
                heroActive = false;
                heroTime = 300;
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
    document.getElementById('hero-timer').textContent = `${m}:${s<10?'0'+s:s}`;
    document.getElementById('hero-bank').textContent = `Банк: ${heroBank.toFixed(2)} TON`;
    document.getElementById('hero-status').textContent = lastPl === "me" ? "Лидер: Вы" : "Лидер: Соперник";
}

// --- РЕКЛАМА (БЕЗ КОМИССИИ) ---
function watchAd() {
    // Если Adsgram подключен, начисляем полные 0.05
    balance += 0.05;
    alert("Награда 0.05 TON зачислена полностью!");
    updateDisplay();
}

function renderRating() {
    const container = document.getElementById('rating-list-container');
    container.innerHTML = `
        <div class="rating-card top-1"><div class="rank-badge">👑</div> SARDOR <div class="user-score">1357.45 TON</div></div>
        <div class="rating-card top-2"><div class="rank-badge">2</div> Alexis <div class="user-score">1005.29 TON</div></div>
    `;
}
