// --- 1. ИНИЦИАЛИЗАЦИЯ TELEGRAM ---
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Универсальная функция уведомлений
function showMessage(text) {
    alert(text);
}

// БЕЗОПАСНАЯ ИНИЦИАЛИЗАЦИЯ ADSGRAM
let AdController = null;
function initAds() {
    try {
        if (window.Adsgram) {
            AdController = window.Adsgram.init({ blockId: "20812" });
            console.log("Adsgram initialized");
        }
    } catch (e) {
        console.error("Adsgram init error:", e);
    }
}
initAds();

const userTelegramID = tg.initDataUnsafe.user ? tg.initDataUnsafe.user.id : "7849326904";
const botUsername = "sun_app_bot"; 

// --- 2. ДАННЫЕ ПРИЛОЖЕНИЯ ---
let balance = parseFloat(localStorage.getItem('sun_app_balance')) || 0.000000000;
let lastUpdateTime = parseInt(localStorage.getItem('sun_app_last_time')) || Date.now();
let transactions = JSON.parse(localStorage.getItem('sun_app_history')) || [];
let friends = JSON.parse(localStorage.getItem('sun_app_friends_list')) || [];
let completedTasks = JSON.parse(localStorage.getItem('sun_tasks_done')) || [];

const baseRate = 0.02; // Твои 2% в день

// --- 3. ЛОГИКА МАЙНИНГА И ОБНОВЛЕНИЯ ---
function calculateGrowth() {
    let now = Date.now();
    let passed = now - lastUpdateTime;
    
    if (passed > 0) {
        // Начисление: баланс * 2% * (прошедшее время в долях суток)
        let myEarn = (balance * baseRate) * (passed / 86400000);
        
        // Начисление от друзей (10% от их добычи)
        friends.forEach(f => {
            let fGain = (f.balance * baseRate) * (passed / 86400000);
            f.balance += fGain;
            balance += fGain * 0.10; 
        });

        balance += myEarn;
        lastUpdateTime = now;
        updateDisplay();
    }
}

function updateDisplay() {
    const mainBal = document.getElementById('main-balance');
    const wallBal = document.getElementById('my-footer-balance'); // Исправлено под твой HTML

    if(mainBal) mainBal.textContent = balance.toFixed(9);
    if(wallBal) wallBal.textContent = balance.toFixed(2);

    localStorage.setItem('sun_app_balance', balance);
    localStorage.setItem('sun_app_last_time', lastUpdateTime);
}

// --- 4. НАВИГАЦИЯ ---
function showTab(id, el) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    // Убираем подсветку со всех кнопок меню
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    // Показываем нужный экран
    const target = document.getElementById(id);
    if(target) target.classList.add('active');
    
    // Если нажали на элемент меню — подсвечиваем его
    if(el) {
        el.classList.add('active');
    }
}

// --- 5. РЕЙТИНГ И БОНУСЫ ---
function getBonus(rank) {
    if (rank === 1) return "+0.5%";
    if (rank === 2) return "+0.4%";
    if (rank === 3) return "+0.3%";
    if (rank >= 4 && rank <= 8) return "+0.2%";
    if (rank >= 9 && rank <= 15) return "+0.1%";
    return null;
}

function renderRating() {
    const container = document.getElementById('rating-list-container');
    if (!container) return;
    
    let html = '';
    for (let i = 1; i <= 50; i++) {
        const bonus = getBonus(i);
        const bonusHtml = bonus ? `<span class="bonus-badge">${bonus} Bonus</span>` : '';
        let cls = i === 1 ? 'top-1' : i === 2 ? 'top-2' : i === 3 ? 'top-3' : '';
        let icon = i === 1 ? '<i class="fas fa-crown"></i>' : i === 2 ? '<i class="fas fa-medal"></i>' : i === 3 ? '<i class="fas fa-award"></i>' : i;
        
        html += `<div class="rating-card ${cls}">
            <div class="rank-icon">${icon}</div>
            <div class="user-avatar-small"><img src="https://via.placeholder.com/35"></div>
            <div class="user-name-box">Player_${i*13}</div>
            <div class="user-points-box">
                ${bonusHtml}
                <div class="points-val">${(500/i).toFixed(2)} <i class="fas fa-gem"></i></div>
            </div>
        </div>`;
    }
    container.innerHTML = html;
}

// --- 6. ЗАДАНИЯ И РЕКЛАМА ---
async function watchAd() {
    if (!AdController) initAds();
    if (!AdController) {
        showMessage("Реклама загружается...");
        return;
    }

    AdController.show().then(() => {
        balance += 0.05;
        showMessage("Бонус +0.05 TON зачислен!");
        updateDisplay();
    }).catch(() => {
        showMessage("Реклама пока недоступна.");
    });
}

function doTask(taskId, link, reward) {
    if (completedTasks.includes(taskId)) {
        showMessage("Уже выполнено!");
        return;
    }
    tg.openTelegramLink(link);
    
    if (confirm("Вы подписались?")) {
        balance += reward;
        completedTasks.push(taskId);
        localStorage.setItem('sun_tasks_done', JSON.stringify(completedTasks));
        updateDisplay();
        showMessage(`Награда +${reward} TON получена!`);
    }
}

// --- 7. ПРИГЛАШЕНИЯ ---
function copyLink() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    navigator.clipboard.writeText(fullLink).then(() => showMessage("Ссылка скопирована!"));
}

function shareInvite() {
    const fullLink = `https://t.me/${botUsername}?start=${userTelegramID}`;
    const shareText = "Майни TON вместе со мной в ERA App! ☀️";
    const url = `https://t.me/share/url?url=${encodeURIComponent(fullLink)}&text=${encodeURIComponent(shareText)}`;
    tg.openTelegramLink(url);
}

// --- 8. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАПУСКЕ ---
function init() {
    renderRating();
    // Запускаем цикл майнинга (раз в секунду)
    setInterval(calculateGrowth, 1000);
}

document.addEventListener('DOMContentLoaded', init);
